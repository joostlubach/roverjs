// @flow

import Item, {item} from './Item'

@item
export default class Water extends Item {
	type     = 'water'
	blocking = true
}