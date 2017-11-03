// @flow

import type {Runtime, Scope, ASTNode} from '.'

export default class Function {

	constructor(runtime: Runtime, name: string, params: ASTNode[], body: ASTNode, expression: boolean, boundReceiver: ?Object) {
		this.runtime = runtime
		this.name = name
		this.params = params
		this.body = body
		this.expression = expression
		this.boundReceiver = boundReceiver
	}

	expression: boolean
	boundReceiver: ?Object

	apply(receiver: Object, args: any[]) {
		return this.runtime.scoped(scope => {
			this.assignArguments(scope, args)
			if (this.boundReceiver) {
				scope.receiver = this.boundReceiver
			} else {
				scope.receiver = receiver
			}

			if (this.expression) {
				return this.runtime.evaluate(this.body)
			} else {
				this.runtime.evaluate(this.body)
				return scope.retval
			}
		})
	}

	assignArguments(scope: Scope, args: any[]) {
		const params = [...this.params]

		let rest
		for (const arg of args) {
			if (rest) {
				rest.push(arg)
			} else {
				const param = params.shift()
				if (param == null) { break }

				if (param.type === 'Identifier') {
					scope.define(param.name, arg, false)
				} else if (param.type === 'RestElement') {
					scope.define(param.argument.name, rest = [], false)
				}
			}
		}
	}

}