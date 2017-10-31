// @flow

import {observable, autorun} from 'mobx'
import {Program, ProgramBuilder, Level} from '../program'
import {simulatorStore} from '.'
import type {ASTNodeLocation} from '../program'

export type CodeError = {
	message: string,
	loc:     ASTNodeLocation | {start: ASTNodeLocation, end:   ASTNodeLocation},
}

export default class ProgramStore {

	constructor() {
		this.code = window.localStorage.code || ''
		autorun(() => {
			window.localStorage.code = this.code
		})

		this.level = new Level(5, 5, {x: 0, y: 4}, 'up')
		this.level.goalPosition = {x: 4, y: 0}
	}

	@observable
	code: string = ''

	@observable
	level: ?Level = null

	@observable
	program: ?Program = null

	@observable
	errors: CodeError[] = []

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
		}
	}

}