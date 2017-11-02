// @flow

import React from 'react'
import {observer} from 'mobx-react'
import {jss, layout, colors, fonts, shadows} from '../styles'
import {ToolbarButton, Switch, Slider} from '.'
import {programStore, simulatorStore} from '../stores'

export type Props = {}

@observer
export default class SimulatorToolbar extends React.Component<*, Props, *> {

	props: Props

	render() {
		const {running, active} = simulatorStore

		return (
			<div className={$.toolbar}>
				<div className={$.buttons}>
					{!running && this.renderPlayButton()}
					{!running && this.renderBackwardButton()}
					{!running && this.renderForwardButton()}
					{running && this.renderPauseButton()}
					{!running && active && this.renderRestartButton()}
				</div>
				{this.renderControls()}
			</div>
		)
	}

	renderPlayButton() {
		return (
			<ToolbarButton
				icon='play'
				label="PLAY"
				onTap={this.onPlayTap}
			/>
		)
	}

	renderBackwardButton() {
		return (
			<ToolbarButton
				icon='backward'
				label="BACK"
				disabled={!simulatorStore.active || simulatorStore.atStart}
				onTap={this.onBackwardTap}
			/>
		)
	}

	renderForwardButton() {
		return (
			<ToolbarButton
				icon='forward'
				label="FWD"
				disabled={simulatorStore.atEnd}
				onTap={this.onForwardTap}
			/>
		)
	}

	renderPauseButton() {
		return (
			<ToolbarButton
				icon='pause'
				label="PAUSE"
				onTap={this.onPauseTap}
			/>
		)
	}

	renderRestartButton() {
		return (
			<ToolbarButton
				icon='restart'
				label="RESTART"
				onTap={this.onRestartTap}
			/>
		)
	}

	renderControls() {
		return (
			<div className={$.controls}>
				{this.renderFPSSlider()}
				{this.renderVerboseSwitch()}
			</div>
		)
	}

	renderFPSSlider() {
		return (
			<div className={$.fpsSliderContainer}>
				<Slider
					className={$.fpsSlider}
					values={[1, 2, 3, 5, 8, 13]}
					value={simulatorStore.fps}
					onChange={value => { simulatorStore.fps = value }}
					showValues={false}
				/>
				<div>Speed</div>
			</div>
		)
	}

	renderVerboseSwitch() {
		return (
			<div className={$.verboseSwitchContainer}>
				<Switch
					className={$.verboseSwitch}
					isOn={simulatorStore.verbose}
					onChange={on => { simulatorStore.verbose = on }}
				/>
				<div>Verbose</div>
			</div>
		)
	}

	//------
	// Event handlers

	onPlayTap = () => {
		if (simulatorStore.active) {
			simulatorStore.resume()
		} else if (simulatorStore.done) {
			// Reset everything, and wait a while to run, to allow everything to reset
			// without animation.
			simulatorStore.reset()
			setTimeout(() => { programStore.runProgram() }, 200)
		} else {
			// Run immediately.
			programStore.runProgram()
		}
	}

	onForwardTap = () => {
		if (simulatorStore.active) {
			simulatorStore.forward()
		} else if (simulatorStore.done) {
			// Reset everything, and wait a while to run, to allow everything to reset
			// without animation.
			simulatorStore.reset()
			setTimeout(() => { programStore.runProgram(true) }, 200)
		} else {
			// Run immediately.
			programStore.runProgram(true)
		}
	}

	onBackwardTap = () => {
		simulatorStore.backward()
	}

	onPauseTap = () => {
		simulatorStore.pause()
	}

	onRestartTap = () => {
		simulatorStore.reset()
	}

}

const $ = jss({
	toolbar: {
		position: 'relative',
		height:   96,

		...layout.row(),
		justifyContent: 'space-between',
		padding:        layout.padding.s,

		borderBottom: [1, 'solid', colors.white.alpha(0.2)],
		boxShadow:    shadows.toolbar,

		background: colors.bg.toolbar,
		color:      colors.fg.inverted,
		'& svg':    {fill: colors.fg.inverted}
	},

	buttons: {
		...layout.row()
	},

	controls: {
		...layout.row()
	},

	fpsSliderContainer: {
		...layout.flex.column,
		alignItems: 'center',

		font:           fonts.tiny,
		textTransform: 'uppercase'
	},

	fpsSlider: {
		marginBottom: layout.padding.xs,
		width:        120
	},

	verboseSwitchContainer: {
		...layout.flex.column,
		alignItems: 'center',

		font:           fonts.tiny,
		textTransform: 'uppercase'
	},

	verboseSwitch: {
		marginBottom: layout.padding.xs
	},
})