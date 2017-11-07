// @flow

import React from 'react'
import {observer} from 'mobx-react'
import {jss, colors, layout, shadows} from '../styles'
import {
	Panels,
	Grid,
	ItemSprite,
	Sprite,
	Rover,
	Goal,
	Scoring,
	MessageBox,
	TextBalloon
} from '../components'
import {
	Inventory,
	CodeToolbar,
	LevelInstructions,
	CodeEditor,
	SimulatorToolbar,
	StateInspector,
	ChapterModal,
	UnlockSchema
} from '.'
import {levelStore, viewStateStore, programStore, simulatorStore} from '../stores'
import {Program, ProgramState} from '../program'
import type {Item, ProgramScoring, Lock} from '../program'

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

		const nextLevelAvailable = levelStore.nextLevel != null
		const result = await MessageBox.show({
			title,
			body,

			buttons: nextLevelAvailable ? [
				{label: "Try again", result: 'try-again'},
				{label: "Next level", result: 'next-level'},
			] : [
				{label: "Try again", result: 'try-again'},
				{label: "Go to chapters", result: 'chapters'},
			]
		})

		switch (result) {
		case 'try-again': simulatorStore.reset(); break
		case 'next-level': levelStore.next(); break
		case 'chapters': levelStore.selectChapter(); break
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
		return (
			<div className={$.app}>
				<Panels
					horizontal
					initialSizes={viewStateStore.panelSizes}
					minimumSizes={{left: 100, bottom: 40}}
					onPanelResize={sizes => { viewStateStore.panelSizes = sizes }}

					main={this.renderMain()}
					left={this.renderCodePanel()}
					bottom={this.renderBottomPanel()}
					splitter={side => <div className={[$.splitter, $[`splitter_${side}`]]}/>}
				/>
				<ChapterModal
					isOpen={levelStore.selectingChapter}
					onRequestClose={() => { levelStore.cancelChapterSelection() }}
				/>
				<MessageBox.Host/>

				{/* Used for rainbow colored keys. */}
				<svg width={0} height={0} style={{position: 'absolute'}} xmlns="http://www.w3.org/2000/svg">
					<defs>
						<linearGradient id="rainbow" x1={0} y1={0} x2={1} y2={1}>
							<stop stopColor={colors.keys.red} offset="0%"/>
							<stop stopColor={colors.keys.yellow} offset="50%"/>
							<stop stopColor={colors.keys.green} offset="100%"/>
						</linearGradient>
					</defs>
				</svg>
			</div>
		)
	}

	renderMain() {
		return (
			<div className={$.main}>
				<SimulatorToolbar/>
				<div className={$.gridContainer}>
					{this.renderGrid()}
					<Inventory/>
				</div>
			</div>
		)
	}

	renderCodePanel() {
		const {currentLevel} = levelStore
		if (currentLevel == null) { return }

		return (
			<div className={$.codePanel}>
				<CodeToolbar/>
				<LevelInstructions level={currentLevel}/>
				<CodeEditor className={$.codeEditor}/>
			</div>
		)
	}

	renderBottomPanel() {
		const {currentLevel} = levelStore
		if (currentLevel == null) { return null }

		if (viewStateStore.selectedLock != null) {
			return this.renderUnlockSchema()
		} else if (currentLevel.stateInspector) {
			return this.renderStateInspector(currentLevel)
		} else {
			return null
		}
	}

	renderStateInspector(level: Level) {
		let state
		if (simulatorStore.state != null) {
			state = simulatorStore.state
		} else {
			state = ProgramState.default(new Program(level, ''))
		}

		return (
			<StateInspector state={state}/>
		)
	}

	renderUnlockSchema() {
		if (viewStateStore.selectedLock == null) { return null }

		const {currentLevel} = levelStore
		return (
			<UnlockSchema
				lock={viewStateStore.selectedLock}
				level={currentLevel}
				onCloseTap={() => { viewStateStore.selectedLock = null }}
			/>
		)
	}

	renderGrid() {
		const {currentLevel} = levelStore
		if (currentLevel == null) { return null }

		const {state, done} = simulatorStore
		const showItems = !currentLevel.dark || simulatorStore.isFinished

		const items = state == null || currentLevel.dark
			? currentLevel.items
			: state.items
		const roverBalloon = state == null
			? null
			: state.roverBalloon
		const itemBalloons = state == null
			? []
			: state.itemBalloons
		const position = state == null
			? currentLevel.startPosition
			: state.position
		const failedPosition = (state == null || simulatorStore.done)
			? null
			: state.failedPosition
		const direction = state == null
			? currentLevel.startDirection
			: state.direction
		const transitionDuration = simulatorStore.running
			? simulatorStore.simulator.frameDuration
			: 0

		return (
			<Grid rows={currentLevel.rows} dark={currentLevel.dark && !simulatorStore.isFinished} showCoordinates={currentLevel.coordinates} columns={currentLevel.columns}>
				{showItems && items.map(item => this.renderSprite(item))}

				{currentLevel.goalPosition != null && <Goal position={currentLevel.goalPosition} type='goal'/>}
				<Rover
					position={position}
					failedPosition={failedPosition}
					direction={direction}
					transitionDuration={transitionDuration}
					jumpForJoy={done && (state && state.isFinished)}
					shame={done && (state && !state.isFinished)}
					textBalloon={roverBalloon}
				/>

				{showItems && itemBalloons.map((balloon, index) => this.renderItemBalloon(balloon, index))}
			</Grid>
		)
	}

	renderSprite(item: Item) {
		const onTap = item.type === 'lock'
			? this.onLockTap.bind(this, item)
			: null

		return (
			<ItemSprite key={item.id} item={item} onTap={onTap}/>
		)
	}

	renderItemBalloon(balloon: any, index: number) {
		return (
			<Sprite key={index} style={{pointerEvents: 'none'}} position={balloon.position}>
				<TextBalloon balloon={balloon}/>
			</Sprite>
		)
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

	onLockTap = (lock: Lock) => {
		viewStateStore.selectedLock = lock
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

	splitter_right: {
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