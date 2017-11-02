// @flow

import {Level} from '.'
import type {Position, Direction, ASTNodeLocation} from '.'
import cloneDeep from 'lodash/cloneDeep'

export type Step = {
	codeLocation: {
		start: ASTNodeLocation,
		end:   ASTNodeLocation,
	},
	startState:      ProgramState,
	endState:        ProgramState,
	actionPerformed: boolean
}

export type Action<T: any[]> = {
	method: ?((...args: T) => void),
	args:   T,
}

export type ProgramState = {
	position:       Position,
	direction:      Direction,
	failedPosition: ?Position,

	apples:          number,

	finished:        boolean,
	atGoal:          boolean,
	hasEnoughApples: boolean,

	scoring: ProgramScoring
}

export type ProgramScoring = {
	score:   number,
	message: ?string
}

export type TurnDirection = 'left' | 'right'

export default class Program {

	//------
	// Constructor

	constructor(level: Level, code: string) {
		this.level = level
		this.code  = code
		this.state = this.defaultState()
	}

	level: Level
	code:  string
	state: ProgramState

	defaultState() {
		return {
			position:       this.level.startPosition,
			direction:      this.level.startDirection,
			items:          [...this.level.items],
			failedPosition: null,
			apples:         0
		}
	}

	get meaningfulCode(): string {
		return this.code
			.split('\n')
			.filter(line => !/^\s*(\/\/.*)?$/.test(line))
			.join('\n')
	}

	get linesOfCode(): number {
		const lines = this.code
			.split('\n')
			.filter(line => !/^\s*(\/\/.*)?$/.test(line))

		return lines.length
	}

	cloneState() {
		return cloneDeep(this.state)
	}

	reset() {
		this.state = this.defaultState()
	}

	//------
	// Interface

	interfaceMethods = ['move', 'turn', 'isFinished', 'robotAt', 'position', 'itemAt']

	get interface(): Object {
		const iface = {}
		for (const method of this.interfaceMethods) {
			iface[method] = this[method].bind(this)
		}
		return iface
	}

	@action
	move(): boolean {
		let {x, y} = this.state.position

		switch (this.state.direction) {
		case 'up':    y -= 1; break
		case 'down':  y += 1; break
		case 'left':  x -= 1; break
		case 'right': x += 1; break
		}

		if (!this.canMoveTo(x, y)) {
			this.state.failedPosition = {x, y}
			return false
		}

		this.state.position = {x, y}

		const item = this.itemAt(x, y)
		if (item != null && item.type === 'apple') {
			this.state.apples += 1
			this.state.items = this.state.items.filter(i => i !== item)
		}

		return true
	}

	@action
	turn(direction: TurnDirection): boolean {
		let newDir
		switch (this.state.direction) {
		case 'up':    newDir = direction === 'left' ? 'left' : 'right'; break
		case 'down':  newDir = direction === 'left' ? 'right' : 'left'; break
		case 'left':  newDir = direction === 'left' ? 'down' : 'up'; break
		case 'right': newDir = direction === 'left' ? 'up' : 'down'; break
		}

		this.state.direction = newDir
		return true
	}

	prepareState() {
		this.state.failedPosition = null
	}

	afterAction() {
		if (this.recordingStep != null) {
			this.recordingStep.actionPerformed = true
		}

		this.state.finished        = this.isFinished()
		this.state.atGoal          = this.isAtGoal()
		this.state.hasEnoughApples = this.hasEnoughApples()
		
		if (this.isFinished()) {
			this.state.scoring = this.calculateScoring()
		} else {
			this.state.scoring = null
		}
	}

	robotAt(x: number, y: number) {
		return x === this.state.position.x && y === this.state.position.y
	}

	canMoveTo(x: number, y: number) {
		if (x < 0 || x >= this.level.columns) { return false }
		if (y < 0 || y >= this.level.rows) { return false }

		const item = this.itemAt(x, y)
		return item == null || !item.blocking
	}

	itemAt(x: number, y: number): ?Item {
		return this.state.items.find(({position}) => position.x === x && position.y === y)
	}

	position(): Position {
		return this.state.position
	}

	isAtGoal(): boolean {
		const {goalPosition} = this.level
		if (goalPosition == null) { return false }

		const {x, y} = goalPosition
		return this.robotAt(x, y)
	}

	hasEnoughApples(): boolean {
		if (this.level.goalApples == null) { return true }
		return this.state.apples >= this.level.goalApples
	}

	isFinished(): boolean {
		return this.isAtGoal() && this.hasEnoughApples()
	}

	calculateScoring() {
		for (const {score, message, condition} of this.level.scoring) {
			if (condition(this)) {
				return {score, message}
			}
		}

		return {score: 3, message: null}
	}

	//------
	// Recording

	steps: Step[] = []
	recordingStep: ?Step = null

	startRecording() {
		this.steps = []
		this.recordingStep = null
	}

	recordStep(codeLocation: {start: ASTNodeLocation, end: ASTNodeLocation}) {
		const state = this.cloneState()
		if (this.recordingStep != null) {
			this.recordingStep.endState = state
		}

		const step = {codeLocation, startState: state, endState: state, actionPerformed: false}
		this.steps.push(step)
		this.recordingStep = step
	}

	stopRecording() {
		if (this.recordingStep == null) { return }
		
		this.recordingStep.endState = this.cloneState()
		this.recordingStep = null
	}

}

function action(target: Class<Program>, key: string, descriptor: Object) {
	return {
		...descriptor,
		value: wrapAction(descriptor.value)
	}
}

function wrapAction(fn: Function) {
	return function wrapped() {
		this.prepareState()
		fn.apply(this, arguments)
		this.afterAction()
	}
}