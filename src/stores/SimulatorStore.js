// @flow

import {observable, action} from 'mobx'
import {Simulator} from '../program'
import type {Program, ProgramState} from '../program'

export default class SimulatorStore {

	@observable
	simulator: ?Simulator = null

	@observable
	currentLine: ?Step<*> = null

	@observable
	stepSucceeded: boolean = true

	@observable
	state: ?ProgramState = null

	@observable
	running: boolean = false

	@observable
	done: boolean = false

	@observable
	finished: boolean = false

	get inProgress(): boolean {
		return this.state != null
	}

	@action
	reset() {
		if (this.simulator != null) {
			this.simulator.reset()
		}

		this.state = null
		this.running = false
		this.done = false
		this.finished = false
	}

	@action
	simulate(program: Program) {
		this.reset()
		this.simulator = new Simulator(program)
		this.simulator.on('reset', this.onSimulatorReset)
		this.simulator.on('step', this.onSimulatorStep)
		this.simulator.on('done', this.onSimulatorDone)
		this.simulator.run()
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
		this.currentLine = null
		this.state = state
		this.done = false
		this.finished = false
	}

	@action
	onSimulatorStep = (line: number, success, state: ProgramState) => {
		this.currentLine = line
		this.stepSucceeded = success
		this.state = state
	}

	@action
	onSimulatorDone = finished => {
		this.simulator.removeAllListeners()
		this.simulator = null

		this.currentLine = null
		this.running = false
		this.done = true
		this.finished = finished
	}

}