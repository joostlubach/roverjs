// @flow

import EventEmitter from 'events'
import {observable, computed, action, autorun} from 'mobx'
import {Simulator} from '../program'
import type {Program, ProgramState, ProgramResult} from '../program'

export default class SimulatorStore extends EventEmitter {

	constructor() {
		super()

		autorun(() => {
			localStorage.verbose = JSON.stringify(this.verbose)
			if (this.simulator != null) {
				this.simulator.verbose = this.verbose
			}
		})

		autorun(() => {
			localStorage.fps = JSON.stringify(this.fps)
			if (this.simulator != null) {
				this.simulator.fps = this.fps
			}
		})
	}

	/** The currently active simulator. */
	@observable
	simulator: ?Simulator = null

	/** The most recently (or currently) executed step. */
	@observable
	currentStep: ?Step = null

	@computed
	get atStart(): boolean {
		if (this.simulator == null) { return false }
		return this.simulator.atStart
	}

	@computed
	get atEnd(): boolean {
		if (this.simulator == null) { return false }
		return this.simulator.atEnd
	}

	@computed
	get state(): ProgramState {
		if (this.currentStep == null) { return null }
		return this.currentStep.endState
	}

	/** Whether the simulator is currently running (and not paused). */
	@observable
	running: boolean = false

	/** Whether there is currently a simulation active (albeit paused). */
	@computed
	get active(): boolean {
		return this.currentStep != null
	}

	/** Whether the current simulation is done. */
	@observable
	done: boolean = false

	/** Whether the player has finished the level. */
	@computed
	get finished(): boolean {
		return this.state != null && this.state.finished
	}

	@observable
	verbose: boolean = JSON.parse(localStorage.verbose || 'false')

	@observable
	fps: boolean = JSON.parse(localStorage.fps || '2')

	/** Resets everything to default values. */
	@action
	reset() {
		this.currentStep = null
		this.done        = false
		this.cleanUp()
	}

	/** Cleans up after a simulation is complete, but leaves some state intact. */
	@action
	cleanUp() {
		if (this.simulator != null) {
			this.simulator.removeAllListeners()
		}

		this.simulator   = null
		this.running     = false
	}

	/** Starts simulating a program. If a current simulation was in progress, it is terminated. */
	@action
	simulate(program: Program, firstStepOnly: boolean = false) {
		this.reset()

		this.simulator = new Simulator(program)
		this.simulator.fps = this.fps
		this.simulator.verbose = this.verbose

		this.simulator.on('step', this.onSimulatorStep)
		this.simulator.on('done', this.onSimulatorDone)

		if (firstStepOnly) {
			this.forward()
		} else {
			this.resume()
		}
	}

	/** Pauses the current simulation. */
	@action
	pause() {
		if (!this.running || this.simulator == null) { return }

		this.running = false
		this.simulator.pause()
	}

	/** Resumes the current simulation. */
	@action
	resume() {
		if (this.running || this.simulator == null) { return }

		this.running = true
		this.simulator.resume()
	}

	@action
	forward() {
		if (this.running || this.simulator == null) { return }
		
		this.running = true
		this.simulator.forward(() => {
			this.running = false
		})
	}

	@action
	backward() {
		if (this.running || this.simulator == null) { return }
		
		this.running = true
		this.simulator.backward(() => {
			this.running = false
		})
	}

	@action
	onSimulatorStep = (step: ?Step) => {
		this.currentStep = step
	}

	@action
	onSimulatorDone = () => {
		this.done = true
		this.cleanUp()
		this.emit('done')
	}

}