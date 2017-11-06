// @flow

import React from 'react'
import {jss, layout, colors, fonts} from '../styles'
import CSSTransitionGroup from 'react-addons-css-transition-group'
import {SVG} from '.'
import type {TextBalloon as TextBalloonType} from '../program'

export type Props = {
	balloon: TextBalloonType
}

export default class TextBalloon extends React.Component<*, Props, *> {

	props: Props

	render() {
		const {balloon: {text, color}} = this.props

		return (
			<CSSTransitionGroup component='div' className={$.anim} transitionName={$.anim} transitionAppear transitionAppearTimeout={animDuration} transitionEnter={false} transitionLeave={false}>
				<div className={$.content}>
					<SVG className={$.balloon} style={{fill: color.string()}} name='balloon'/>
					<div className={$.text}>
						<span style={{color: colors.contrast(color).string()}}>{text}</span>
					</div>
				</div>
			</CSSTransitionGroup>
		)
	}

}

const animDuration = 200

const size = {
	width:  64,
	height: 36
}

const $ = jss({
	content: {
		position: 'absolute',
		right:    -size.width + layout.padding.xs,
		top:      -size.height + layout.padding.xs,

		transformOrigin: 'bottom left',
	},

	balloon: {
		...size
	},

	text: {
		...layout.overlay,
		...layout.flex.center,

		font:       fonts.tiny,
		fontWeight: 'bold',
		textAlign:  'center'
	},

	anim: {
		'&-appear': {
			transform: `scale(0.6)`
		},
		'&-appear-active': {
			transform:  `scale(1)`,
			transition: layout.transition(['opacity', 'transform'], animDuration, 'cubic-bezier(0, 2, 1, 2)')
		},
	},
})