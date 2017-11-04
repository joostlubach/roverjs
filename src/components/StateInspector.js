// @flow

import React from 'react'
import {observer} from 'mobx-react'
import {jss, colors, layout, fonts, shadows} from '../styles'
import {CodeMirror} from './codemirror'
import type {ProgramState} from '../program'

export type Props = {
	state:    ProgramState,
	hideKeys: string[]
}

export const defaultProps = {
	hideKeys: ['items', 'failedPosition']
}

@observer
export default class StateInspector extends React.Component<*, Props, *> {

	props: Props
	static defaultProps = defaultProps

	render() {
		return (
			<div className={$.stateInspector}>
				{this.renderHeader()}
				{this.renderCodeMirror()}
			</div>
		)
	}

	renderHeader() {
		return (
			<div className={$.header}>
				State
			</div>
		)
	}

	renderCodeMirror() {
		const {state, hideKeys} = this.props
		const replacer = (k, v) => hideKeys.includes(k) ? undefined : v
		const json = JSON.stringify(state, replacer, 2)

		return (
			<CodeMirror
				className={$.codeMirror}
				mode={{name: 'javascript', json: true}}
				value={json}
				theme='zenburn'
				options={{lineNumbers: false, readOnly: true}}
			/>
		)
	}

}

const $ = jss({
	stateInspector: {
		...layout.overlay,
		...layout.flex.column
	},

	header: {
		position:     'relative',
		marginTop:    -4,
		zIndex:       10,
		background:   colors.purple.darken(0.05),
		borderBottom: [1, 'solid', colors.white.alpha(0.2)],
		boxShadow:    shadows.toolbar,

		color:         colors.fg.inverted,
		padding:       layout.padding.s,
		font:          fonts.smallCaps,
		textTransform: 'uppercase'
	},

	codeMirror: {
		flex: [1, 0, 0],
		...layout.flex.column
	}
})