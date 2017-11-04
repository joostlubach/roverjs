// @flow

import React from 'react'
import type {ButtonColor, ButtonType} from './Button'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import {Button, Markdown} from '.'
import {jss, layout, colors, fonts} from '../styles'

export type MessageBoxButton<T> = {
	icon?:    string,
	caption?: string,
	type?:    ButtonType,
	color?:   ButtonColor,
	style?:   StyleProp,
	result:   T
}

export type Props<T> = {
	title:     string,
	message?:  string,
	body?:     any,
	buttons:   MessageBoxButton<T>[],

	className?: ClassNameProp
}
type InjectedProps<T> = {
	resolve: (result: T) => void
}
type AllProps<T> = CombinedProps<Props<T>, InjectedProps<T>>

let hostRef: ?Host = null

export default class MessageBox<T> extends React.Component<void, Props<T>, void> {

	props: AllProps<T>

	static show<T>(props: Props<T>): Promise<T> {
		if (hostRef == null) {
			throw new ReferenceError(`No MessageBox.Host found, have you added one to your application?`)
		}

		return new Promise(resolve => {
			hostRef.push(this, {...props, resolve})
		})
	}

	render() {
		const {className} = this.props
		return (
			<div className={[$.messageBox, className]}>
				{this.renderHeader()}
				{this.renderBody()}
				{this.renderButtons()}
			</div>
		)
	}

	renderHeader() {
		const {title} = this.props
		if (title == null) { return }

		return (
			<div className={$.header}>
				<h1 className={$.title}>{title}</h1>
			</div>
		)
	}

	renderBody() {
		const {body, message} = this.props

		return (
			<div className={$.body}>
				{message && <Markdown className={$.message}>{message}</Markdown>}
				{body && <div>{body}</div>}
			</div>
		)
	}

	renderButtons() {
		const {buttons} = this.props

		return (
			<div className={$.buttons}>
				{buttons.map(::this.renderButton)}
			</div>
		)
	}

	renderButton(button: MessageBoxButton<T>, index: number) {
		const {result, className, ...props} = button
		return (
			<Button
				key={index}
				className={[$.button, className]}
				{...props}
				onTap={this.onButtonTap.bind(this, result)}
			/>
		)
	}

	onButtonTap(result: T) {
		this.props.resolve(result)
		if (hostRef != null) {
			hostRef.pop()
		}
	}

}

type MessageBoxClass = Class<React.Component<*, Props, *>>
type HostState = {
	messageBoxes: Array<{Component: MessageBoxClass, props: Props}>
}

export class Host extends React.Component<void, {}, HostState> {

	state: HostState = {
		messageBoxes: []
	}

	componentDidMount() {
		hostRef = this
	}

	componentWillUnmount() {
		hostRef = null
	}

	push(Component: MessageBoxClass, props: Props) {
		const {messageBoxes} = this.state
		this.setState({messageBoxes: [...messageBoxes, {Component, props}]})
	}

	pop() {
		const {messageBoxes} = this.state
		if (messageBoxes.length === 0) {
			return
		}

		this.setState({messageBoxes: messageBoxes.slice(0, -2)})
	}

	render() {
		const {messageBoxes} = this.state

		return (
			<div className={$.host}>
				{messageBoxes.length > 0 && <div className={$.shim}/>}
				<ReactCSSTransitionGroup className={$.messageBoxes} component="div" transitionName={$.anim} transitionEnterTimeout={animDuration} transitionLeaveTimeout={animDuration}>
					{messageBoxes.map(({Component, props}, index) => (
						<Component key={index} {...props}/>
					))}
				</ReactCSSTransitionGroup>
			</div>
		)
	}

}
MessageBox.Host = Host

const animDuration = 300

const $ = jss({
	host: {
		...layout.overlay,
		position: 'fixed',
		zIndex:   layout.z.messageBox,

		pointerEvents: 'none'
	},

	shim: {
		...layout.overlay,
		background: colors.bg.overlay,

		pointerEvents: 'auto'
	},

	messageBoxes: {
		...layout.overlay,

		...layout.flex.column,
		alignItems:     'center',
		justifyContent: 'center',
		padding:        layout.padding.s
	},

	anim: {
		'&-enter': {
			opacity:   0.3,
			transform: `scale(0.9)`
		},
		'&-enter-active': {
			opacity:    1,
			transform:  `scale(1)`,
			transition: layout.transition(['opacity', 'transform'], animDuration, 'cubic-bezier(0.22, 0.61, 0.36, 1)')
		},
		'&-leave': {
			transform:  `scale(1)`,
		},
		'&-leave-active': {
			opacity:    0,
			transform:  `scale(0.9)`,
			transition: layout.transition(['opacity', 'transform'], animDuration, 'cubic-bezier(0.22, 0.61, 0.36, 1)')
		}
	},

	messageBox: {
		flex:       [0, 1, 'auto'],
		overflow:   'auto',
		maxWidth:   480,

		border: [4, 'solid', colors.primary],

		pointerEvents: 'auto',

		background:    colors.bg.light,
		borderRadius:  layout.radius.m,
	},

	header: {
		...layout.flex.center,
		borderRadius: [layout.radius.m - 4, layout.radius.m - 4, 0, 0],
		padding:      layout.padding.s,

		background:   colors.primary,
		color:        colors.fg.inverted,

		font:          fonts.digitalLarge,
		textTransform: 'uppercase',
	},

	body: {
		minWidth:   360,
		padding:    layout.padding.m,
		...layout.flex.center,

		'& > :not(:last-child)': {
			marginBottom: layout.padding.m
		}
	},

	message: {
		textAlign: 'center'
	},

	buttons: {
		...layout.flex.row,
		alignItems:     'center',
		justifyContent: 'center',

		padding:        [layout.padding.s, layout.padding.s],
		borderRadius:   [0, 0, layout.radius.m, layout.radius.m],

		'& :not(:last-child)': {
			marginRight: layout.padding.s
		}
	},

	button: {
		borderRadius: 0
	}
})