// @flow

import Scope from './Scope'

export default class Context extends Scope {

	constructor(variables: Object = {}) {
		super(null, variables)
	}

	has(name: string): boolean {
		return name in this.variables || name in window
	}

	get(name: string): mixed {
		if (name in this.variables) {
			return this.variables[name]
		} else if (name in window) {
			return window[name]
		} else {
			throw new ReferenceError(`Undefined variable: \`${name}\``)
		}
	}

}