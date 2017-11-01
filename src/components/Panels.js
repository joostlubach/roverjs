// @flow

import React from 'react'
import {jss, layout} from '../styles'
import {DragHandle} from 'draggable'
import type {DragHandleState} from 'draggable'

export type Props = {
	left?:     any,
	right?:    any,
	main?:     any,
	splitter?: any,

	splitterSize: number,
	initialSizes?: Sizes,
	onPanelResize: (sizes: Sizes) => void
}

export const defaultProps = {
	splitterSize:  8,
	onPanelResize: (sizes: Sizes) => void 0
}

type Side = 'left' | 'right'
type Sizes = {[side: Side]: number}

type State = {
	sizes: Sizes
}

export default class Panels extends React.Component<*, Props, *> {

	constructor(props: Props) {
		super(props)

		this.state = {
			sizes: {
				left:  0,
				right: 0,
				...props.initialSizes
			}
		}
	}

	props: Props
	static defaultProps = defaultProps

	state: State

	panels: Map<string, ?HTMLElement> = new Map()

	render() {
		const {left, right, main} = this.props

		return (
			<div className={$.panels}>
				{this.renderMain(main)}
				{left && this.renderPanel('left', left)}
				{right && this.renderPanel('right', right)}
			</div>
		)
	}

	renderMain(element: ?any) {
		const {left, right} = this.state.sizes

		return (
			<div className={$.main} style={{left: left, right: right}}>
				{element}
			</div>
		)
	}

	renderPanel(side: string, element: any) {
		const {splitterSize} = this.props

		return (
			<div
				ref={el => { this.panels.set(side, el) }}
				className={[$.panel, $[`panel_${side}`]]}
				style={{width: this.state.sizes[side] - splitterSize}}
			>
				{element}
				{this.renderHandle(side)}
			</div>
		)
	}

	renderHandle(side: string) {
		const {splitter, splitterSize}  = this.props

		const style = {}
		style.width = splitterSize
		style[side === 'left' ? 'right' : 'left'] = -splitterSize

		return (
			<DragHandle
				className={[$.handle, $[`handle_${side}`]]}
				style={style}
				onStart={this.onHandleDragStart.bind(this, side)}
				onEnd={this.onHandleDragEnd}
				onDrag={this.onHandleDrag.bind(this, side)}
			>
				{splitter}
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
		sizes[side] = this.startSize + state.mouseDelta.x
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
		right:   0,
		top:     0,
		bottom:  0
	},

	handle: {
		position: 'absolute',
		cursor:   'ew-resize'
	},

	handle_left: {
		top:        0,
		bottom:     0,
	},

	handle_right: {
		top:        0,
		bottom:     0,
	}

})