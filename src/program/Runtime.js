/* eslint-disable camelcase, no-useless-computed-key, no-new-func */
// @flow

import {Scope, Context, Function} from '.'
import type {ASTNode} from '.'

export type Options = {
	context?:   Context,
	callbacks?: Callbacks
}
export type Callbacks = {
	node?:      (node: ASTNode) => void,
	statement?: (node: ASTNode) => void
}

export default class Runtime {

	constructor(options: Options = {}) {
		this.context      = options.context || new Context()
		this.callbacks    = options.callbacks || {}
		this.currentScope = this.context
	}

	context:      Context
	currentScope: Scope
	callbacks:    Callbacks

	/** Set when a return or break has been called. */
	interruptType: ?('return' | 'break' | 'continue')

	/** The current receiver. Used for method calls. */
	currentReceiver: ?Object = null

	/** The current property. Used for mutating property assignments. */
	currentProperty: ?(string | number) = null

	evaluatedNodes: number = 0

	evaluate(node: ASTNode) {
		this.runCallbacks(node)

		if (this.evaluatedNodes++ > 10000) {
			throw new InfiniteLoopException()
		}

		const {type} = node
		if (this[`evaluate_${type}`] == null) {
			throw new Error(`Unsupported node: ${node.type}`)
		} else {
			return this[`evaluate_${type}`](node)
		}
	}

	runCallbacks(node: ASTNode) {
		const {callbacks} = this
		if (callbacks == null) { return }

		if (callbacks.node) {
			callbacks.node(node)
		}
		if (callbacks.statement && isStatement(node)) {
			callbacks.statement(node)
		}
	}

	//------
	// Scopes

	pushScope() {
		this.currentScope = new Scope(this.currentScope)
	}

	popScope() {
		if (this.currentScope.parent == null) {
			throw new Error("Cannot pop root scope")
		}
		this.currentScope = this.currentScope.parent
	}

	scoped(fn: (scope: Scope) => void) {
		this.pushScope()

		try {
			return fn(this.currentScope)
		} finally {
			this.popScope()
		}
	}

	//------
	// Program & statements

	evaluate_Program(node: ASTNode) {
		for (const bodyNode of hoist(node.body)) {
			this.evaluate(bodyNode)
		}
	}

	evaluate_BlockStatement(node: ASTNode) {
		this.interruptType = null

		for (const bodyNode of hoist(node.body)) {
			this.evaluate(bodyNode)
			if (this.interruptType != null) { break }
		}
	}

	evaluate_VariableDeclaration(node: ASTNode) {
		const isConstant = node.kind === 'const'

		for (const {id, init} of node.declarations) {
			this.currentScope.define(id.name, init == null ? undefined : this.evaluate(init), isConstant)
		}
	}

	evaluate_FunctionDeclaration(node: ASTNode) {
		this.createFunction(node, false)
	}

	evaluate_IfStatement(node: ASTNode) {
		const {test, consequent, alternate} = node

		if (this.evaluate(test)) {
			this.evaluate(consequent)
		} else if (alternate != null) {
			this.evaluate(alternate)
		}
	}

	evaluate_SwitchStatement(node: ASTNode) {
		const discriminant = this.evaluate(node.discriminant)

		const defaultIndex = node.cases.findIndex(cs => cs.test == null)

		let caseIndex = node.cases.findIndex(cs => {
			if (cs.test == null) { return false } // Default case
			return this.binary('===', discriminant, this.evaluate(cs.test))
		})
		if (caseIndex === -1) {
			caseIndex = defaultIndex
		}
		if (caseIndex === -1) {
			return
		}

		for (let index = caseIndex; index < node.cases.length; index++) {
			const cs = node.cases[index]
			let broken = false

			for (const stmt of cs.consequent) {
				this.evaluate(stmt)
				if (this.interruptType === 'break') {
					this.interruptType = null
					broken = true
					break
				}
			}

			if (broken) { break }
		}
	}

	evaluate_WhileStatement(node: ASTNode) {
		const {test, body} = node

		while (this.evaluate(test)) {
			this.scoped(() => {
				this.evaluate(body)
			})
		}
	}

	evaluate_ForStatement(node: ASTNode) {
		const {init, test, update, body} = node

		this.scoped(() => {
			this.evaluate(init)
			while (this.evaluate(test)) {
				this.scoped(() => {
					this.evaluate(body)
				})
				this.evaluate(update)

				if (this.interruptType === 'break') {
					break
				}
			}
		})
	}

	evaluate_ForInStatement(node: ASTNode) {
		const iteratee = this.evaluate(node.right)
		const {kind, id: {name}} = node.left.declarations[0]

		try {
			for (const key in iteratee) {
				this.scoped(() => {
					this.currentScope.define(name, key, kind === 'const')
					this.scoped(() => {
						this.evaluate(node.body)
					})
				})

				if (this.interruptType === 'break') {
					break
				}
			}
		} catch (error) {
			this.rethrow(error, node)
		}
	}

	evaluate_ForOfStatement(node: ASTNode) {
		const iteratee = this.evaluate(node.right)
		const {kind, id: {name}} = node.left.declarations[0]

		try {
			for (const item of iteratee) {
				this.scoped(scope => {
					scope.define(name, item, kind === 'const')
					this.scoped(() => {
						this.evaluate(node.body)
					})
				})

				if (this.interruptType === 'break') {
					break
				}
			}
		} catch (error) {
			this.rethrow(error, node)
		}
	}

	evaluate_ReturnStatement(node: ASTNode) {
		this.currentScope.retval = node.argument == null ? null : this.evaluate(node.argument)
		this.interruptType = 'return'
	}

	evaluate_BreakStatement(node: ASTNode) {
		this.interruptType = 'break'
	}

	evaluate_ContinueStatement(node: ASTNode) {
		this.interruptType = 'continue'
	}

	evaluate_ExpressionStatement(node: ASTNode) {
		return this.evaluate(node.expression)
	}

	//------
	// Expressions

	evaluate_AssignmentExpression(node: ASTNode) {
		if (node.operator === '=') {
			this.setValue(node.left, this.evaluate(node.right))
		} else {
			const operator = node.operator.slice(0, node.operator.length - 1)

			let value = this.evaluate(node.left)
			value = this.binary(operator, value, this.evaluate(node.right), node)
			this.setValue(node.left, value)
		}
	}

	evaluate_FunctionExpression(node: ASTNode) {
		return this.createFunction(node, false)
	}

	evaluate_ArrowFunctionExpression(node: ASTNode) {
		return this.createFunction(node, true)
	}

	evaluate_LogicalExpression(node: ASTNode) {
		const left = this.evaluate(node.left)
		if (!left && node.operator === '&&') { return left }
		if (left && node.operator === '||') { return left }

		const right = this.evaluate(node.right)
		return this.binary(node.operator, left, right)
	}

	evaluate_UnaryExpression(node: ASTNode) {
		return this.unary(node.operator, this.evaluate(node.argument), node)
	}

	evaluate_BinaryExpression(node: ASTNode) {
		return this.binary(node.operator, this.evaluate(node.left), this.evaluate(node.right), node)
	}

	evaluate_UpdateExpression(node: ASTNode) {
		let argument = this.evaluate(node.argument)
		const argumentBefore = argument

		if (node.operator === '++') {
			argument += 1
			this.setValue(node.argument, argument)
		} else {
			argument -= 1
			this.setValue(node.argument, argument)
		}

		if (node.prefix) {
			return argument
		} else {
			return argumentBefore
		}
	}

	evaluate_ConditionalExpression(node: ASTNode) {
		return this.evaluate(node.test)
			? this.evaluate(node.consequent)
			: this.evaluate(node.alternate)
	}

	evaluate_CallExpression(node: ASTNode) {
		const callee   = this.evaluate(node.callee)
		const args     = node.arguments.map(arg => this.evaluate(arg))
		const receiver = this.currentReceiver

		this.currentReceiver = null

		return callee.apply(receiver, args)
	}

	evaluate_MemberExpression(node: ASTNode) {
		const object   = this.evaluate(node.object)
		const property = node.computed
			? this.evaluate(node.property)
			: node.property.name

		this.currentReceiver = object
		this.currentProperty = property

		try {
			return object[property]
		} catch (error) {
			this.rethrow(error, node)
		}
	}

	evaluate_ObjectExpression(node: ASTNode) {
		const object = {}

		for (const property of node.properties) {
			const key = property.computed
				? this.evaluate(property.key)  // Computed notation: e.g. {[this.name]: 1}
				: property.key.name            // Simple notation, e.g. {a: 1}
			const value = this.evaluate(property.value)

			object[key] = value
		}

		return object
	}

	evaluate_ArrayExpression(node: ASTNode) {
		return node.elements.map(el => this.evaluate(el))
	}

	evaluate_ThisExpression(node: ASTNode) {
		return this.currentScope.receiver
	}

	//------
	// Templates

	evaluate_TaggedTemplateExpression(node: ASTNode) {
		const tag = this.evaluate(node.tag)
		return this.evaluateLiteral(tag, node.quasi)
	}

	evaluate_TemplateLiteral(node: ASTNode) {
		return this.evaluateLiteral(null, node)
	}

	evaluateLiteral(tag: ?(quasis: string[], ...expressions: any[]) => any, node: ASTNode) {
		const values = node.expressions.map(expr => this.evaluate(expr))
		const strings = []
		strings.raw = []

		for (const [i, {raw, cooked}] of node.quasis.map(node => node.value).entries()) {
			strings[i] = cooked
			strings.raw[i] = raw
		}

		// eslint-disable-next-line no-useless-call
		return (tag || templateDefault).call(null, strings, ...values)
	}

	//------
	// Terminals

	evaluate_Identifier(node: ASTNode) {
		try {
			return this.currentScope.get(node.name)
		} catch (error) {
			this.rethrow(error, node)
		}
	}

	evaluate_Literal(node: ASTNode) {
		return node.value
	}

	//------
	// Function creation

	createFunction(node: ASTNode, bound: boolean) {
		const {id, params, body} = node
		const name = id == null ? null : id.name
		const fn = new Function(
			this,
			id == null ? null : id.name,
			params,
			body,
			node.expression,
			bound ? this.currentScope.receiver : null
		)

		if (name != null) {
			this.currentScope.define(name, fn, false)
		}
		return fn
	}

	//------
	// Values & operators

	unary(operator: string, value: ?any, node: ASTNode): ?any {
		const fn = unaryOperators[operator]
		if (fn == null) {
			this.throw(ReferenceError, `Invalid operator: ${operator}`, node)
		}

		return fn(value)
	}

	binary(operator: string, left: ?any, right: ?any, node: ASTNode): ?any {
		const fn = binaryOperators[operator]
		if (fn == null) {
			this.throw(ReferenceError, `Invalid operator: ${operator}`, node)
		}

		return fn(left, right)
	}

	setValue(left: ASTNode, value: ?mixed) {
		if (left.type === 'Identifier') {
			try {
				this.currentScope.set(left.name, value)
			} catch (error) {
				if (error.name === 'TypeError' && error.message.match(/read only/)) {
					this.throw(TypeError, `Cannot modify constant \`${left.name}\``, left)
				} else {
					this.rethrow(error, left)
				}
			}
		} else if (left.type === 'MemberExpression') {
			this.evaluate_MemberExpression(left)
			this.currentReceiver[this.currentProperty] = value
			this.currentReceiver = null
			this.currentProperty = null
		} else {
			this.throw(TypeError, `Invalid assignment left hand side`, left)
		}
	}

	//------
	// Errors

	throw(ErrorType: Class<Error>, message: string, node: ASTNode) {
		this.rethrow(new ErrorType(message), node)
	}

	rethrow(error: Error, node: ASTNode) {
		if (typeof node !== 'object' || node.type == null || node.loc == null) {
			throw error
		}

		error.node = node
		error.loc  = node.loc
		throw error
	}

}

function isStatement(node: ASTNode) {
	return /(Declaration|Statement)$/.test(node.type)
}

function isSimpleStatement(node: ASTNode) {
	return isStatement(node) && !isCompoundStatement(node)
}

function isCompoundStatement(node: ASTNode) {
	return [
		'BlockStatement',
		'IfStatement',
		'ForStatement',
		'ForOfStatement',
		'ForInStatement',
		'WhileStatement'
	].includes(node.type)
}

function hoist(nodes: ASTNode[]) {
	const hoisted = []
	const rest = []

	for (const node of nodes) {
		if (node.type === 'FunctionDeclaration') {
			hoisted.push(node)
		} else {
			rest.push(node)
		}
	}

	return hoisted.concat(rest)
}

function templateDefault(strings: string[], ...values: any[]): string {
	let result = strings[0]
	for (let i = 1; i < strings.length; i++) {
		result += `${values[i - 1]}` + strings[i]
	}
	return result
}

const unaryOperators = {
	['!']: val => !val,
	['-']: val => -val,
	['~']: val => ~val
}

const binaryOperators = {
	// Arithmetic
	['+']: (l, r) => l + r,
	['-']: (l, r) => l - r,
	['*']: (l, r) => l * r,
	['/']: (l, r) => l / r,

	// Comparison
	['==']:  (l, r) => l == r, // eslint-disable-line
	['!=']:  (l, r) => l != r, // eslint-disable-line
	['===']: (l, r) => l === r,
	['!==']: (l, r) => l !== r,
	['<']:   (l, r) => l < r,
	['>']:   (l, r) => l > r,
	['<=']:  (l, r) => l <= r,
	['>=']:  (l, r) => l >= r,

	// Boolean
	['&&']: (l, r) => l && r,
	['||']: (l, r) => l || r,

	// Bitwise
	['|']: (l, r) => l | r,
	['&']: (l, r) => l & r,
	['^']: (l, r) => l ^ r,
}

export function InfiniteLoopException() {}
InfiniteLoopException.prototype = new Error()
InfiniteLoopException.prototype.name = 'InfiniteLoopException'