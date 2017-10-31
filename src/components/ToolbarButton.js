// @flow

import React from 'react'
import {jss, colors, layout, fonts} from '../styles'
import {Tappable, SVG} from '.'

export type Props = {
	icon:     string,
	label:    string,
	disabled: boolean,
	onTap:    () => void
}

export default class ToolbarButton extends React.Component<*, Props, *> {

	props: Props

	render() {
		const {icon, label, disabled, onTap} = this.props

		return (
			<Tappable className={[$.button, disabled && $.buttonDisabled]} onTap={disabled ? null : onTap}>
				<SVG className={$.icon} name={icon}/>
				<div className={$.label}>{label}</div>
			</Tappable>
		)	
	}

}

const $ = jss({
	button: {
		...layout.flex.column,
		alignItems:     'center',
		justifyContent: 'space-around',
		padding:        layout.padding.s,

		border:       [1, 'solid', colors.transparent],
		borderRadius: layout.radius.m,

		cursor: 'pointer',
		
		'&:hover': {
			borderColor: colors.fg.inverted.alpha(0.2)
		}
	},

	buttonDisabled: {
		opacity: 0.6,
		cursor:  'default',

		'&:hover': {
			borderColor: colors.transparent
		},
		'&:focus': {
			boxShadow: 'none'
		}
	},

	icon: {
		width:  48,
		height: 48
	},

	label: {
		font:          fonts.smallCaps,
		textTransform: 'small-caps',
		fontWeight:    500
	}
})