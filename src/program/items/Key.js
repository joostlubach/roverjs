// @flow

import Item, {item} from './Item'
import type {ProgramState} from '..'

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
		const value = state.keyValues[this.color]
		state.keys[this.color] = value
		return value
	}

	get possibleValues(): mixed[] {
		if (this.value != null) {
			return [this.value]
		}

		const values = []

		if (this.keyType === 'any') {
			values.push(null)
		}
		if (this.keyType === 'any' || this.keyType === 'boolean') {
			values.push(true, false)
		}
		if (this.keyType === 'any' || this.keyType === 'string') {
			values.push('hello', 'lock', 'rover', 'key', 'level', 'javascript')
		}
		if (this.keyType === 'any' || this.keyType === 'number') {
			values.push(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
		}
		return values
	}

}