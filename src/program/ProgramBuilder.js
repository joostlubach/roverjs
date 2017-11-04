// @flow

import {parse} from 'acorn'
import * as walk from 'acorn/dist/walk'
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
			const ast = parse(code, {
				sourceType: 'script',
				locations:  true
			})
			markRecordableNodes(ast)
			return ast
		} catch (error) {
			if (error.name !== 'SyntaxError') {
				throw error
			}

			this.errors.push(error)
			return null
		}
	}

	run(ast: ASTNode) {
		this.runtime = new Runtime({
			source:    this.program.code,
			callbacks: {
				node: node => {
					if (!node.recordable) { return }
					this.program.recordStep(node.loc)
				}
			}
		})

		try {
			this.runtime.context.assign(this.program.interface, true)

			this.program.startRecording()
			this.runtime.evaluate(ast)

			if (this.program.level.style === 'callback') {
				if (!this.runtime.context.has('step')) {
					this.runtime.throw(ReferenceError, "You should implement the `step` function", ast)
				}

				try {
					const step = this.runtime.context.get('step')
					this.program.runWithStepCallback(step)
				} catch (error) {
					this.runtime.rethrow(error, ast)
				}
			}

			this.program.stopRecording()
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

function markRecordableNodes(ast: ASTNode) {
	walk.ancestor(ast, {
		VariableDeclaration(node) {
			node.recordable = true
		},
		FunctionDeclaration(node) {
			node.recordable = true
		},
		IfStatement(node) {
			node.test.recordable = true
		},
		SwitchStatement(node) {
			node.discriminant.recordable = true
		},
		WhileStatement(node) {
			node.test.recordable = true
		},
		ForStatement(node) {
			node.init.recordable = true
			node.test.recordable = true
			node.update.recordable = true
		},
		ForOfStatement(node) {
			node.left.recordable = true
		},
		ForInStatement(node) {
			node.left.recordable = true
		},
		ReturnStatement(node) {
			node.recordable = true
		},
		BreakStatement(node) {
			node.recordable = true
		},
		ContinueStatement(node) {
			node.recordable = true
		},
		ExpressionStatement(node) {
			if (node.expression.type !== 'CallExpression') {
				node.recordable = true
			}
		},
		CallExpression(node) {
			node.recordable = true
		}
	})
}