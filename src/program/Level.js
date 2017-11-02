// @flow

import type {Program, Position, Direction} from '.'

export type Scoring = {
	score:     number,
	message:   ?string,
	condition: (program: Program) => number
}

export default class Level {

	constructor(id: number) {
		this.id = id
	}

	static deserialize(id: number, raw: Object) {
		const level = new Level(id)

		level.name = raw.name
		level.instructions = raw.instructions
		level.rows = raw.rows
		level.columns = raw.columns
		level.startPosition  = {x: raw.start[0], y: raw.start[1]}
		level.startDirection = raw.start[2]

		if (raw.goal != null) {
			level.goalPosition = {x: raw.goal[0], y: raw.goal[1]}
		}
		level.goalApples = raw.goalApples

		level.dark = raw.dark
		if (raw.items != null) {
			level.items = raw.items.map(([x, y, type]) => {
				return Item.create(type, {x, y})
			})
		}

		level.initialCode = raw.initialCode
		if (raw.scoring != null) {
			level.scoring = parseScoring(raw.scoring)
		}

		return level
	}

	id:           number
	name:         string
	instructions: ?string

	rows:    number
	columns: number

	startPosition:  Position
	startDirection: Direction

	goalPosition:   ?Position = null
	goalApples: ?number = null

	dark:  boolean
	items: Item[]    = []

	initialCode:    string    = ''
	scoring:        Scoring[] = []

	get hasApples(): boolean {
		return this.items.filter(item => item instanceof Apple).length > 0
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