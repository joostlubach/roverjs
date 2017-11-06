// @flow

import {parse} from 'acorn'
import {Runtime} from '..'
import Item, {item} from './Item'
import {keyColor} from './Key'
import type {KeyVariableType, KeyColor} from './Key'
import type {ProgramState} from '..'

@item
export default class Lock extends Item {
	type     = 'lock'
	blocking = true

	variableType: KeyVariableType = 'any'
	accept: ?string = null

	acceptFunction: ((value: ?mixed) => ?mixed) = value => value

	init() {
		if (this.accept != null) {
			this.acceptFunction = compileAcceptFunction(this.accept)
		}
	}

	get color(): KeyColor {
		return keyColor(this.variableType)
	}

	unlock(state: ProgramState, value: ?mixed) {
		// Check the state for whether the key has been picked up at all.
		if (!(this.color in state.keys)) { return false }

		const keyValue = state.keys[this.color]
		const expectedValue = this.acceptFunction(keyValue)
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
		return runtime.evaluate(node)
	} catch (error) {
		throw new Error(`Error while compiling lock accept function \`${source}\`: ${error.message}`)
	}
}