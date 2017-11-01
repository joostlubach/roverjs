// @flow

import React from 'react'
import {observer} from 'mobx-react'
import {jss, colors, layout, shadows} from '../styles'
import {Panels, Grid, Inventory, ItemSprite, Robot, Goal, CodeEditor, CodeToolbar, SimulatorToolbar, Scoring, MessageBox} from '.'
import {levelStore, viewStateStore, programStore, simulatorStore} from '../stores'
import type {Item, ProgramResult} from '../program'

export type Props = {}

@observer
export default class App extends React.Component<*, Props, *> {

	props: Props

	async levelFinished(score: number, message: ?string) {
		levelStore.completeLevel(score)

		const nextLevelAvailable = levelStore.levels.length > programStore.level.id
		const nextLevel = await MessageBox.show({
			title:   "Level completed",
			message: nextLevelAvailable
				? null
				: "You finished all the levels, well done!",
			body:    <Scoring className={$.scoring} score={score} message={message}/>,
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

	async levelUnfinished(result: ProgramResult) {
		// Only show the 'Rover did not make it to the flag' box once.
		if (!result.atGoal && window.localStorage.levelUnfinishedBoxShown) { return }
		window.localStorage.levelUnfinishedBoxShown = 'true'

		await MessageBox.show({
			title:   "Level incomplete",
			message: result.atGoal
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
		simulatorStore.removeListeners()
		programStore.removeListeners()
	}

	render() {
		return (
			<div className={$.app}>
				<Panels
					horizontal
					initialSizes={viewStateStore.panelSizes}
					onPanelResize={sizes => { viewStateStore.panelSizes = sizes }}

					left={this.renderCodePanel()}
					main={this.renderMain()}
					splitter={this.renderSplitter()}
				/>
				<MessageBox.Host/>
			</div>
		)
	}

	renderCodePanel() {
		return (
			<div className={$.codePanel}>
				<CodeToolbar/>
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

	renderGrid() {
		const {level} = programStore
		if (level == null) { return null }

		const {state} = simulatorStore
		const position = state == null
			? level.startPosition
			: state.position
		const failedPosition = state == null
			? null
			: state.failedPosition
		const direction = state == null
			? level.startDirection
			: state.direction
		const transitionDuration = simulatorStore.running
			? simulatorStore.simulator.frameDuration
			: 0

		return (
			<Grid rows={level.rows} columns={level.columns}>
				{level.items.map((item, index) => this.renderSprite(item, index))}

				{level.goalPosition != null && <Goal position={level.goalPosition} type='goal'/>}
				<Robot
					position={position}
					failedPosition={failedPosition}
					direction={direction}
					transitionDuration={transitionDuration}
					jumpForJoy={simulatorStore.finished}
					shame={simulatorStore.done && !simulatorStore.finished}
				/>
			</Grid>
		)
	}

	renderSprite(item: Item, index: number) {
		return (
			<ItemSprite key={index} item={item}/>
		)
	}

	renderSplitter() {
		return (
			<div className={$.splitter}/>
		)
	}

	onRunTap = e => {
		programStore.runProgram(e.metaKey)
	}

	onSimulatorDone = (result: ProgramResult) => {
		if (result.finished) {
			this.levelFinished(result.score, result.message)
		} else {
			this.levelUnfinished(result)
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
		backgroundColor:  colors.bg.grid,
		backgroundImage:  'url(/images/bg.png)',
		backgroundRepeat: 'repeat'
	},

	main: {
		...layout.overlay,
		...layout.flex.column,
	},

	gridContainer: {
		flex: [1, 0, 0],
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

	splitter: {
		...layout.overlay,
		backgroundColor: colors.purple,
		backgroundImage: colors.bevelGradient('left'),
		boxShadow:       shadows.horizontal(2)
	}

})