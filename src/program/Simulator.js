// @flow

import EventEmitter from 'events'
import type {Program, Step} from '.'
import isEqual from 'lodash/isEqual'

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
	currentStepIndex: number = 0
	doneOnNextStep: boolean = false

	verbose: boolean = false
	fps:     number = 2

	get frameDuration(): number {
		return 1000 / this.fps
	}

	run() {
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
		const step = this.program.steps[this.currentStepIndex++]
		if (this.doneOnNextStep || step == null) {
			this.emitDone()
		} else if (!this.verbose && emptyStep(step)) {
			// We're skipping steps that incur no state change.
			this.next()
		} else {
			this.emitStep(step)

			// If the program has finished after this step. Emit done on the next round.
			this.doneOnNextStep = step.endState.finished

			this.resume()
		}
	}

	emitStep(step: Step) {
		this.emit('step', step)
	}

	emitDone() {
		this.emit('done')
	}

}

function emptyStep(step: Step) {
	const {startState, endState} = step
	return isEqual(startState, endState)
}