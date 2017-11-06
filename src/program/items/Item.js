// @flow

import type {Position} from '..'
import uuid from 'uuid/v4'

export default class Item {

	constructor(position: Position) {
		this.id = uuid()
		this.position = position
	}

	static create(type: string, position: Position, props: Object) {
		const ItemClass = itemClasses.find(C => new C().type === type)
		if (ItemClass == null) {
			throw new TypeError(`Item type \`${type}\` unknown`)
		}

		const item = new ItemClass(position)
		Object.assign(item, props)
		item.init()
		return item
	}

	id:       string
	type:     string
	blocking: boolean
	position: Position

	init() {}

}

const itemClasses = []

export function item(target: Class<Item>) {
	itemClasses.push(target)
}