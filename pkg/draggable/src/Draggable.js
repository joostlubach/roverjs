import * as React from 'react'
import PropTypes from 'prop-types'
import {findDOMNode} from 'react-dom'
import DragHandle from './DragHandle'
import {DragHandleState, DraggableState} from './flow'

export type Props = {

  className: ?string,
  style:     ?Object,
  children:  ?React.Element,

  /**
   * The left coordinate of the draggable.
   */
  left: number,

  /**
   * The top coordinate of the draggable.
   */
  top: number,

  /**
   * Whether the draggable is enabled.
   */
  enabled: boolean,

  /**
   * Whether the draggable contains drag handles. If left at false, the entire draggable
   * is also the drag handle.
   */
  customHandles: boolean,

  /**
   * The threshold that needs to be dragged before dragging actually starts.
   */
  threshold: number,

  /**
   * If true, the DOM properties `left` and `top` are updated to match the drag state while
   * dragging. This might potentially be faster than updating the props. Note that when
   * dragging ends, these properties are removed.
   */
  updateDOM: boolean,

  /**
   * An optional snapper object.
   */
  snapper: ?Snapper,

  /**
   * Use this to override the calculation to determine the position of the draggable when
   * dragging.
   */
  calculatePosition: ?((state: DraggableState) => void),

  /**
   * Called when dragging starts.
   */
  onStart: (state: DraggableState) => void,

  /**
   * Called when dragging, but before the DOM is updated (in 'dom' mode).
   */
  onDrag: (state: DraggableState) => void,

  /**
   * Called when dragging ends.
   */
  onEnd: () => void,

}

export default class Draggable extends React.Component {

  //------
  // Props & Context

    props: Props

    static defaultProps = {
      enabled:           true,
      threshold:         0,
      customHandles:     false,
      updateDOM:         false,
      snapper:           null,
      calculatePosition: null,

      onStart: () => void 0,
      onDrag:  () => void 0,
      onEnd:   () => void 0
    }

    static childContextTypes = {
      draggable: PropTypes.instanceOf(Draggable)
    }

    getChildContext() {
      return {draggable: this}
    }

  //------
  // Rendering

    render() {
      const {className, style, left, top, children, onMouseDown} = this.props
      const containerProps = {
        className,
        style: {
          ...style,
          position: 'absolute',
          left,
          top
        },
        onMouseDown
      }

      if (this.props.customHandles) {
        return <div {...containerProps}>{children}</div>
      } else {
        return <DragHandle {...containerProps}>{children}</DragHandle>
      }
    }

  //------
  // Drag handlers (called from DragHandle)

    dragState: ?DraggableState = null

    onStart = (state: DragHandleState) => {
      const dom = findDOMNode(this)
      const rect = dom.getBoundingClientRect()

      this.dragState = {
        ...state,
        startLeft: this.props.left,
        startTop: this.props.top,
        left: this.props.left,
        top: this.props.top,
        width: rect.width,
        height: rect.height
      }

      if (this.props.snapper) {
        this.props.snapper.calculateMetrics(dom)
      }

      this.props.onStart(this.dragState)
    }

    onDrag = (state: DragHandleState) => {
      Object.assign(this.dragState, state)
      this.calculatePosition(this.dragState)

      // Perform snapping.
      if (this.props.snapper) {
        const {left, top} = this.dragState
        const {width, height} = this.dragState

        const snappedCoords = this.props.snapper.snap({left, top}, {width, height})
        Object.assign(this.dragState, snappedCoords)
      }

      this.props.onDrag(this.dragState)

      if (this.props.updateDOM) {
        const dom = findDOMNode(this)

        dom.style.willChange = 'left, top'
        dom.style.left = `${this.dragState.left}px`
        dom.style.top = `${this.dragState.top}px`
      }
    }

    onEnd = (state: DragHandleState) => {
      Object.assign(this.dragState, state)
      this.calculatePosition(state)

      if (this.props.snapper) {
        this.props.snapper.end()
      }

      this.props.onEnd(this.dragState)

      if (this.props.updateDOM) {
        const dom = findDOMNode(this)
        dom.style.willChange = ''
      }

      this.dragState = null
    }

  //------
  // Calculation

    calculatePosition(state: DragHandleState) {
      if (this.props.calculatePosition instanceof Function) {
        this.props.calculatePosition(state)
      } else {
        state.left = state.startLeft + state.mouseDelta.x
        state.top = state.startTop + state.mouseDelta.y
      }
    }

}