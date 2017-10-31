// @flow

import {Level} from '.'
import type {Position, Direction} from '.'

export type Step<T: any[]> = {
	action: (...args: T) => void,
	args:   T,
	line:   ?number
}

export type ProgramState = {
	position:  Position,
	direction: Direction,
	apples:    number
}

export type TurnDirection = 'left' | 'right'

export default class Program {

	//------
	// Constructor

	constructor(level: Level) {
		this.level = level
		this.state = this.defaultState()
	}

	level: Level
	state: ProgramState

	defaultState() {
		return {
			position:  this.level.startPosition,
			direction: this.level.startDirection,
			apples:    0
		}
	}

	//------
	// Interface

	interfaceMethods = ['move', 'turn', 'isFinished', 'robotAt', 'position', 'itemAt']

	@recordable
	move() {
		let {x, y} = this.state.position

		switch (this.state.direction) {
		case 'up':    y -= 1; break
		case 'down':  y += 1; break
		case 'left':  x -= 1; break
		case 'right': x += 1; break
		}

		if (!this.canMoveTo(x, y)) { return false }
		this.state.position = {x, y}

		const item = this.level.itemAt(x, y)
		if (item != null && item.type === 'apple') {
			this.state.apples += 1
			this.level.removeItem(item)
			return 'happy'
		}

		return true
	}

	@recordable
	turn(direction: TurnDirection) {
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
		if (x < 0 || x > this.level.columns) { return false }
		if (y < 0 || y > this.level.rows) { return false }

		const item = this.level.itemAt(x, y)
		return item == null || !item.blocking
	}

	itemAt(x: number, y: number) {
		return this.level.itemAt(x, y)
	}

	position(): Position {
		return this.state.position
	}

	isFinished(): boolean {
		const {goalPosition} = this.level
		if (goalPosition == null) { return false }

		const {x, y} = goalPosition
		if (!this.robotAt(x, y)) { return false }

		if (this.level.goalApples == null) { return true }
		return this.state.apples === this.level.goalApples
	}

	//------
	// Replay

	steps: Step<*>[]    = []
	currentStepIndex = 0

	reset() {
		this.state = this.defaultState()
		this.level.reset()
		this.currentStepIndex = 0
	}

	record<T: any[]>(action: (...args: T) => void, args: T, line: ?number) {
		if (action.recordable) {
			this.steps.push({action, args, line})
			this.currentStepIndex = this.steps.length
		}

		return action.apply(this, args)
	}

	step(): [?Step<*>, boolean] {
		if (this.done) { return [null, false] }

		const step = this.steps[this.currentStepIndex]
		const result = step.action.apply(this, step.args)
		this.currentStepIndex++

		return [step, result]
	}

	get done(): boolean {
		return this.currentStepIndex >= this.steps.length
	}

}

function recordable(target: Class<Program>, key: string, descriptor: Object) {
	const {value} = descriptor
	value.recordable = true
}