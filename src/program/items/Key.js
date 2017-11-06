// @flow

import Item, {item} from './Item'
import type {ProgramState} from '..'
import sample from 'lodash/sample'
import times from 'lodash/times'

export type KeyVariableType = 'any' | 'number' | 'string' | 'boolean'
export type KeyColor        = 'yellow' | 'red' | 'green' | 'rainbow'

@item
export default class Key extends Item {

	type     = 'key'
	blocking = false

	variableType: KeyVariableType = 'any'
	value: ?mixed

	get color(): string {
		return keyColor(this.variableType)
	}

	pickUp(state: ProgramState): ?mixed {
		const value = this.getValue()

		state.keys[this.color] = value
		return value
	}

	getValue() {
		if (typeof this.value !== 'undefined') {
			return this.value
		} else {
			return this.generateValue()
		}
	}

	generateValue() {
		const type = this.variableType === 'any'
			? sample(['boolean', 'string', 'number', 'null'])
			: this.variableType

		switch (type) {
		case 'boolean': return sample([true, false])
		case 'string':  return sample(exampleWords)
		case 'number':  return Math.floor(Math.random() * 10)
		default:        return null
		}
	}

}

export function keyColor(variableType: KeyVariableType): KeyColor {
	switch (variableType) {
	case 'boolean': return 'yellow'
	case 'number':  return 'red'
	case 'string':  return 'green'
	default:        return 'rainbow'
	}
}

export const exampleWords = ['hello', 'lock', 'rover', 'key', 'level', 'javascript']