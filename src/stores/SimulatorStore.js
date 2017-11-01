// @flow

import EventEmitter from 'events'
import {observable, computed, action} from 'mobx'
import {Simulator} from '../program'
import type {Program, ProgramState, ProgramResult} from '../program'

export default class SimulatorStore extends EventEmitter {

	/** The currently active simulator. */
	@observable
	simulator: ?Simulator = null

	/** The most recently (or currently) executed step. */
	@observable
	currentStep: ?Step<*> = null

	/** Whether the current step was successful. */
	@observable
	stepSuccess: boolean = true

	/** The current (simulated) program state. */
	@observable
	state: ?ProgramState = null

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

	/** Resets everything to default values. */
	@action
	reset() {
		this.currentStep = null
		this.stepSuccess = false
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
		this.state       = null
	}

	/** Starts simulating a program. If a current simulation was in progress, it is terminated. */
	@action
	simulate(program: Program) {
		this.reset()

		this.simulator = new Simulator(program)
		this.simulator.on('step', this.onSimulatorStep)
		this.simulator.on('done', this.onSimulatorDone)

		this.running = true
		this.simulator.run()
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
	onSimulatorStep = (step: Step<*>, success: boolean, state: ProgramState) => {
		this.currentStep = step
		this.stepSuccess = success
		this.state = state
	}

	@action
	onSimulatorDone = (result: ProgramResult) => {
		this.cleanUp()

		this.state    = result.state
		this.done     = true
		this.finished = result.finished

		this.emit('done', result)
	}

}