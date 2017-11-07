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
		const id = {
			type:     'ArrayPattern',
			elements: this.params
		}

		const destructured = {}
		this.runtime.destructure(destructured, id, args)
		scope.assign(destructured)
	}

}