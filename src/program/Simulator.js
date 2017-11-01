// @flow

import EventEmitter from 'events'
import type {Program, Step} from '.'

export type Options = {
	fps?:                      number,
	verbose?: boolean
}

export default class Simulator extends EventEmitter {

	constructor(program: Program, options: Options = {}) {
		super()

		this.program = program
		Object.assign(this, options)
	}

	program: Program

	verbose: boolean = false
	fps:     number = 2

	get frameDuration(): number {
		return 1000 / this.fps
	}

	run() {
		this.program.reset()
		this.next()
	}

	pause() {
		clearTimeout(this.timeout)
		this.timeout = null
	}

	resume() {
		if (this.timeout != null) { return }

		this.timeout = setTimeout(() => {
			this.timeout = null
			this.next()
		}, this.frameDuration)
	}

	next() {
		const [step, success] = this.program.step()
		if (step == null) {
			this.emitDone()
			return
		}

		if (!this.verbose && step.actions.length === 0) {
			// We're skipping steps that have no actions. Immediately execute the next step.
			this.next()
		} else {
			this.emitStep(step, success)
			this.resume()
		}
	}

	emitStep(step: Step, success: boolean) {
		this.emit('step', step, success, this.program.state)
	}

	emitDone() {
		this.emit('done', this.program.result)
	}

}