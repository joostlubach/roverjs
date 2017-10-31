// @flow

import EventEmitter from 'events'
import {observable, autorun, action} from 'mobx'
import {Program, ProgramBuilder, Level} from '../program'
import type {ASTNodeLocation} from '../program'
import {simulatorStore} from '.'

export type CodeError = {
	message: string,
	loc:     ASTNodeLocation | {start: ASTNodeLocation, end:   ASTNodeLocation},
}

export default class ProgramStore extends EventEmitter {

	constructor() {
		super()
		autorun(() => { this.saveCode() })
	}

	@observable
	level: ?Level = null

	@observable
	code: string = ''

	@observable
	program: ?Program = null

	@observable
	errors: CodeError[] = []

	@action
	loadLevel(level: Level) {
		this.level = level
		this.loadCode()
	}

	isActiveLevel(level: Level) {
		return this.level === level
	}

	loadCode() {
		const codes = JSON.parse(window.localStorage.codes || '[]')
		this.code = codes[this.level.id]
		if (this.code == null) {
			this.code = this.level.initialCode
		}
		simulatorStore.reset()
	}

	saveCode() {
		if (this.level == null) { return }

		const codes = JSON.parse(window.localStorage.codes || '[]')
		codes[this.level.id] = this.code
		window.localStorage.codes = JSON.stringify(codes)
	}

	@action
	resetCode() {
		if (this.level == null) { return }
		this.code = this.level.initialCode
	}

	@action
	runProgram() {
		if (this.level == null) { return }
		if (simulatorStore.inProgress) { return }

		// Create a new program.
		const program = this.program = new Program(this.level)

		// Use the students code to build the program.
		const builder = new ProgramBuilder(program)
		const success = builder.build(this.code)

		// Report errors.
		this.errors = builder.errors

		// If successful, run a simulation of the created program.
		simulatorStore.reset()
		if (success) {
			simulatorStore.simulate(program)
		} else {
			this.emit('error')
		}
	}

}