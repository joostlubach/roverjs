// @flow

import {parse} from 'acorn'
import {Runtime} from '..'
import Item, {item} from './Item'
import type {KeyColor} from './Key'
import type {ProgramState} from '..'
import some from 'lodash/some'

@item
export default class Lock extends Item {
	type     = 'lock'
	blocking = true

	color: KeyColor
	accept: ?string = null

	acceptsKeys:    string[] = []
	acceptFunction: (value: ?mixed) => ?mixed

	init() {
		this.acceptFunction = compileAcceptFunction(this.accept)

		if (this.acceptsKeys.length === 0) {
			this.acceptsKeys = [this.color]
		}
	}

	unlock(state: ProgramState, value: ?mixed) {
		// Check the state for whether all keys have been picked up at all.
		if (!some(this.acceptsKeys, color => color in state.keys)) { return false }

		const expectedValue = this.acceptFunction(state.keys)
		return value === expectedValue
	}
}

function compileAcceptFunction(source: string): (value: ?mixed) => ?mixed {
	try {
		const ast = parse(source)
		const node = ast.body[0] == null || ast.body[0].type !== 'ExpressionStatement' ? null : ast.body[0].expression
		if (node.type !== 'ArrowFunctionExpression') {
			throw new TypeError(`\`${source}\` is not an arrow function expression`)
		}

		const runtime = new Runtime()
		runtime.context.define('disabled', disabledLock)
		return runtime.evaluate(node)
	} catch (error) {
		throw new Error(`Error while compiling lock accept function \`${source}\`: ${error.message}`)
	}
}

export const disabledLock = Symbol('disabled')