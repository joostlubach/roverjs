// @flow

import React from 'react'
import {observer} from 'mobx-react'
import {jss, colors, layout, fonts} from '../styles'
import {SVG, Markdown, Button} from '.'
import type {Level} from '../program'
import {viewStateStore} from '../stores'

export type Props = {
	level: Level
}

type State = {
	collapsible: boolean,
}

@observer
export default class Instructions extends React.Component<*, Props, *> {

	props: Props

	state: State = {
		collapsible: false
	}

	bubble: ?HTMLElement = null
	shouldUpdateCollapsible: boolean = true

	updateCollapsible() {
		if (!this.shouldUpdateCollapsible) { return }
		this.shouldUpdateCollapsible = false

		const {bubble} = this
		if (bubble == null) { return }

		const hadClass = bubble.classList.contains($.collapsedBubble)
		bubble.classList.remove($.collapsedBubble)
		const collapsible = bubble.offsetHeight > collapsedHeight
		this.setState({collapsible})
		if (hadClass) {
			bubble.classList.add($.collapsedBubble)
		}
	}

	componentDidMount() {
		this.updateCollapsible()
	}

	componentDidUpdate() {
		this.updateCollapsible()
	}

	componentWillReceiveProps(props: Props) {
		if (props.level.id !== this.props.level.id) {
			this.shouldUpdateCollapsible = true
		}
	}

	render() {
		const {level} = this.props
		const {collapsible} = this.state
		const collapsed = viewStateStore.instructionsCollapsed
		if (level.instructions == null) { return null }

		const bubbleClassName = [
			$.instructionsBubble,
			collapsed && $.collapsedBubble
		]

		return (
			<div className={$.instructions}>
				<div className={$.left}>
					<SVG className={$.rover} name='rover-instructions' size={{width: 60, height: 42}}/>
					{collapsible && collapsed &&
						<Button
							className={$.toggleButton}
							label="expand"
							color={colors.purple.lighten(0.2)}
							tiny
							onTap={this.onExpandTap}
						/>						
					}
					{collapsible && !collapsed &&
						<Button
							className={$.toggleButton}
							label="collapse"
							color={colors.purple.lighten(0.2)}
							tiny
							onTap={this.onCollapseTap}
						/>						
					}
				</div>
				<div ref={el => { this.bubble = el }} className={bubbleClassName}>
					<Markdown key={level.id}>{level.instructions}</Markdown>
				</div>
			</div>
		)
	}

	onExpandTap = () => {
		viewStateStore.instructionsCollapsed = false
	}

	onCollapseTap = () => {
		viewStateStore.instructionsCollapsed = true
	}

}

const collapsedHeight = 86

const $ = jss({

	instructions: {
		...layout.flex.row,
		alignItems: 'flex-start',
		padding:    layout.padding.m,
	},

	left: {
		...layout.flex.column,
		alignItems: 'center',
		minWidth:   70
	},

	rover: {
		alignSelf: 'flex-end'
	},

	toggleButton: {
		margin:     layout.padding.s,
		marginLeft: 0,
		minWidth:   58
	},

	instructionsBubble: {
		flex: [1, 0, 0],

		borderRadius: layout.radius.l,
		padding:      layout.padding.m,

		background: colors.bg.instructions,
		color:      colors.fg.instructions,
		font:       fonts.small
	},

	collapsedBubble: {
		position: 'relative',

		maxHeight: collapsedHeight,
		overflow:  'hidden',

		'&::after': {
			content: '""',
			display: 'block',

			position: 'absolute',
			left:     layout.radius.l,
			right:    layout.radius.l,
			bottom:   0,
			height:   24,

			background: colors.linearGradient('top', colors.bg.instructions.alpha(0), colors.bg.instructions)
		}
	}

})