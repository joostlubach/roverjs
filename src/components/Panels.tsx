import * as React from 'react'
import * as cn from 'classnames'
import {jss, layout} from '../styles'
import {DragHandle} from 'draggable'
// import {DragHandleState} from 'draggable'
import {isFunction} from 'lodash'

// TO FIX
type DragHandleState = any // tslint:disable-line no-any

export interface Props {
  left?:   JSX.Element,
  right?:  JSX.Element,
  top?:    JSX.Element,
  bottom?: JSX.Element,

  main:      JSX.Element,
  splitter?: JSX.Element,

  splitterSize:    number,
  initialSizes?:   Sizes,
  minimumSizes?:   Sizes,
  horizontalFirst: boolean,
  onPanelResize:   (sizes: Sizes) => void
}

export const defaultProps = {
  splitterSize:    8,
  horizontalFirst: true,
  onPanelResize:   (sizes: Sizes) => void 0
}

export enum Side {left = 'left', right = 'right', top = 'top', bottom = 'bottom'}
export type Sizes = {[side in Side]: number}

type State = {
  sizes: Sizes
}

export default class Panels extends React.Component {

  constructor(props: Props) {
    super(props)

    this.state = {
      sizes: {
        left:   0,
        right:  0,
        top:    0,
        bottom: 0,
        ...props.initialSizes
      }
    }
  }

  props: Props
  static defaultProps = defaultProps

  state: State

  panels: Map<string, HTMLElement | null> = new Map()

  render() {
    const {left, right, top, bottom, main} = this.props

    return (
      <div className={$.panels}>
        {this.renderMain(main)}
        {left && this.renderPanel('left', left)}
        {right && this.renderPanel('right', right)}
        {top && this.renderPanel('top', top)}
        {bottom && this.renderPanel('bottom', bottom)}
      </div>
    )
  }

  renderMain(element: JSX.Element) {
    const style = {}
    for (const side of ['left', 'right', 'top', 'bottom']) {
      if (this.props[side] != null) {
        style[side] = this.state.sizes[side]
      }
    }

    return (
      <div className={$.main} style={style}>
        {element}
      </div>
    )
  }

  renderPanel(side: string, element: JSX.Element) {
    const {splitterSize, horizontalFirst} = this.props

    const style: React.CSSProperties = {}
    if (side === 'left' || side === 'right') {
      if (!horizontalFirst) {
        style.top = this.state.sizes.top
        style.bottom = this.state.sizes.bottom
      }
      style.width = this.state.sizes[side] - splitterSize
    } else {
      if (horizontalFirst) {
        style.left = this.state.sizes.left
        style.right = this.state.sizes.right
      }
      style.height = this.state.sizes[side] - splitterSize
    }

    return (
      <div
        ref={el => { this.panels.set(side, el) }}
        className={cn($.panel, $[`panel_${side}`])}
        style={style}
      >
        {element}
        {this.renderHandle(side)}
      </div>
    )
  }

  renderHandle(side: string) {
    const {splitter, splitterSize}  = this.props

    const style: React.CSSProperties = {}
    if (side === 'left' || side === 'right') {
      style.width = splitterSize
      style[side === 'left' ? 'right' : 'left'] = -splitterSize
    } else {
      style.height = splitterSize
      style[side === 'top' ? 'bottom' : 'top'] = -splitterSize
    }

    return (
      <DragHandle
        className={cn($.handle, $[`handle_${side}`])}
        style={style}
        onStart={this.onHandleDragStart.bind(this, side)}
        onEnd={this.onHandleDragEnd}
        onDrag={this.onHandleDrag.bind(this, side)}
      >
        {isFunction(splitter) ? splitter(side) : splitter}
      </DragHandle>
    )
  }

  startSize: number = 0

  onHandleDragStart = (side: string) => {
    this.startSize = this.state.sizes[side] || 0
  }

  onHandleDragEnd = () => {
    this.startSize = 0
    this.props.onPanelResize(this.state.sizes)
  }

  onHandleDrag = (side: string, state: DragHandleState) => {
    const sizes = {...this.state.sizes}
    const delta = side === 'left' || side === 'right' ? state.mouseDelta.x : state.mouseDelta.y
    const multiplier = side === 'left' || side === 'top' ? 1 : -1
    sizes[side] = this.startSize + delta * multiplier

    const {minimumSizes} = this.props
    if (minimumSizes != null) {
      sizes.left = minimumSizes.left == null ? sizes.left : Math.max(sizes.left, minimumSizes.left)
      sizes.right = minimumSizes.right == null ? sizes.right : Math.max(sizes.right, minimumSizes.right)
      sizes.top = minimumSizes.top == null ? sizes.top : Math.max(sizes.top, minimumSizes.top)
      sizes.bottom = minimumSizes.bottom == null ? sizes.bottom : Math.max(sizes.bottom, minimumSizes.bottom)
    }

    this.setState({sizes})
  }

}

const $ = jss({

  panels: {
    ...layout.overlay,
  },

  main: {
    ...layout.overlay,
  },

  panel: {
    position: 'absolute'
  },

  panel_left: {
    left:   0,
    top:    0,
    bottom: 0
  },

  panel_right: {
    right:  0,
    top:    0,
    bottom: 0
  },

  panel_top: {
    left:  0,
    right: 0,
    top:   0
  },

  panel_bottom: {
    left:   0,
    right:  0,
    bottom: 0
  },

  handle: {
    position: 'absolute',
  },

  handle_left:   {top: 0, bottom: 0, cursor: 'ew-resize'},
  handle_right:  {top: 0, bottom: 0, cursor: 'ew-resize'},
  handle_top:    {left: 0, right: 0, cursor: 'ns-resize'},
  handle_bottom: {left: 0, right: 0, cursor: 'ns-resize'}

})