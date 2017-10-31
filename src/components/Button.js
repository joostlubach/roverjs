// @flow

import React from 'react'
import {jss, colors, layout, fonts} from '../styles'
import {Tappable, SVG} from '.'
import type {TappableState} from './Tappable'
import type Color from 'color'

export type Props = {
	icon:     string,
	label:    string,
	color:    Color,
	disabled: boolean,
	small?:   boolean,
	onTap:    () => void
}
export const defaultProps = {
	color: colors.blue
}

type State = {
	tappableState: TappableState
}

export default class Button extends React.Component<*, Props, *> {

	props: Props
	static defaultProps = defaultProps

	state: State = {
		tappableState: null
	}

	render() {
		const {icon, label, small, disabled, color, onTap} = this.props

		const {tappableState} = this.state
		const style = {
			background: select(disabled ? 'disabled' : tappableState, {
				hover:    color.lighten(0.1).string(),
				active:   color.darken(0.1).string(),
				disabled: color.string(),
				default:  color.string()
			}),
			color: colors.contrast(color).string()
		}

		return (
			<Tappable
				className={[$.button, disabled && $.buttonDisabled, small && $.buttonSmall]}
				style={style}

				focusable={!disabled}
				onTap={disabled ? null : onTap}
				onStateChange={state => { this.setState({tappableState: state}) }}
			>
				{icon && <SVG className={[$.icon, small && $.iconSmall]} name={icon}/>}
				<div className={[$.label, small && $.labelSmall]}>{label}</div>
			</Tappable>
		)
	}

}

function select<T, U>(key: T, map: {[key: T | 'default']: U}): ?U {
	if (key in map) {
		return map[key]
	} else if ('default' in map) {
		return map.default
	}
}

const $ = jss({
	button: {
		...layout.flex.column,
		alignItems:     'center',
		justifyContent: 'space-around',
		padding:        layout.padding.s,

		borderRadius: layout.radius.m,
		color:        colors.fg.inverted,

		cursor: 'pointer'
	},

	buttonSmall: {
		padding: layout.padding.xs,
	},

	buttonDisabled: {
		opacity: 0.3,
		cursor:  'default',

		'&:focus': {
			boxShadow: 'none'
		}
	},

	icon: {
		width:  36,
		height: 36
	},

	label: {
		font:          fonts.smallCaps,
		textTransform: 'uppercase',
		fontWeight:    500
	},

	iconSmall: {
		width:  24,
		height: 24
	},

	labelSmall: {
	}
})