// @flow

import Item, {item} from './Item'
import type {ProgramState} from '..'
import sample from 'lodash/sample'

export type KeyType  = 'any' | 'number' | 'string' | 'boolean'
export type KeyColor = 'yellow' | 'red' | 'blue' | 'rainbow'

@item
export default class Key extends Item {

	type     = 'key'
	blocking = false

	color:   KeyColor
	keyType: KeyType
	value:   ?mixed

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
		const type = this.keyType === 'any'
			? sample(['boolean', 'string', 'number', 'null'])
			: this.keyType

		switch (type) {
		case 'boolean': return sample([true, false])
		case 'string':  return sample(exampleWords)
		case 'number':  return Math.floor(Math.random() * 10)
		default:        return null
		}
	}

}

export const exampleWords = ['hello', 'lock', 'rover', 'key', 'level', 'javascript']