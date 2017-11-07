// @flow

import cloneDeep from 'lodash/cloneDeep'
import type {Item, KeyColor} from '.'

export type Position  = {x: number, y: number}
export type Direction = 'up' | 'down' | 'left' | 'right'

export type TextBalloon = {position: Position, text: string, style?: 'monospace'}

export default class ProgramState {

	constructor(program: Program, initialValues: Object = {}) {
		Object.defineProperty(this, 'program', {value: program, writable: false, enumerable: false, configurable: false})
		Object.defineProperty(this, 'level', {value: program.level, writable: false, enumerable: false, configurable: false})

		Object.assign(this, initialValues)
	}

	static default(program: Program, keyValues?: {[color: KeyColor]: ?mixed}) {
		return new ProgramState(program, {
			position:  program.level.startPosition,
			direction: program.level.startDirection,
			apples:    0,
			keys:      {},

			stepFailed:     false,
			failedPosition: null,
			roverBalloon:   null,
			itemBalloons:   [],
			items:          [...program.level.items],
			keyValues:      keyValues || program.level.generateKeyValuesSample()
		})
	}

	program: Program
	level:   Level

	static visibleProperties: {[key: string]: boolean} = {}

	//------
	// Visible state

	@visible()
	position: Position = {x: 0, y: 0}

	@visible()
	direction: Direction = 'up'

	@visible()
	apples: number = 0

	@visible()
	keys: {[color: KeyColor]: mixed} = {}

	//------
	// Invisible state (not shown in StateInspector)

	stepFailed:     boolean = false
	roverBalloon:   ?TextBalloon = null
	itemBalloons:   TextBalloon[] = []
	failedPosition: ?Position = null
	items:          Item[] = []
	keyValues:      {[color: KeyColor]: ?mixed} = {}

	clone(): ProgramState {
		const values = cloneDeep(this)
		return new ProgramState(this.program, values)
	}

	prepare() {
		this.stepFailed = false
		this.failedPosition = null
		this.roverBalloon = null
		this.itemBalloons = []
	}

	//------
	// Rover

	roverAt(x: number, y: number): boolean {
		return this.position.x === x && this.position.y === y
	}

	facing(direction: Direction) {
		return this.direction === direction
	}

	get facingPosition(): Position {
		let {x, y} = this.position

		switch (this.direction) {
		case 'up':    y -= 1; break
		case 'down':  y += 1; break
		case 'left':  x -= 1; break
		case 'right': x += 1; break
		}

		return {x, y}
	}

	//------
	// Items

	itemAt(x: number, y: number): ?Item {
		return this.items.find(({position}) => position.x === x && position.y === y)
	}

	canMoveTo(x: number, y: number) {
		if (x < 0 || x >= this.level.columns) { return false }
		if (y < 0 || y >= this.level.rows) { return false }

		const item = this.itemAt(x, y)
		return item == null || !item.blocking
	}

	//------
	// Finished

	@enumerable()
	@visible()
	get isFinished(): boolean {
		return this.isAtGoal && this.hasEnoughApples !== false
	}

	@enumerable()
	@visible()
	get isAtGoal(): boolean {
		const {goalPosition} = this.level
		if (goalPosition == null) { return false }

		return this.position.x === goalPosition.x && this.position.y === goalPosition.y
	}

	@enumerable()
	@visible()
	get hasEnoughApples(): ?boolean {
		if (!this.level.hasApples) { return undefined }
		if (this.level.goalApples == null) { return true }
		return this.apples >= this.level.goalApples
	}

}

function enumerable(enumerable: boolean = true) {
	return (target: any, key: string, descriptor: Object) => {
		return {...descriptor, enumerable}
	}
}

function visible(visible: boolean = true) {
	return (target: any, key: string) => {
		if (visible) {
			target.constructor.visibleProperties[key] = true
		} else {
			target.constructor.visibleProperties[key] = false
		}
	}
}