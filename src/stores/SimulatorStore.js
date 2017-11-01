// @flow

import EventEmitter from 'events'
import {observable, action} from 'mobx'
import {Simulator} from '../program'
import type {Program, ProgramState, ProgramResult} from '../program'

export default class SimulatorStore extends EventEmitter {

	@observable
	simulator: ?Simulator = null

	@observable
	currentStep: ?Step<*> = null

	@observable
	stepSuccess: boolean = true

	@observable
	state: ?ProgramState = null

	@observable
	running: boolean = false

	@observable
	active: boolean = false

	@observable
	done: boolean = false

	@observable
	finished: boolean = false

	@action
	reset() {
		if (this.simulator == null) { return }
		this.simulator.reset()

		this.simulator.removeAllListeners()
		this.simulator = null
		this.state = null
	}

	@action
	simulate(program: Program) {
		this.reset()

		this.simulator = new Simulator(program)
		this.simulator.on('reset', this.onSimulatorReset)
		this.simulator.on('step', this.onSimulatorStep)
		this.simulator.on('done', this.onSimulatorDone)
		this.simulator.run()

		this.active = true
		this.running = true
	}

	@action
	pause() {
		if (this.simulator == null) { return }

		this.simulator.pause()
		this.running = false
	}

	@action
	resume() {
		if (this.simulator == null) { return }

		this.simulator.resume()
		this.running = true
	}

	@action
	onSimulatorReset = (state: ProgramState) => {
		this.currentStep = null
		this.state = state
		this.running = false
		this.done = false
		this.active = false
		this.finished = false
	}

	@action
	onSimulatorStep = (step: Step<*>, success: boolean, state: ProgramState) => {
		this.currentStep = step
		this.stepSuccess = success
		this.state = state
	}

	@action
	onSimulatorDone = (result: ProgramResult) => {
		this.currentStep = null
		this.running = false
		this.done = true
		this.active = false
		this.state = result.state
		this.finished = result.finished

		this.emit('done', result)
	}

}