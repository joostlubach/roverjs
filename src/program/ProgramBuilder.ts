/// <reference path="../types/acorn-walk.d.ts"/>

import {parse} from 'acorn'
import * as nodes from 'estree'
import {SourceLocation} from 'estree'
import * as walk from 'acorn/dist/walk'
import {Runtime} from 'js-eval'
import {Program} from '.'
import {shuffle} from 'lodash'

type Recordable<N extends nodes.Node> = N & {
  recordable?: boolean,
}
type RecordableNode = Recordable<nodes.Node>

export interface CodeError extends Error {
  node: nodes.Node
  loc:  SourceLocation
}

export default class ProgramBuilder {

  constructor(program: Program) {
    this.program = program
  }

  program: Program
  errors:  CodeError[]  = []

  runtime: Runtime | null = null

  evaluatedNodes: number = 0

  build(code: string): boolean {
    const ast = this.compile(code)
    if (ast == null) { return false }

    // Run the program for all possible key values in random order. If any of them fails, stop.
    // This is to make sure that players cannot cheat in the key levels by using constant values
    // and just trying a few times. In levels without keys, the value of allKeyValues will be
    // an empty array, so then we just run once.
    const allKeyValues = shuffle(this.program.level.allKeyValues())
    if (allKeyValues.length === 0) {
      return this.run(ast)
    }

    let success = true
    for (const keyValues of allKeyValues) {
      this.program.reset(keyValues)

      success = this.run(ast)
      if (!success || this.program.isFinished()) {
        break
      }
    }

    return success
  }

  compile(code: string) {
    try {
      const program = parse(code, {
        sourceType: 'script',
        locations:  true
      })
      markRecordableNodes(program)
      return program
    } catch (error) {
      if (error.name !== 'SyntaxError') {
        throw error
      }

      this.errors.push(error)
      return null
    }
  }

  run(ast: nodes.Node) {
    const runtime = this.runtime = new Runtime({
      source: this.program.code,
      callbacks: {
        node: (node: nodes.Node) => {
          if (this.evaluatedNodes++ > 10000) {
            throw new InfiniteLoopException()
          }

          if ((node as RecordableNode).recordable) {
            this.program.recordStep(node.loc || null)
          }
        }
      }
    })

    try {
      if (this.program.level.style === 'basic') {
        runtime.context.assign(this.program.interface, true)
      }

      this.program.startRecording()
      runtime.evaluate(ast)

      if (this.program.level.style === 'callback') {
        if (!runtime.context.has('step')) {
          runtime.throw(ReferenceError, "You should implement the `step` function", ast)
        }

        try {
          const step = runtime.context.get('step')
          this.program.runWithStepCallback(step)
        } catch (error) {
          runtime.rethrow(error, ast)
        }
      }

      this.program.stopRecording()
      return true
    } catch (error) {
      if (isCodeError(error)) {
        if (process.env.NODE_ENV === 'development') {
          console.error(error) // tslint:disable-line no-console
        }
        this.errors.push(error)
      } else {
        throw error
      }

      return false
    }
  }

}

function isCodeError(error: Error): error is CodeError {
  return (error as any).node != null && (error as any).loc != null
}

function markRecordableNodes(ast: nodes.Node) {
  walk.ancestor(ast, {
    VariableDeclaration(node: Recordable<nodes.VariableDeclaration>) {
      node.recordable = true
    },
    FunctionDeclaration(node: Recordable<nodes.FunctionDeclaration>) {
      node.recordable = true
    },
    IfStatement(node: Recordable<nodes.IfStatement>) {
      (node.test as RecordableNode).recordable = true
    },
    SwitchStatement(node: Recordable<nodes.SwitchStatement>) {
      (node.discriminant as RecordableNode).recordable = true
    },
    WhileStatement(node: Recordable<nodes.WhileStatement>) {
      (node.test as RecordableNode).recordable = true
    },
    ForStatement(node: Recordable<nodes.ForStatement>) {
      (node.init as RecordableNode).recordable = true;
      (node.test as RecordableNode).recordable = true;
      (node.update as RecordableNode).recordable = true
    },
    ForOfStatement(node: Recordable<nodes.ForOfStatement>) {
      (node.left as RecordableNode).recordable = true
    },
    ForInStatement(node: Recordable<nodes.ForInStatement>) {
      (node.left as RecordableNode).recordable = true
    },
    ReturnStatement(node: Recordable<nodes.ReturnStatement>) {
      node.recordable = true
    },
    BreakStatement(node: Recordable<nodes.BreakStatement>) {
      node.recordable = true
    },
    ContinueStatement(node: Recordable<nodes.ContinueStatement>) {
      node.recordable = true
    },
    ExpressionStatement(node: Recordable<nodes.ExpressionStatement>) {
      if (node.expression.type !== 'CallExpression') {
        node.recordable = true
      }
    },
    CallExpression(node: Recordable<nodes.CallExpression>) {
      node.recordable = true
    }
  })
}

export class InfiniteLoopException extends Error {
  message = "Your program contains an infinite loop"
}