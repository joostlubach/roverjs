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
	get atFirstStep(): boolean {
		if (this.simulator == null) { return false }
		return this.simulator.atFirstStep
	}

	@computed
	get atLastStep(): boolean {
		if (this.simulator == null) { return false }
		return this.simulator.atLastStep
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
		return this.simulator != null
	}

	/** Whether the current simulation is done. */
	@observable
	done: boolean = false

	/** Whether the player has finished the level. */
	@observable
	finished: boolean = false

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
		this.finished    = false
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
			this.running = false
			this.simulator.forward()
		} else {
			this.running = true
			this.simulator.run()
		}
	}

	/** Pauses the current simulation. */
	@action
	pause() {
		if (this.simulator == null) { return }

		this.simulator.pause()
		this.running = false
	}

	/** Resumes the current simulation. */
	@action
	resume() {
		if (this.simulator == null) { return }

		this.simulator.resume()
		this.running = true
	}

	@action
	forward() {
		if (this.running || this.simulator == null) { return }
		
		this.simulator.forward()
	}

	@action
	backward() {
		if (this.running || this.simulator == null) { return }
		
		if (this.simulator.currentStepIndex === 0) {
			this.reset()
		} else {
			this.simulator.backward()
		}
	}

	@action
	onSimulatorStep = (step: Step) => {
		this.currentStep = step
	}

	@action
	onSimulatorDone = () => {
		this.done = true
		this.cleanUp()
		this.emit('done')
	}

}