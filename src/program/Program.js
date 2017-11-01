// @flow

import {Level} from '.'
import type {Position, Direction, ASTNodeLocation} from '.'

export type Step = {
	start:   ASTNodeLocation,
	end:     ASTNodeLocation,
	actions: Action<*>[]
}

export type Action<T: any[]> = {
	method: ?((...args: T) => void),
	args:   T,
}

export type ProgramState = {
	position:       Position,
	direction:      Direction,
	failedPosition: ?Position,
	apples:         number
}

export type ProgramResult =  {
	finished:        boolean,
	atGoal:          boolean,
	hasEnoughApples: boolean,

	score:   number,
	message: ?string,

	state: ProgramState,
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

	defaultState() {
		return {
			position:       this.level.startPosition,
			direction:      this.level.startDirection,
			failedPosition: null,
			apples:         0
		}
	}

	//------
	// Interface

	interfaceMethods = ['move', 'turn', 'isFinished', 'robotAt', 'position', 'itemAt']

	@recordable
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

		const item = this.level.itemAt(x, y)
		if (item != null && item.type === 'apple') {
			this.state.apples += 1
			this.level.removeItem(item)
		}

		return true
	}

	@recordable
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

	robotAt(x: number, y: number) {
		return x === this.state.position.x && y === this.state.position.y
	}

	canMoveTo(x: number, y: number) {
		if (x < 0 || x >= this.level.columns) { return false }
		if (y < 0 || y >= this.level.rows) { return false }

		const item = this.level.itemAt(x, y)
		return item == null || !item.blocking
	}

	itemAt(x: number, y: number) {
		return this.level.itemAt(x, y)
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

	get result(): ProgramResult {
		return {
			finished:        this.isFinished(),
			atGoal:          this.isAtGoal(),
			hasEnoughApples: this.hasEnoughApples(),
			state:           this.state,

			...this.applyScoring()
		}
	}

	applyScoring() {
		for (const {score, message, condition} of this.level.scoring) {
			if (condition(this)) {
				return {score, message}
			}
		}

		return {score: 3, message: null}
	}

	//------
	// Record && replay

	steps: Step[]        = []
	recordingStep:? Step = null
	currentStepIndex     = 0

	reset() {
		this.state = this.defaultState()
		this.level.reset()
		this.currentStepIndex = 0
	}

	recordStep(start: ASTNodeLocation, end: ASTNodeLocation) {
		const step = {start, end, actions: []}
		this.steps.push(step)
		this.recordingStep = step
		this.currentStepIndex = this.steps.length
	}

	recordAction<T: any[]>(method: (...args: T) => void, args: T, line: ?number) {
		const {recordingStep} = this
		if (recordingStep == null || !method.recordable) { return }

		recordingStep.actions.push({method, args})
		return this.performAction(method, args)
	}

	step(): [?Step, boolean] {
		if (this.done || this.isFinished()) {
			this.prepState()
			return [null, this.isFinished()]
		}

		const step = this.steps[this.currentStepIndex]
		const result = this.performStep(step)
		this.currentStepIndex++

		return [step, result]
	}

	performStep(step: Step) {
		let retval = true
		for (const {method, args} of step.actions) {
			retval = this.performAction(method, args)
		}
		return retval
	}

	performAction<T: any[]>(method: (...args: T) => void, args: T, line: ?number) {
		this.prepState()
		return method.apply(this, args)
	}

	prepState() {
		this.state.failedPosition = null
	}

	get done(): boolean {
		return this.currentStepIndex >= this.steps.length
	}

}

function recordable(target: Class<Program>, key: string, descriptor: Object) {
	const {value} = descriptor
	value.recordable = true
}