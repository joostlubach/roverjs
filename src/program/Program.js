// @flow

import {Level, Lock, ProgramState} from '.'
import type {KeyColor} from '.'
import type {ASTNodeLocation} from 'js-eval'
import isFunction from 'lodash/isFunction'
import {colors} from '../styles'

export type Step = {
	codeLocation: {
		start: ASTNodeLocation,
		end:   ASTNodeLocation,
	},
	startState:      ProgramState,
	endState:        ProgramState,
	actionPerformed: boolean
}

export type Action<T: any[]> = {
	method: ?((...args: T) => void),
	args:   T,
}

export type ProgramScoring = {
	score:   number,
	message: ?string
}

export type Instruction = 'move' | {turn: TurnDirection}
export type TurnDirection = 'left' | 'right'

export default class Program {

	//------
	// Constructor

	constructor(level: Level, code: string) {
		this.level  = level
		this.code   = code
		this.state  = ProgramState.default(this)
	}

	level: Level
	code:  string

	state:   ProgramState
	scoring: ProgramScoring

	get isEmpty(): boolean {
		return this.steps.filter(step => step.actionPerformed).length === 0
	}

	//------
	// Reset & run

	reset(keyValues: {[color: KeyColor]: ?mixed}) {
		this.state = ProgramState.default(this, keyValues)
		this.scoring = null
	}

	runWithStepCallback(step: (state: ProgramState) => Instruction) {
		while (!this.state.isFinished && this.steps.length < 500) {
			const instruction = step(this.state)
			this.perform(instruction)
		}
	}

	//------
	// Interface

	interfaceMethods = ['perform', 'stepCount', 'move', 'turn', 'pickUp', 'unlock', 'isFinished', 'getState']

	get interface(): Object {
		const iface = {}
		for (const method of this.interfaceMethods) {
			iface[method] = this[method].bind(this)
		}
		return iface
	}

	perform(instruction: Instruction) {
		if (instruction === 'move') {
			this.move()
		} else if (instruction != null && (instruction.turn === 'left' || instruction.turn === 'right')) {
			this.turn(instruction.turn)
		} else {
			throw new TypeError(`Unsupported instruction: ${JSON.stringify(instruction)}`)
		}
	}

	stepCount() {
		return this.steps.length
	}

	getState() {
		return this.state
	}

	isFinished(): boolean {
		return this.state.isFinished
	}

	@action
	move(): boolean {
		const {x, y} = this.state.facingPosition

		if (!this.state.canMoveTo(x, y)) {
			this.state.failedPosition = {x, y}
			this.state.stepFailed = true
			return
		}

		this.state.position = {x, y}

		const item = this.state.itemAt(x, y)
		if (item != null && item.type === 'apple') {
			this.state.roverBalloon = {text: 'YUM', color: colors.green}
			this.state.apples += 1
			this.removeItem(item)
		}
	}

	@action
	turn(direction: TurnDirection): boolean {
		if (direction !== 'left' && direction !== 'right') {
			throw new TypeError(`Invalid turn direction: "${direction}"`)
		}

		let newDir
		switch (this.state.direction) {
		case 'up':    newDir = direction === 'left' ? 'left' : 'right'; break
		case 'down':  newDir = direction === 'left' ? 'right' : 'left'; break
		case 'left':  newDir = direction === 'left' ? 'down' : 'up'; break
		case 'right': newDir = direction === 'left' ? 'up' : 'down'; break
		}

		this.state.direction = newDir
	}

	@action
	pickUp(): ?mixed {
		const {x, y} = this.state.position
		const item = this.state.itemAt(x, y)
		if (item == null || !isFunction(item.pickUp)) { return null }

		this.removeItem(item)
		return item.pickUp(this.state)
	}

	@action
	unlock(value: ?mixed) {
		const {x, y} = this.state.facingPosition
		const item = this.state.itemAt(x, y)
		if (!(item instanceof Lock)) {
			this.state.stepFailed = true
			this.state.roverBalloon = {text: '?', color: colors.blue}
			return
		}

		this.state.roverBalloon = {text: JSON.stringify(value) + '?', color: colors.blue, style: 'monospace'}

		// Record a step inbetween to show the question and answer separately in the simulator.
		this.splitStep()

		if (!item.unlock(this.state, value)) {
			this.state.stepFailed = true
			this.state.itemBalloons.push({position: this.state.facingPosition, text: 'NO', color: colors.red})
			return
		}

		this.state.itemBalloons.push({position: this.state.facingPosition, text: 'YES', color: colors.green})
		this.removeItem(item)
	}

	removeItem(item: Item) {
		this.state.items = this.state.items.filter(i => i !== item)
	}

	//------
	// Actions

	beforeAction() {
		this.state.prepare()
		if (this.recordingStep != null) {
			this.recordingStep.actionPerformed = true
		}
	}

	afterAction() {
		if (this.isFinished()) {
			this.scoring = this.calculateScoring()
		}
	}

	//------
	// Recording

	steps: Step[] = []
	recordingStep: ?Step = null

	startRecording() {
		this.steps = []
		this.recordingStep = null
	}

	recordStep(codeLocation: {start: ASTNodeLocation, end: ASTNodeLocation}): Step {
		const state = this.state.clone()
		if (this.recordingStep != null) {
			this.recordingStep.endState = state
		}

		const step = {codeLocation, startState: state, endState: state, actionPerformed: false}
		this.steps.push(step)
		this.recordingStep = step
		return step
	}

	splitStep() {
		const {recordingStep} = this
		if (recordingStep == null) { return }

		const step = this.recordStep(recordingStep.codeLocation)
		step.actionPerformed = recordingStep.actionPerformed
		return step
	}

	stopRecording() {
		if (this.recordingStep == null) { return }

		this.recordingStep.endState = this.state.clone()
		this.recordingStep = null
	}

	//------
	// Scoring

	get meaningfulCode(): string {
		const lines = this.code.split('\n')

		let start = null
		const ranges = []
		for (const [i, line] of lines.entries()) {
			if (line.indexOf('----') !== -1) {
				start = i
			}
			if (start != null && line.indexOf('++++') !== -1) {
				ranges.push({start, end: i + 1})
				start = null
			}
		}

		for (const {start, end} of ranges.reverse()) {
			lines.splice(start, end - start)
		}

		return lines
			.filter(line => !/^\s*(\/\/.*)?$/.test(line))
			.join('\n')
	}

	get linesOfCode(): number {
		return this.meaningfulCode.split('\n').length
	}

	calculateScoring() {
		for (const {score, message, condition} of this.level.scoring) {
			if (condition(this)) {
				return {score, message}
			}
		}

		return {score: 3, message: null}
	}

}

function action(target: Class<Program>, key: string, descriptor: Object) {
	return {
		...descriptor,
		value: wrapAction(descriptor.value)
	}
}

function wrapAction(fn: Function) {
	return function wrapped() {
		this.beforeAction()
		try {
			return fn.apply(this, arguments)
		} finally {
			this.afterAction()
		}
	}
}