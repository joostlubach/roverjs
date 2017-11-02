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
	currentStepIndex: number = -1

	verbose: boolean = false
	fps:     number = 2

	get frameDuration(): number {
		return 1000 / this.fps
	}

	get atStart(): boolean {
		return this.currentStepIndex === -1
	}

	get atEnd(): boolean {
		return this.currentStepIndex === this.program.steps.length - 1
	}

	run() {
		this.displayStep(0, 1, true)
	}

	pause() {
		clearTimeout(this.timeout)
		this.timeout = null
	}

	resume() {
		this.displayStep(this.currentStepIndex + 1, 1, true)
	}

	forward() {
		this.displayStep(this.currentStepIndex + 1, 1, false)
	}

	backward() {
		if (this.currentStepIndex === -1) { return }
		this.displayStep(this.currentStepIndex - 1, -1, false)
	}

	goTo(index: number) {
		if (index < 0 || index >= this.program.steps.length) { return }
		this.displayStep(index, 0, false)
	}

	displayStep(index: number, direction: number, playback: boolean) {
		const step = this.program.steps[index]
		if (step == null) { return }

		this.currentStepIndex = index
										
		if (!this.verbose && direction !== 0 && emptyStep(step)) {
			// We're skipping steps that incur no state change.
			this.displayStep(index + direction, direction, playback)
		} else {
			this.emitStep(step)

			const done = index === this.program.steps.length - 1 || step.endState.finished
			if (done) {
				this.emitDoneSoon()
			} else if (playback) {
				this.resumePlayback()
			}
		}
	}

	resumePlayback() {
		if (this.timeout != null) { return }

		const nextIndex = this.currentStepIndex + 1
		this.timeout = setTimeout(() => {
			this.timeout = null
			this.displayStep(nextIndex, 1, true)
		}, this.frameDuration)
	}

	emitDoneSoon() {
		setTimeout(() => {
			this.emitDone()
		}, this.frameDuration)
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