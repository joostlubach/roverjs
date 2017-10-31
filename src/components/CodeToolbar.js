// @flow

import React from 'react'
import {observer} from 'mobx-react'
import {jss, layout, colors, fonts, shadows} from '../styles'
import {SVG, Markdown, Button} from '.'
import {levelStore, programStore} from '../stores'

export type Props = {}

@observer
export default class CodeToolbar extends React.Component<*, Props, *> {

	props: Props

	render() {
		return (
			<div className={$.toolbar}>
				<SVG name='logo' className={$.logo}/>
				<div className={$.main}>
					{this.renderIntro()}
					{this.renderLevelSelector()}
				</div>
			</div>
		)
	}

	renderIntro() {
		return (
			<Markdown className={$.intro}>
				Learn JavaScript by navigating Rover the Robot through mazes.
			</Markdown>
		)
	}

	renderLevelSelector() {
		return (
			<div className={$.levelSelector}>
				{levelStore.levels.map(level => this.renderLevelButton(level))}
			</div>
		)
	}

	renderLevelButton(level: Level) {
		return (
			<Button
				key={level.id}
				label={level.id.toString()}
				small
				color={programStore.isActiveLevel(level) ? colors.green : colors.purple.lighten(0.2)}
				disabled={!levelStore.isLevelSelectable(level)}
				onTap={this.onLevelTap.bind(this, level)}
			/>
		)
	}

	onLevelTap = (level: Level) => {
		programStore.loadLevel(level)
	}

}

const $ = jss({
	toolbar: {
		position: 'relative',
		height:   96,

		...layout.flex.row,
		justifyContent: 'space-between',
		padding:        layout.padding.s,

		borderBottom: [1, 'solid', colors.white.alpha(0.2)],
		boxShadow:    shadows.toolbar,

		background: colors.bg.toolbar,
		color:      colors.fg.inverted
	},

	logo: {
		width:  64,
		height: 64,
		fill:   colors.green
	},

	main: {
		flex:  [1, 0, 0],

		...layout.flex.column,
		justifyContent: 'space-between',
		marginLeft:     layout.padding.m
	},

	intro: {
		color: colors.fg.inverted.alpha(0.6),
		font:  fonts.small
	},

	levelSelector: {
		...layout.row(layout.padding.s),
		flexWrap: 'wrap'
	}
})