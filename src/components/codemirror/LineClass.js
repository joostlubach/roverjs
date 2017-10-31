// @flow

import React from 'react'
import PropTypes from 'prop-types'
import CodeMirror from 'codemirror'
import classNames from 'classnames'

export type Props = {
	line:       number,
	where:      'text' | 'background' | 'gutter' | 'wrap',
	className?: ClassNameProp
}

export default class LineClass extends React.Component<*, Props, *> {

	props: Props

	static contextTypes = {
		codeMirror: PropTypes.instanceOf(CodeMirror),
	}

	addLineClass(props: Props = this.props) {
		const {line, where, className} = props
		const {codeMirror} = this.context

		codeMirror.addLineClass(line, where, classNames(className))
	}

	removeLineClass(props: Props = this.props) {
		const {line, where, className} = props
		const {codeMirror} = this.context

		codeMirror.removeLineClass(line, where, classNames(className))
	}

	componentDidMount() {
		this.addLineClass()
	}

	componentWillUnmount() {
		this.removeLineClass()
	}

	componentWillReceiveProps(props: Props) {
		this.removeLineClass()
		this.addLineClass(props)
	}

	shouldComponentUpdate(props: Props) {
		if (props.line !== this.props.line) { return true }
		if (props.where !== this.props.where) { return true }
		if (classNames(props.className) !== classNames(this.props.className)) { return true }

		return false
	}

	render() {
		return null
	}

}