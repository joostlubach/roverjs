import {parse} from 'acorn'
import {Runtime} from 'js-eval'
import * as nodes from 'estree'
import Item, {item} from './Item'
import {ProgramState, ItemValue, KeyColor} from '..'
import {some} from 'lodash'

@item
export default class Lock extends Item {
  type     = 'lock'
  blocking = true

  color:  KeyColor
  accept: string

  acceptsKeys:    string[] = []
  acceptFunction: (value: ItemValue) => ItemValue

  init() {
    this.acceptFunction = compileAcceptFunction(this.accept)

    if (this.acceptsKeys.length === 0) {
      this.acceptsKeys = [this.color]
    }
  }

  unlock(state: ProgramState, value: ItemValue) {
    // Check the state for whether all keys have been picked up at all.
    if (!some(this.acceptsKeys, color => color in state.keys)) { return false }

    const expectedValue = this.acceptFunction(state.keys)
    return value === expectedValue
  }
}

function compileAcceptFunction(source: string): (value: ItemValue) => ItemValue {
  try {
    const program = parse(source)
    const bodyNode = program.body[0]
    if (bodyNode == null || bodyNode.type !== 'ExpressionStatement') {
      throw new TypeError(`\`${source}\` is not an arrow function expression`)
    }

    const expressionNode = (bodyNode as nodes.ExpressionStatement).expression
    if (expressionNode.type !== 'ArrowFunctionExpression') {
      throw new TypeError(`\`${source}\` is not an arrow function expression`)
    }

    const runtime = new Runtime()
    runtime.context.define('disabled', disabledLock, false)
    return runtime.evaluate(expressionNode)
  } catch (error) {
    throw new Error(`Error while compiling lock accept function \`${source}\`: ${error.message}`)
  }
}

export const disabledLock = Symbol('disabled')