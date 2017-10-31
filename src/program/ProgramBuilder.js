// @flow

import {parse} from 'acorn'
import {Runtime, Program} from '.'

export type ASTNode = {
	type:  string,
	value: string,
	loc: {
		start: ASTNodeLocation,
		end:   ASTNodeLocation
	}
}

export type ASTNodeLocation = {
	line:   number,
	column: number
}

export default class ProgramBuilder {

	constructor(program: Program) {
		this.program = program
	}

	program: Program
	errors:  Error[]  = []

	runtime: ?Runtime = null

	build(code: string): boolean {
		const ast = this.compile(code)
		if (ast == null) { return false }

		return this.run(ast)
	}

	compile(code: string) {
		try {
			return parse(code, {
				sourceType: 'script',
				locations:  true
			})
		} catch (error) {
			if (error.name !== 'SyntaxError') {
				throw error
			}

			this.errors.push(error)
			return null
		}
	}

	get programInterface(): Object {
		const iface = {}
		for (const method of this.program.interfaceMethods) {
			iface[method] = (...args: any[]) => {
				const {runtime, program} = this
				const fn   = program[method]
				const line = runtime == null ? null : runtime.currentNode.loc.start.line

				return this.program.record(fn, args, line - 1)
			}
		}
		return iface
	}

	run(ast: ASTNode) {
		this.runtime = new Runtime()

		try {
			this.runtime.context.assign(this.programInterface, true)
			this.runtime.evaluate(ast)
			return true
		} catch (error) {
			if (error.node != null) {
				this.errors.push(error)
			} else if (error.name === 'InfiniteLoopException') {
				console.error("Your program resulted in an infinite loop") //eslint-disable-line
			} else {
				throw error
			}

			return false
		}
	}

}