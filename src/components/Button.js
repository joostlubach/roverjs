// @flow

import React from 'react'
import {jss, layout, colors, fonts, shadows} from '../styles'
import {Tappable, Icon, Spinner} from '.'
import type {TappableState} from './Tappable'
import type Color from 'color'

export type ButtonType = 'clear' | 'push' | 'link'

export type Props = {
	icon:      ?string,
	label:     ?string,
	color:     Color,
	type:      ?ButtonType,
	disabled:  boolean,
	submit:    boolean,
	small?:    boolean,
	dim?:      boolean,

	working:   boolean,

	children?: any,

	className?:        ClassNameProp,
	iconClassName?:    ClassNameProp,
	labelClassName?: ClassNameProp,

	onTap:     () => void
}
const defaultProps = {
	icon:     null,
	label:    null,
	color:    colors.blue,
	type:     null,
	disabled: false,
	submit:   false,

	onTap:   () => void 0
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
		const {
			icon,
			label,
			children,

			color,

			disabled,
			working,
			submit,
			small,
			dim,

			className,
			iconClassName,
			labelClassName,
		} = this.props

		const hasLabel = (label != null || children != null)
		const iconOnly = icon != null && !hasLabel
		const type = this.props.type || (iconOnly ? 'clear' : 'push')

		const classNames = [
			$.button,
			$[`button_${type}`],

			disabled && $.disabled,
			iconOnly && $.iconOnly,
			small    && $.smallButton,
			className
		]

		const {tappableState} = this.state

		const buttonStyles = {}
		const labelStyles  = {}
		const spinnerProps = {}
		const iconStyles   = {}

		switch (type) {
		case 'clear':
			labelStyles.color   = tappableState === 'active' ? color.alpha(0.6).string() : tappableState === 'hover' ? color.alpha(0.2).string() : color.string()
			iconStyles.fill     = labelStyles.color
			spinnerProps.color  = color
			break

		case 'link':
			labelStyles.color   = tappableState === 'active' ? color.alpha(0.6).string() : tappableState === 'hover' ? color.string() : dim ? colors.fg.dim.string() : null
			iconStyles.fill     = labelStyles.color
			spinnerProps.color  = color
			break

		case 'push':
			buttonStyles.backgroundColor = tappableState === 'active' ? color.darken(0.2).string() : tappableState === 'hover' ? color.darken(0.05).string() : color
			labelStyles.color            = colors.contrast(color).string()
			iconStyles.fill              = colors.contrast(color).string()
			spinnerProps.color           = color
			break
		}

		const submitProps = submit ? {tag: 'button', type: 'submit'} : {}

		return (
			<Tappable
				className={classNames}
				style={buttonStyles}
				{...submitProps}
				disabled={working || disabled}
				onTap={this.onTap}
				focusable={false}
				onStateChange={state => { this.setState({tappableState: state}) }}
			>
				{working && <Spinner {...spinnerProps}/>}
				{!working && icon != null && this.renderIcon(icon, iconClassName, iconStyles)}
				{!working && hasLabel && this.renderLabel(labelClassName, labelStyles)}
			</Tappable>
		)
	}

	renderIcon(icon: string, iconClassName: ?ClassNameProp, iconStyles: Object) {
		const {working, disabled, small, type} = this.props

		const classNames = [
			$.icon,
			$[`icon_${type}`],
			(working || disabled) && $.disabledContent,
			small && $.smallIcon,
			iconClassName
		]

		return (
			<Icon
				className={classNames}
				style={iconStyles}
				name={icon}
			/>
		)
	}

	renderLabel(labelClassName: ?ClassNameProp, labelStyles: Object) {
		const {type, working, disabled, label, small, children} = this.props

		const classNames = [
			$.label,
			$[`label_${type}`],
			(working || disabled) && $.disabledContent,
			small && $.smallLabel,
			labelClassName,
		]

		return (
			<div className={classNames} style={labelStyles}>
				{label || children}
			</div>
		)
	}

	onTap = (e: Event) => {
		this.props.onTap(e)
		e.preventDefault()
	}

}

const $ = jss({
	button: {
		...layout.flex.row,
		alignItems:     'center',
		justifyContent: 'center',

		borderRadius: layout.radius.m,
		cursor:       'pointer',

		'-webkit-tap-highlight-color': 'transparent'
	},

	disabled: {
		'&:focus': {
			outline:   0,
			boxShadow: 'none'
		}
	},

	disabledContent: {
		opacity: 0.3,
	},

	button_push: {
		backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(0, 0, 0, 0.05))',
		padding:         [layout.padding.xs, layout.padding.m],
		border:          [1, 'solid', colors.white],
		boxShadow:       [0, 1, 2, 0, colors.shadow.alpha(0.2)],

		'&:focus': {
			boxShadow: shadows.focus
		},
	},

	button_clear: {
		'&:focus': {
			color: colors.blue
		},
	},

	button_link: {
		'&:focus': {
			color: colors.blue
		},
	},

	iconOnly: {
		...layout.icon.normal
	},

	icon: {
		...layout.icon.normal,
		display: 'block',

		'& + div': {
			marginLeft: layout.padding.s,
		}
	},

	label: {
		font:    fonts.normal,

		...layout.flex.column,
		alignItems: 'center',
		textAlign:  'center'
	},

	label_push: {
		font:          fonts.small,
		textTransform: 'uppercase'
	},

	smallIcon: {
		...layout.icon.small
	},

	smallLabel: {
		font: fonts.small
	}
})