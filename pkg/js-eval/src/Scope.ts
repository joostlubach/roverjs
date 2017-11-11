// tslint:disable no-any

export interface Variables {
  [name: string]: any
}

export default class Scope {

  constructor(
    public parent:    Scope | null,
    public variables: Object = {}
  ) {}

  receiver:  any = null
  retval:    any
  interrupt: boolean = false

  has(name: string): boolean {
    if (name in this.variables) { return true }

    return this.parent != null && this.parent.has(name)
  }

  define(name: string, initialValue: any, constant: boolean) {
    Object.defineProperty(this.variables, name, {
      value:        initialValue,
      writable:     !constant,
      configurable: false,
      enumerable:   true
    })
  }

  assign(variables: Object, constants: boolean = false) {
    for (const key of Object.keys(variables)) {
      this.define(key, variables[key], constants)
    }
  }

  set(name: string, value: any) {
    if (name in this.variables) {
      this.variables[name] = value
    } else if (this.parent != null) {
      this.parent.set(name, value)
    } else {
      throw new ReferenceError(`Undefined variable: \`${name}\``)
    }
  }

  get(name: string): any {
    if (name in this.variables) {
      return this.variables[name]
    } else if (this.parent != null) {
      return this.parent.get(name)
    } else {
      throw new ReferenceError(`Undefined variable: \`${name}\``)
    }
  }

}