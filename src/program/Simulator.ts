import * as EventEmitter from 'events'
import {Program, Step} from '.'

export type Options = {
  fps?:     number,
  verbose?: boolean
}

export default class Simulator extends EventEmitter {

  constructor(program: Program, options: Options = {}) {
    super()

    this.program = program
    Object.assign(this, options)
  }

  program: Program
  currentStepIndex: number = -1

  verbose: boolean = false
  fps:     number  = 2

  callbackTimeout: NodeJS.Timer

  get frameDuration(): number {
    return 1000 / this.fps
  }

  get atStart(): boolean {
    return this.currentStepIndex === -1
  }

  get atEnd(): boolean {
    return this.currentStepIndex === this.program.steps.length - 1
  }

  pause() {
    global.clearTimeout(this.callbackTimeout)
  }

  resume() {
    this.displayStep(this.currentStepIndex + 1, 1, this.resumePlayback.bind(this))
  }

  forward(callback?: () => void) {
    this.displayStep(this.currentStepIndex + 1, 1, callback)
  }

  backward(callback?: () => void) {
    if (this.currentStepIndex === -1) { return }
    this.displayStep(this.currentStepIndex - 1, -1, callback)
  }

  goTo(index: number) {
    if (index < 0 || index >= this.program.steps.length) { return }
    this.displayStep(index, 0)
  }

  displayStep(index: number, direction: number, callback: (() => void) | null = null) {
    const step = this.program.steps[index]
    if (index >= this.program.steps.length) {
      this.emitDone()
      return
    }

    this.currentStepIndex = index

    if (!this.verbose && direction !== 0 && step && !step.actionPerformed) {
      // We're skipping steps that have not executed any program actions.
      this.displayStep(index + direction, direction, callback)
    } else {
      this.emitStep(index, step)

      if (step != null && step.endState.isFinished) {
        this.emitDoneSoon()
      } else if (callback) {
        if (this.callbackTimeout != null) {
          global.clearTimeout(this.callbackTimeout)
        }
        this.callbackTimeout = global.setTimeout(callback, this.frameDuration)
      }
    }
  }

  resumePlayback() {
    this.displayStep(this.currentStepIndex + 1, 1, this.resumePlayback.bind(this))
  }

  emitDoneSoon() {
    global.setTimeout(
      () => { this.emitDone() },
      this.frameDuration
    )
  }

  emitStep(index: number, step: Step | null) {
    this.emit('step', index, step)
  }

  emitDone() {
    this.emit('done', this.program.scoring)
  }

}