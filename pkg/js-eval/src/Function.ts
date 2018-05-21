// tslint:disable no-any

import {Runtime, Scope} from '.'
import {Node, ArrayPattern} from 'estree'

export default class Function {

  constructor(
    public runtime: Runtime,
    public name: string | null,
    public params: Node[],
    public body: Node,
    public expression: boolean,
    public boundReceiver: any
  ) {}

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
    } as ArrayPattern

    const destructured = {}
    this.runtime.destructure(destructured, id, args)

    scope.assign(destructured)
  }

}