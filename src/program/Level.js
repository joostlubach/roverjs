// @flow

import type {Position, Direction} from '.'

export default class Level {

	constructor(id: number, rows: number, columns: number, startPosition: Position, startDirection: Direction) {
		this.id = id
		this.rows = rows
		this.columns = columns
		this.startPosition = startPosition
		this.startDirection = startDirection
	}

	static deserialize(id: number, raw: Object) {
		const level = new Level(id)
		level.rows = raw.rows
		level.columns = raw.columns
		level.startPosition  = {x: raw.start[0], y: raw.start[1]}
		level.startDirection = raw.start[2]

		if (raw.goal != null) {
			level.goalPosition = {x: raw.goal[0], y: raw.goal[1]}
		}

		if (raw.items != null) {
			level.items = raw.items.map(([x, y, type]) => {
				return Item.create(type, {x, y})
			})
		}

		level.initialCode = raw.initialCode
		return level
	}

	id:      number
	rows:    number
	columns: number

	startPosition:  Position
	startDirection: Direction

	initialCode:    string = ''
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

	static create(type: string, position: Position) {
		const ItemClass = itemClasses.find(C => new C().type === type)
		if (ItemClass == null) {
			throw new TypeError(`Item type \`${type}\` unknown`)
		}

		return new ItemClass(position)
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

const itemClasses = [Water, Tree, Apple]