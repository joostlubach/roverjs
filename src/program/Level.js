// @flow

import type {Program, Position, Direction} from '.'

export type Scoring = {
	score:     number,
	message:   ?string,
	condition: (program: Program) => number
}

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
		level.goalApples = raw.goalApples

		if (raw.items != null) {
			level.items = raw.items.map(([x, y, type]) => {
				return Item.create(type, {x, y})
			})
		}
		level.originalItems = level.items

		if (raw.scoring != null) {
			level.scoring = parseScoring(raw.scoring)
		}

		level.initialCode = raw.initialCode
		return level
	}

	id:      number
	rows:    number
	columns: number

	startPosition:  Position
	startDirection: Direction

	goalPosition:   ?Position = null
	goalApples: ?number = null

	initialCode:    string    = ''
	originalItems:  Item[]    = []
	items:          Item[]    = []
	scoring:        Scoring[] = []

	itemAt(x: number, y: number): ?Item {
		return this.items.find(({position}) => position.x === x && position.y === y)
	}

	removeItem(item: Item) {
		this.items = this.items.filter(i => i !== item)
	}

	get hasApples(): boolean {
		return this.items.filter(item => item instanceof Apple).length > 0
	}

	reset() {
		this.items = this.originalItems
	}

}

function parseScoring(raw: Object): Scoring[] {
	const tests = parseScoringTests(raw.tests)
	return raw.scores.map(({score, message = null, ...conditions}) => ({
		score,
		message,
		condition: buildScoringCondition(conditions, tests)
	}))
}

function parseScoringTests(raw: Object) {
	const tests = {}
	for (const key in raw) {
		tests[key] = parseScoringTest(raw[key])
	}
	return tests
}

function parseScoringTest(test: Object): (program: Program) => boolean {
	if ('regexp' in test) {
		return program => new RegExp(test.regexp).test(program.meaningfulCode)
	} else if ('maxLines' in test) {
		return program => program.linesOfCode <= test.maxLines
	} else if ('minLines' in test) {
		return program => program.linesOfCode >= test.minLines
	} else {
		return () => false
	}
}

function buildScoringCondition(conditions: Object, tests: Object) {
	return program => {
		for (const key in conditions) {
			const test = tests[key] || (() => false)
			if (test(program) !== conditions[key]) { return false }
		}

		return true
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