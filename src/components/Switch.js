// @flow

import React from 'react'
import {Tappable} from '.'
import {jss, colors, layout, shadows} from '../styles'

export type Props = {
	isOn:     boolean,
	onChange: (on: boolean) => void,

	onLabel:  ?string,
	offLabel: ?string,

	className?: ClassNameProp
}
const defaultProps = {
	onLabel:  null,
	offLabel: null,
	onChange: () => void 0
}

export default class Switch extends React.Component<typeof defaultProps, Props, void> {

	render() {
		const {isOn, className, onLabel, offLabel} = this.props

		return (
			<Tappable className={[$.switch, isOn ? $.switchOn : $.switchOff, className]} onTap={this.onTap} focusable={false}>
				{onLabel && <div className={$.onLabel}>{onLabel}</div>}
				{offLabel && <div className={$.offLabel}>{offLabel}</div>}
				<div className={[$.thumb, isOn ? $.thumbOn : $.thumbOff]}/>
			</Tappable>
		)
	}

	onTap = () => {
		const {isOn} = this.props
		this.props.onChange(!isOn)
	}

}

const thumbSize = 24

const $ = jss({
	switch: {
		...layout.flex.row,
		position: 'relative',

		width:        thumbSize * 2 + 6,
		height:       thumbSize + 6,
		borderRadius: thumbSize / 2 + 3,

		backgroundColor: colors.bg.light,
		boxShadow:       ['inset', 1, 1, 2, 0, colors.shadow.alpha(0.6)],
		border:          [1, 'solid', colors.white.alpha(0.6)],

		'&:focus': {
			boxShadow: [
				['inset', 1, 1, 2, 0, colors.shadow.alpha(0.6)],
				shadows.focus
			]
		}
	},

	switchOn: {
		background: colors.positive,
		color:      colors.contrast(colors.positive)
	},

	switchOff: {
		background: colors.bg.medium,
		color:      colors.fg.dim
	},

	thumb: {
		position: 'absolute',
		top:      0,

		width:        thumbSize,
		height:       thumbSize,
		borderRadius: thumbSize / 2,

		backgroundColor: colors.bg.control,
		boxShadow:       [
			['inset', 0, 0, 5, 0, colors.white.alpha(0.4)],
			['inset', 1, 1, 1, 0, colors.white],
			[1, 1, 2, 0, colors.shadow.alpha(0.6)],
		],
		margin: 2
	},

	thumbOff: {
		left:  0,
	},

	thumbOn: {
		right: 0
	}
})