// @flow

import * as React from 'react'
import * as PropTypes from 'prop-types'
import {DragHandleState} from '.'

export interface Props {

  className?: string

  style?: React.CSSProperties

  children?: JSX.Element

  /**
   * Whether the drag handle is enabled.
   */
  enabled?: boolean

  /**
   * The threshold that needs to be dragged before dragging actually starts.
   */
  threshold?: number

  /**
   * Called when dragging starts.
   */
  onStart?: (state: DragHandleState) => void

  /**
   * Called when dragging but before the DOM is updated (in 'dom' mode).
   */
  onDrag?: (state: DragHandleState) => void

  /**
   * Called when dragging ends.
   */
  onEnd?: (state: DragHandleState) => void

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

  dragState: DragHandleState | null = null
  dragActive = false

  //------
  // Dragging

  startDrag(pageX: number, pageY: number): boolean {
    if (!this.draggableProps.enabled) { return false }
    if (this.dragState != null) { return false }

    this.dragState = {
      mouseStart:   {x: pageX, y: pageY},
      mouseCurrent: {x: pageX, y: pageY},
      mouseDelta:   {x: 0, y: 0}
    }

    return true
  }

  drag(pageX: number, pageY: number) {
    const {dragState} = this
    if (dragState == null) { return }

    dragState.mouseCurrent.x = pageX
    dragState.mouseCurrent.y = pageY
    dragState.mouseDelta.x = pageX - dragState.mouseStart.x
    dragState.mouseDelta.y = pageY - dragState.mouseStart.y

    if (!this.dragActive && this.isSignificantDrag(dragState)) {
      this.dragActive = true
      if (this.draggableProps.onStart) {
        this.draggableProps.onStart(dragState)
      }
    }

    if (this.dragActive && this.draggableProps.onDrag) {
      this.draggableProps.onDrag(dragState)
    }
  }

  endDrag() {
    if (this.dragState == null) {
      return
    }

    if (this.dragActive && this.draggableProps.onEnd) {
      this.draggableProps.onEnd(this.dragState)
    }

    this.dragState = null
    this.dragActive = false
  }

  isSignificantDrag(state: DragHandleState) {
    const {threshold} = this.draggableProps
    if (threshold == null) { return true }

    const dx = Math.abs(state.mouseDelta.x)
    const dy = Math.abs(state.mouseDelta.y)
    return dx >= threshold || dy > threshold
  }

  //------
  // Rendering

  render() {
    return (
      <div
        className={this.props.className}
        style={this.props.style}
        onMouseDown={this.onMouseDown}
        onTouchStart={this.onTouchStart}
      >
        {this.props.children}
      </div>
    )
  }

  //------
  // Events

  onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const {pageX, pageY} = e.changedTouches[0]
    
    if (this.startDrag(pageX, pageY)) {
      window.addEventListener('touchmove', this.onTouchMove)
      window.addEventListener('touchend', this.onTouchEnd)
    }
  }

  onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const {pageX, pageY} = e
    if (this.startDrag(pageX, pageY)) {
      window.addEventListener('mousemove', this.onMouseMove)
      window.addEventListener('mouseup', this.onMouseUp)
    }
    e.preventDefault()
  }

  onTouchMove = (e: TouchEvent) => {
    const {pageX, pageY} = e.changedTouches[0]
    this.drag(pageX, pageY)
  }

  onMouseMove = (e: MouseEvent) => {
    const {pageX, pageY} = e
    this.drag(pageX, pageY)
  }

  onTouchEnd = () => {
    this.endDrag()
  }

  onMouseUp = () => {
    this.endDrag()
  }

}