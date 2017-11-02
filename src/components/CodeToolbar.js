// @flow

import React from 'react'
import {observer} from 'mobx-react'
import {jss, layout, colors, fonts, shadows} from '../styles'
import {SVG, Markdown, ToolbarButton, Button, MessageBox, ScoreStars} from '.'
import {levelStore, programStore} from '../stores'

export type Props = {}

@observer
export default class CodeToolbar extends React.Component<*, Props, *> {

	props: Props

	async confirmAndReset() {
		const confirmed = await MessageBox.show({
			title:   "Reset level",
			message: "Are you sure you want to reset to the original level code?",
			buttons: [
				{label: "Yes, I'm sure", result: true},
				{label: "No, keep this", result: false}
			]
		})

		if (confirmed) {
			programStore.resetCode()
		}
	}

	render() {
		return (
			<div className={$.toolbar}>
				<div className={$.left}>
					<SVG name='logo' className={$.logo}/>
					<Button
						className={$.aboutButton}
						label="about"
						tiny
						onTap={this.onAboutTap}
					/>
				</div>
				<div className={$.main}>
					{this.renderLevelName()}
					{this.renderLevelSelector()}
				</div>
				{this.renderResetButton()}
			</div>
		)
	}

	renderLevelName() {
		const {level} = programStore

		return (
			<div className={$.levelName}>
				{level.name}
			</div>
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
		const score = levelStore.levelScores.get(level.id)

		return (
			<Button
				key={level.id}
				label={level.id.toString()}
				small
				color={programStore.isActiveLevel(level) ? colors.green : colors.purple.lighten(0.2)}
				disabled={!levelStore.isLevelSelectable(level)}
				onTap={this.onLevelTap.bind(this, level)}
			>
				{score && <ScoreStars score={score} starSize={10} padding={4} animated={false}/>}
			</Button>
		)
	}

	renderResetButton() {
		return (
			<ToolbarButton
				className={$.resetButton}
				icon='reset'
				label="RESET"
				onTap={this.onResetTap}
			/>
		)
	}

	renderAboutBody() {
		return (
			<Markdown className={$.about}>{about}</Markdown>
		)
	}

	onLevelTap = (level: Level) => {
		levelStore.goTo(level.id)
	}

	onResetTap = () => {
		this.confirmAndReset()
	}

	onAboutTap = () => {
		MessageBox.show({
			title: "Rover the Robot",
			body:  this.renderAboutBody(),
			buttons: [{
				label: "Whatever"
			}]
		})
	}

}

const about = `Rover the Robot was created by [Joost Lubach](https://github.com/joostlubach) as a learning
tool for JavaScript.

Thanks to [Simon Child](https://thenounproject.com/Simon%20Child/) for the Robot icon, and
to [Freepik](https://www.flaticon.com/authors/freepik) for the tree icon. All the ugly other
ones I have made myself 🙌.

This project is open source. You can find the source here:
[joostlubach/robot-client](https://github.com/joostlubach/robot-client).`

const $ = jss({
	toolbar: {
		position:  'relative',
		minHeight: 96,

		...layout.flex.row,
		justifyContent: 'space-between',
		padding:        layout.padding.s,

		borderBottom: [1, 'solid', colors.white.alpha(0.2)],
		boxShadow:    shadows.toolbar,

		background: colors.bg.toolbar,
		color:      colors.fg.inverted
	},

	left: {
		...layout.flex.column,
		alignItems: 'stretch'
	},

	about: {
		textAlign: 'center'
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

	levelName: {
		font:  fonts.large
	},

	levelSelector: {
		...layout.row(layout.padding.xs),
		flexWrap: 'wrap',

		paddingTop:   layout.padding.xs,
		marginBottom: layout.padding.xs - layout.padding.s,

		'& > *': {
			marginBottom: layout.padding.xs
		}
	},

	resetButton: {
		alignSelf: 'center'
	}
})