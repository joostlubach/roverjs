// @flow

import React from 'react'
import {jss, colors, layout, fonts} from '../styles'
import {SVG, Markdown, Button} from '.'
import type {Level} from '../program'

export type Props = {
	level: Level
}

type State = {
	collapsible: boolean,
	collapsed:   boolean
}

export default class Instructions extends React.Component<*, Props, *> {

	props: Props

	state: State = {
		collapsible: false,
		collapsed:   false
	}

	bubble: ?HTMLElement = null
	shouldUpdateCollapsible: boolean = true

	updateCollapsible() {
		if (!this.shouldUpdateCollapsible) { return }
		this.shouldUpdateCollapsible = false
		
		const {bubble} = this
		if (bubble == null) { return }

		bubble.classList.remove($.collapsedBubble)
		const collapsible = bubble.offsetHeight > 80
		const collapsed   = collapsible && this.state.collapsed
		this.setState({collapsible, collapsed: false})
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
		const {collapsed, collapsible} = this.state
		if (level.instructions == null) { return null }

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
				<div ref={el => { this.bubble = el }} className={[$.instructionsBubble, collapsed && $.collapsedBubble]}>
					<Markdown key={level.id}>{level.instructions}</Markdown>
				</div>
			</div>
		)
	}

	onExpandTap = () => {
		this.setState({collapsed: false})
	}

	onCollapseTap = () => {
		this.setState({collapsed: true})
	}

}

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

		maxHeight: 80,
		overflow: 'hidden',
		
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