// @flow

import React from 'react'
import PropTypes from 'prop-types'
import CodeMirrorEl from 'codemirror'
import Gutter from './Gutter'
import {jss} from '../../styles'
import {lineHeight} from './layout'

export type Props = {
	theme:      string,
	options:    Object,
	autoFocus:  boolean,

	value:      string,
	onChange:   (value: string) => void,

	children?:  any,
	className?: ClassNameProp
}

export const defaultProps = {
	theme:     'monokai',
	autoFocus: true,
	value:     '',

	onChange:  (value: string) => void 0
}

export const defaultOptions = {
	lineNumbers: true
}

type State = {
	codeMirror:   ?CodeMirrorEl
}

export default class CodeMirror extends React.Component<*, Props, *> {

	//------
	// Properties

	props: Props
	static defaultProps = defaultProps

	currentValue: string = ''

	state: State = {
		codeMirror:   null
	}

	textArea: ?HTMLTextAreaElement = null

	static childContextTypes = {
		codeMirror: PropTypes.instanceOf(CodeMirrorEl)
	}

	getChildContext() {
		return {
			codeMirror: this.state.codeMirror
		}
	}

	get options(): Object {
		const {options, theme} = this.props

		return {
			...defaultOptions,
			...options,
			theme,
			gutters: this.gutters
		}
	}

	get gutters(): string[] {
		const gutters = []
		React.Children.forEach(this.props.children, child => {
			if (child == null) { return }
			if (child.type !== Gutter) { return }
			gutters.push(child.props.name)
		})
		return gutters
	}

	//------
	// Loading

	load(value: string) {
		const {codeMirror} = this.state
		if (codeMirror == null) { return }

		codeMirror.setValue(value)
	}

	//------
	// Set up & destroy

	setupCodeMirror() {
		const codeMirror = CodeMirrorEl.fromTextArea(this.textArea, this.options)
		codeMirror.on('change', this.onChange.bind(this))
		this.setState({codeMirror: codeMirror})
		return codeMirror
	}

	destroyCodeMirror() {
		if (this.codeMirror == null) { return }

		this.codeMirror.toTextArea()
	}

	updateValue(value: string) {
		if (value === this.currentValue) { return }

		const {codeMirror} = this.state
		if (codeMirror == null) { return }

		codeMirror.setValue(value)
		this.currentValue = value
	}

	//------
	// Component lifecycle

	componentDidMount() {
		const codeMirror = this.setupCodeMirror()

		codeMirror.setValue(this.props.value)
		this.currentValue = this.props.value
	}

	componentWillUnmount() {
		this.destroyCodeMirror()
	}

	componentWillReceiveProps(props: Props) {
		this.updateValue(props.value)
	}

	//------
	// Rendering

	render() {
		const {className, children} = this.props
		const {codeMirror} = this.state

		return (
			<div className={[$.editor, className]}>
				<textarea ref={el => { this.textArea = el }}/>
				{codeMirror != null && children}
			</div>
		)
	}

	//------
	// Events

	onChange(doc: any, change: any) {
		if (change.origin === 'setValue') { return }

		this.currentValue = doc.getValue()
		this.props.onChange(this.currentValue, change)
	}

}

const $ = jss({
	editor: {
		'& .CodeMirror': {
			flex:       [1, 0, 0],
			fontSize:   '16px',
			lineHeight: `${lineHeight}px`
		}
	}
})