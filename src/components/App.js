// @flow

import React from 'react'
import {observer} from 'mobx-react'
import {jss, colors, layout, shadows} from '../styles'
import {
	Panels,
	Grid,
	Inventory,
	ItemSprite,
	Robot,
	Goal,
	CodeToolbar,
	Instructions,
	CodeEditor,
	SimulatorToolbar,
	StateInspector,
	Scoring,
	MessageBox
} from '.'
import {levelStore, viewStateStore, programStore, simulatorStore} from '../stores'
import {Program} from '../program'
import type {Item, ProgramState, ProgramScoring} from '../program'

export type Props = {}

@observer
export default class App extends React.Component<*, Props, *> {

	props: Props

	async levelFinished(state: ProgramState, scoring: ProgramScoring) {
		const {score, message} = scoring
		levelStore.completeLevel(score)

		const title = "Level completed"
		const body = (
			<Scoring
				className={$.scoring}
				score={score}
				message={message || "**Excellent!**"}
			/>
		)

		const nextLevelAvailable = levelStore.levels.length > programStore.level.id
		const nextLevel = await MessageBox.show({
			title,
			body,

			buttons: nextLevelAvailable ? [
				{label: "Try again", result: false},
				{label: "Next level", result: true},
			] : [
				{label: "Look at your victory", result: null}
			]
		})

		if (nextLevel === true) {
			levelStore.next()
		} else if (nextLevel === false) {
			simulatorStore.reset()
		}
	}

	async levelUnfinished(state: ProgramState, scoring: ProgramScoring) {
		// Only show the 'Rover did not make it to the flag' box once.
		if (!state.atGoal && window.localStorage.levelUnfinishedBoxShown) { return }
		window.localStorage.levelUnfinishedBoxShown = 'true'

		await MessageBox.show({
			title:   "Level incomplete",
			message: state.atGoal
				? "Rover did make it to the flag, but he did not eat enough apples!"
				: "Rover did not make it to the flag!",
			buttons: [
				{label: "Oh no!"}
			]
		})
	}

	async programError() {
		if (window.localStorage.programErrorShown) { return }

		window.localStorage.programErrorShown = 'true'
		await MessageBox.show({
			title:   "Error in your program",
			message: "There is an error in your program.\n\nClick on the red circles to see the error.",
			buttons: [
				{label: "Oh no!"}
			]
		})
	}

	componentWillMount() {
		levelStore.load()
		simulatorStore.on('done', this.onSimulatorDone)
		programStore.on('error', this.onProgramError)
	}

	componentWillUnmount() {
		simulatorStore.removeAllListeners()
		programStore.removeAllListeners()
	}

	render() {
		const {level} = programStore

		return (
			<div className={$.app}>
				<Panels
					horizontal
					initialSizes={viewStateStore.panelSizes.main}
					minimumSizes={{left: 100, bottom: 40}}
					onPanelResize={sizes => { viewStateStore.panelSizes.main = sizes }}

					main={this.renderMain()}
					left={this.renderCodePanel()}
					bottom={level && level.stateInspector ? this.renderStateInspector() : null}
					splitter={side => <div className={[$.splitter, $[`splitter_${side}`]]}/>}
				/>
				<MessageBox.Host/>
			</div>
		)
	}

	renderCodePanel() {
		const {level} = programStore
		if (level == null) { return }

		return (
			<div className={$.codePanel}>
				<CodeToolbar/>
				<Instructions level={level}/>
				<CodeEditor className={$.codeEditor}/>
			</div>
		)
	}

	renderMain() {
		const {level} = programStore
		const hasApples = level != null && level.hasApples

		return (
			<div className={$.main}>
				<SimulatorToolbar/>
				<div className={$.gridContainer}>
					{this.renderGrid()}
					{hasApples && <Inventory/>}
				</div>
			</div>
		)
	}

	renderStateInspector() {
		let state
		if (simulatorStore.state != null) {
			state = simulatorStore.state
		} else {
			state = new Program(programStore.level, '').defaultState()
		}

		return (
			<StateInspector state={state}/>
		)
	}

	renderGrid() {
		const {level} = programStore
		if (level == null) { return null }

		const {state, done} = simulatorStore
		const showItems = !level.dark || simulatorStore.isFinished

		const items = state == null || level.dark
			? level.items
			: state.items
		const position = state == null
			? level.startPosition
			: state.position
		const failedPosition = (state == null || simulatorStore.done)
			? null
			: state.failedPosition
		const direction = state == null
			? level.startDirection
			: state.direction
		const transitionDuration = simulatorStore.running
			? simulatorStore.simulator.frameDuration
			: 0

		return (
			<Grid rows={level.rows} dark={level.dark && !simulatorStore.isFinished} showCoordinates={level.coordinates} columns={level.columns}>
				{showItems && items.map((item, index) => this.renderSprite(item, index))}

				{level.goalPosition != null && <Goal position={level.goalPosition} type='goal'/>}
				<Robot
					position={position}
					failedPosition={failedPosition}
					direction={direction}
					transitionDuration={transitionDuration}
					jumpForJoy={done && (state && state.isFinished)}
					shame={done && (state && !state.isFinished)}
				/>
			</Grid>
		)
	}

	renderSprite(item: Item, index: number) {
		return (
			<ItemSprite key={index} item={item}/>
		)
	}

	onRunTap = e => {
		programStore.runProgram(e.metaKey)
	}

	onSimulatorDone = (scoring: ProgramScoring) => {
		const {state} = simulatorStore
		if (state == null) { return }

		if (state.isFinished) {
			this.levelFinished(state, scoring)
		} else {
			this.levelUnfinished(state, scoring)
		}
	}

	onProgramError = () => {
		this.programError()
	}

}

const $ = jss({
	app: {
		height: '100vh',

		...layout.flex.row,
		backgroundColor:  colors.bg.app,
		backgroundImage:  'url(/images/bg.png)',
		backgroundRepeat: 'repeat'
	},

	main: {
		...layout.overlay,
		...layout.flex.column,
	},

	gridContainer: {
		flex:     [1, 0, 0],
		overflow: 'hidden',
		...layout.flex.center,

		'& > :not(:last-child)': {
			marginBottom: layout.padding.l
		}
	},

	codePanel: {
		...layout.overlay,
		...layout.flex.column
	},

	codeEditor: {
		flex: [1, 0, 0]
	},

	splitter_left: {
		...layout.overlay,
		backgroundColor: colors.purple,
		backgroundImage: colors.bevelGradient('left'),
		boxShadow:       shadows.horizontal(2)
	},

	splitter_bottom: {
		...layout.overlay,
		backgroundColor: colors.purple,
		backgroundImage: colors.bevelGradient('top'),
		boxShadow:       shadows.vertical(2)
	}

})