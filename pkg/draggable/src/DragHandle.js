// @flow

import React from 'react'
import PropTypes from 'prop-types'
import type {DragHandleState} from './flow'

export type Props = {

	className: ?string,
	style:     ?Object,
	children:  ?React.Element,

	/**
	 * Whether the drag handle is enabled.
	 */
	enabled: ?boolean,

	/**
	 * The threshold that needs to be dragged before dragging actually starts.
	 */
	threshold: ?number,

	/**
	 * Called when dragging starts.
	 */
	onStart: ?((state: DragHandleState) => void),

	/**
	 * Called when dragging, but before the DOM is updated (in 'dom' mode).
	 */
	onDrag: ?((state: DragHandleState) => void),

	/**
	 * Called when dragging ends.
	 */
	onEnd: ?((state: DragHandleState) => void),

}

export default class DragHandle extends React.Component {

	//------
	// Props & Context

	props: Props
	static defaultProps = {}

	static contextTypes = {
		draggable: PropTypes.object
	}

	get draggableProps(): Props {
		const props = {
			enabled:   true,
			threshold: 0
		}

		if (this.context.draggable != null) {
			Object.assign(props, {
				...this.context.draggable.props,
				onStart: this.context.draggable.onStart,
				onDrag:  this.context.draggable.onDrag,
				onEnd:   this.context.draggable.onEnd
			})
		}

		Object.assign(props, this.props)
		return props
	}

	//------
	// Drag state

	dragState: ?DragState = null
	dragActive = false

	//------
	// Rendering

	render() {
		return (
			<div
				className={this.props.className}
				style={this.props.style}
				onMouseDown={this.onMouseDown}
				onTouchStart={this.onMouseDown}
			>
				{this.props.children}
			</div>
		)
	}

	//------
	// Events

	onMouseDown = (e: MouseEvent) => {
		if (!this.draggableProps.enabled) { return }
		if (this.dragState != null) { return }

		this.dragState = {
			mouseStart:   {x: e.pageX, y: e.pageY},
			mouseCurrent: {x: e.pageX, y: e.pageY},
			mouseDelta:   {x: 0, y: 0}
		}

		window.addEventListener('mousemove', this.onMouseMove)
		window.addEventListener('mouseup', this.onMouseUp)
		window.addEventListener('touchmove', this.onMouseMove)
		window.addEventListener('touchend', this.onMouseUp)

		e.preventDefault()
	}

	onMouseMove = (e: MouseEvent) => {
		if (this.dragState == null) {
			return
		}

		this.dragState.mouseCurrent.x = e.pageX
		this.dragState.mouseCurrent.y = e.pageY
		this.dragState.mouseDelta.x = e.pageX - this.dragState.mouseStart.x
		this.dragState.mouseDelta.y = e.pageY - this.dragState.mouseStart.y

		if (Math.abs(this.dragState.mouseDelta.x) > this.draggableProps.threshold || Math.abs(this.dragState.mouseDelta.y) > this.draggableProps.threshold) {
			if (!this.dragActive) {
				this.dragActive = true
				if (this.draggableProps.onStart) {
					this.draggableProps.onStart(this.dragState)
				}
			}

			this.draggableProps.onDrag(this.dragState)
		}
	}

	onMouseUp = (e: MouseEvent) => {
		if (this.dragState == null) {
			return
		}

		if (this.dragActive && this.draggableProps.onEnd) {
			this.draggableProps.onEnd(this.dragState)
		}

		this.dragState = null
		this.dragActive = false
	}

}