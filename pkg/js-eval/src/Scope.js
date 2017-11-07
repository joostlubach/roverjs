// @flow

export default class Scope {

	constructor(parent: Scope, variables: Object = {}) {
		this.parent = parent
		this.variables = variables
	}

	parent:    Scope
	variables: Object
	receiver:  ?Object = null

	retval: ?any
	interrupt: boolean = false

	has(name: string): boolean {
		if (name in this.variables) { return true }

		return this.parent != null && this.parent.has(name)
	}

	define(name: string, initialValue: ?any, constant: boolean) {
		Object.defineProperty(this.variables, name, {
			value:        initialValue,
			writable:     !constant,
			configurable: false,
			enumerable:   true
		})
	}

	assign(variables: Object, constants: boolean = false) {
		for (const key in variables) {
			this.define(key, variables[key], constants)
		}
	}

	set(name: string, value: ?any) {
		if (name in this.variables) {
			this.variables[name] = value
		} else if (this.parent != null) {
			this.parent.set(name, value)
		} else {
			throw new ReferenceError(`Undefined variable: \`${name}\``)
		}
	}

	get(name: string): mixed {
		if (name in this.variables) {
			return this.variables[name]
		} else if (this.parent != null) {
			return this.parent.get(name)
		} else {
			throw new ReferenceError(`Undefined variable: \`${name}\``)
		}
	}

}