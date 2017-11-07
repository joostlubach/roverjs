// @flow

import type {Program, Position, Direction} from '.'
import type {Chapter} from '../stores'
import {Item, Apple, Key} from './items'
import {cartesian} from '../util'
import sample from 'lodash/sample'

export type Scoring = {
	score:     number,
	message:   ?string,
	condition: (program: Program) => number
}

export type LevelStyle  = 'basic' | 'callback'

export default class Level {

	constructor(chapter: Chapter, id: string) {
		this.chapter = chapter
		this.id = id
	}

	static deserialize(chapter: Chapter, id: string, raw: Object) {
		const level = new Level(chapter, id)

		level.name = raw.name
		level.instructions = raw.instructions
		level.style = raw.style || 'basic'
		level.stateInspector = raw.stateInspector

		level.rows = raw.rows
		level.columns = raw.columns
		level.coordinates = raw.coordinates

		level.startPosition  = {x: raw.start[0], y: raw.start[1]}
		level.startDirection = raw.start[2]

		if (raw.goal != null) {
			level.goalPosition = {x: raw.goal[0], y: raw.goal[1]}
		}
		level.goalApples = raw.goalApples

		level.dark = raw.dark
		if (raw.items != null) {
			level.items = raw.items.map(([x, y, type, props]) => {
				return Item.create(type, {x, y}, props)
			})
		}

		level.initialCode = raw.initialCode
		if (raw.scoring != null) {
			level.scoring = parseScoring(raw.scoring)
		}

		return level
	}

	id:             string
	name:           string
	instructions:   ?string
	style:          LevelStyle
	stateInspector: boolean

	rows:        number
	columns:     number
	coordinates: boolean

	startPosition:  Position
	startDirection: Direction

	goalPosition: ?Position = null
	goalApples:   ?number = null

	dark:  boolean
	items: Item[]    = []

	initialCode:    string    = ''
	scoring:        Scoring[] = []

	get hasApples(): boolean {
		return this.items.filter(item => item instanceof Apple).length > 0
	}

	//------
	// Keys

	/**
	 * Gets all keys present in this leve..
	 */
	get keys(): Key[] {
		return this.items.filter(item => item instanceof Key)	
	}

	get hasKeys(): boolean {
		return this.keys.length > 0
	}

	/**
	 * Finds the key in this level with the given color.
	 * 
	 * @param keyColor The color of the key to find.
	 */
	findKey(keyColor: KeyColor) {
		return this.keys.find(key => key.color === keyColor)
	}

	/**
	 * Gets the key colors present in this level.
	 */
	get keyColors(): KeyColor[] {
		return this.keys.map(item => item.color)
	}

	/**
	 * Generates a sample set of key values for thevgiven keys.
	 * 
	 * @param keyColors
	 *   The colors of the keys to generate a sample for. If omitted, all keys in this
	 *   level are used.
	 * @returns
	 *   A sample set of values for the given keys.
	 */
	generateKeyValuesSample(keyColors: KeyColor[] = this.keyColors): {[color: KeyColor]: ?mixed} {
		const values = {}
		for (const color of keyColors) {
			const key = this.findKey(color)
			if (key == null) { continue }

			values[color] = sample(key.possibleValues)
		}
		return values
	}

	/**
	 * Generates the cartesian product of all possible key values for the given keys.
	 * 
	 * @param keyColors
	 *   The colors of the keys to generate values for. If omitted, all keys in this
	 *   level are used.
	 * @returns
	 *   A list of all set of values for the given keys.
	 */
	allKeyValues(keyColors: KeyColor[] = this.keyColors): Array<{[color: KeyColor]: ?mixed}> {
		let values = []
		for (const color of keyColors) {
			const key = this.findKey(color)
			if (key == null) { continue }

			values = cartesian(values, color, key.possibleValues)
		}

		return values
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