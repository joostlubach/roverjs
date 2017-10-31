// @flow

import type {Position, Direction} from '.'

export default class Level {

	constructor(rows: number, columns: number, startPosition: Position, startDirection: Direction) {
		this.rows = rows
		this.columns = columns
		this.startPosition = startPosition
		this.startDirection = startDirection
	}

	static fromJSON(json: string) {
		const {rows, columns, startPosition, startDirection, goalPosition, items} = JSON.parse(json)

		const level = new Level(rows, columns, startPosition, startDirection)
		level.goalPosition = goal
		level.items = items
		return level
	}

	rows:    number
	columns: number

	startPosition:  Position
	startDirection: Direction

	items:          Item[] = []
	goalPosition:   ?Position = null

	itemAt(x: number, y: number): ?Item {
		return this.items.find(({position}) => position.x === x && position.y === y)
	}

}

export class Item {

	constructor(position: Position) {
		this.position = position
	}

	type:     string
	blocking: boolean
	position: Position

}

export class Water extends Item {
	type     = 'water'
	blocking = true
}

export class Tree extends Item {
	type     = 'tree'
	blocking = true
}

export class Apple extends Item {
	type     = 'apple'
	blocking = false
}