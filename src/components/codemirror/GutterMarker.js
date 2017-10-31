// @flow

import React from 'react'
import classNames from 'classnames'
import {unstable_renderSubtreeIntoContainer as renderSubtreeIntoContainer, unmountComponentAtNode} from 'react-dom'
import CodeMirror from 'codemirror'
import PropTypes from 'prop-types'
import {Tappable} from '..'
import {jss, layout} from '../../styles'
import {lineHeight} from './layout'

export type Props = {
	line:  number,
	onTap: ?(() => void),

	className?: ClassNameProp,
	children?:  any
}

export default class GutterMarker extends React.Component<*, Props, *> {

	props: Props & {gutter: string}

	element: ?HTMLElement = null

	static contextTypes = {
		codeMirror: PropTypes.instanceOf(CodeMirror)
	}

	//------
	// Element

	create() {
		const {codeMirror} = this.context
		const {line, gutter} = this.props

		this.element = document.createElement('div')
		codeMirror.setGutterMarker(line, gutter, this.element)

		this.rerender()
	}

	destroy() {
		const {codeMirror} = this.context
		const {element, props: {line, gutter}} = this
		if (element == null) { return }

		codeMirror.setGutterMarker(line, gutter, null)
		unmountComponentAtNode(this.element)
	}

	//------
	// Component lifecycle

	componentDidMount() {
		this.create()
	}

	componentWillUnmount() {
		this.destroy()
	}

	componentWillReceiveProps(props: Props) {
		if (props.line !== this.props.line || props.gutter !== this.props.gutter) {
			this.destroy()
			this.create()
		} else {
			this.rerender(props)
		}
	}

	shouldComponentUpdate(props: Props) {
		if (props.line !== this.props.line) { return true }
		if (props.onTap !== this.props.onTap) { return true }
		if (props.children !== this.props.children) { return true }
		if (classNames(props.className) !== classNames(this.props.className)) { return true }

		return false
	}

	rerender(props: Props = this.props) {
		const {element} = this
		if (element == null) { return }

		renderSubtreeIntoContainer(this, this.renderMarker(props), element)
	}

	//------
	// Rendering

	render() {
		return null
	}

	renderMarker(props: Props) {
		const {className, onTap, children} = props
		const Component = onTap != null ? Tappable : 'div'
		const tapProps = onTap != null ? {onTap} : {}

		return (
			<div className={$.gutterMarkerContainer}>
				<Component className={className} {...tapProps}>
					{children}
				</Component>
			</div>
		)
	}

}

const $ = jss({
	gutterMarkerContainer: {
		height: lineHeight,
		...layout.flex.center
	}
})