// @flow

import React from 'react'
import {observer} from 'mobx-react'
import {jss, layout, colors, shadows} from '../styles'
import {ToolbarButton} from '.'
import {programStore, simulatorStore} from '../stores'

export type Props = {}

@observer
export default class SimulatorToolbar extends React.Component<*, Props, *> {

	props: Props

	render() {
		const {running, state} = simulatorStore

		return (
			<div className={$.toolbar}>
				{!running && this.renderPlayButton()}
				{running && this.renderPauseButton()}

				{this.renderFPSSlider()}

				{!running && state != null && this.renderRestartButton()}
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

	renderFPSSlider() {
		return null
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
	}
})