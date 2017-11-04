// @flow

import {Level, ProgramState} from '.'
import type {ASTNodeLocation} from '.'

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

export type ProgramScoring = {
	score:   number,
	message: ?string
}

export type Instruction = 'move' | {turn: TurnDirection}
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

	state:   ProgramState
	scoring: ProgramScoring

	//------
	// State

	defaultState() {
		return new ProgramState(this, {
			position:       this.level.startPosition,
			direction:      this.level.startDirection,
			items:          [...this.level.items],
			failedPosition: null,
			apples:         0
		})
	}


	//------
	// Reset & run

	reset() {
		this.state = this.defaultState()
	}

	runWithStepCallback(step: (state: ProgramState) => Instruction) {
		while (!this.state.isFinished && this.steps.length < 500) {
			const instruction = step(this.state)
			this.perform(instruction)
		}
	}

	//------
	// Interface

	interfaceMethods = ['perform', 'stepCount', 'move', 'turn', 'isFinished', 'getState']

	get interface(): Object {
		const iface = {}
		for (const method of this.interfaceMethods) {
			iface[method] = this[method].bind(this)
		}
		return iface
	}

	perform(instruction: Instruction) {
		if (instruction === 'move') {
			this.move()
		} else if (instruction.turn === 'left' || instruction.turn === 'right') {
			this.turn(instruction.turn)
		} else {
			throw new TypeError(`Unsupported instruction: ${JSON.stringify(instruction)}`)
		}
	}

	stepCount() {
		return this.steps.length
	}

	getState() {
		return this.state
	}

	isFinished(): boolean {
		return this.state.isFinished
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

		if (!this.state.canMoveTo(x, y)) {
			this.state.failedPosition = {x, y}
			return false
		}

		this.state.position = {x, y}

		const item = this.state.itemAt(x, y)
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

	//------
	// Actions

	prepareState() {
		this.state.failedPosition = null
	}

	afterAction() {
		if (this.recordingStep != null) {
			this.recordingStep.actionPerformed = true
		}

		if (this.isFinished()) {
			this.scoring = this.calculateScoring()
		} else {
			this.scoring = null
		}
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
		const state = this.state.clone()
		if (this.recordingStep != null) {
			this.recordingStep.endState = state
		}

		const step = {codeLocation, startState: state, endState: state, actionPerformed: false}
		this.steps.push(step)
		this.recordingStep = step
	}

	stopRecording() {
		if (this.recordingStep == null) { return }

		this.recordingStep.endState = this.state.clone()
		this.recordingStep = null
	}

	//------
	// Scoring

	get meaningfulCode(): string {
		const lines = this.code.split('\n')

		let start = null
		const ranges = []
		for (const [i, line] of lines.entries()) {
			if (line.indexOf('----') !== -1) {
				start = i
			}
			if (start != null && line.indexOf('++++') !== -1) {
				ranges.push({start, end: i + 1})
				start = null
			}
		}

		for (const {start, end} of ranges.reverse()) {
			lines.splice(start, end - start)
		}

		return lines
			.filter(line => !/^\s*(\/\/.*)?$/.test(line))
			.join('\n')
	}

	get linesOfCode(): number {
		return this.meaningfulCode.split('\n').length
	}

	calculateScoring() {
		for (const {score, message, condition} of this.level.scoring) {
			if (condition(this)) {
				return {score, message}
			}
		}

		return {score: 3, message: null}
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