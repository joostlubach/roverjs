// @flow

import React from 'react'
import {jss, jssKeyframes, colors, layout} from '../styles'
import {Sprite, SVG} from '.'
import type {Props as SpriteProps} from './Sprite'
import type {Direction} from '../program'

export type Props = SpriteProps & {
	direction:          Direction,
	transitionDuration: number,
	jumpForJoy:         boolean,
	shame:              boolean
}

export const defaultProps = {
	transitionDuration: 0,
	jumpForJoy:         false,
	shame:              false
}

type State = {
	degrees: number
}

export default class Robot extends React.Component<*, Props, *> {

	constructor(props: Props) {
		super(props)

		this.state = {
			degrees: degreesForDirection(props.direction)
		}
	}

	props: Props
	static defaultProps = defaultProps

	componentWillReceiveProps(props: Props) {
		if (props.direction !== this.props.direction) {
			this.setState({degrees: degreesForDirection(props.direction, this.props.direction, this.state.degrees)})
		}
	}

	render() {
		const {x, y, transitionDuration, jumpForJoy, shame} = this.props
		const style = {
			transform:          `rotateZ(${this.state.degrees}deg)`,
			transitionDuration: `${transitionDuration}ms`
		}

		return (
			<Sprite className={[$.robot]} {...{x, y}} style={style}>
				<div className={[$.svgContainer, jumpForJoy && $.jumpingForJoy1]}>
					<SVG className={[$.svg, shame && $.shaming, jumpForJoy && $.jumpingForJoy2]} name='robot'/>
				</div>
			</Sprite>
		)
	}

}

function degreesForDirection(direction: Direction, existing: Direction = 'up', existingDegrees: number = 0): string {
	return existingDegrees + directionDiff(existing, direction)
}

function directionDiff(from: Direction, to: Direction) {
	switch (`${from}-${to}`) {
	case 'up-up': case 'right-right': case 'down-down': case 'left-left': return 0
	case 'up-right': case 'right-down': case 'down-left': case 'left-up': return 90
	case 'up-down': case 'right-left': case 'down-up': case 'left-right': return 180
	case 'up-left': case 'right-up': case 'down-right': case 'left-down': return -90
	}
}

const rotateAnim = jssKeyframes('rotate', {
	'0%':   {transform: 'rotateZ(0)'},
	'100%': {transform: 'rotateZ(-360deg)'},
})

const scaleAnim = jssKeyframes('scale', {
	'0%':   {transform: 'scale(1)', animationTimingFunction: 'ease-out'},
	'50%':  {transform: 'scale(2)', fill: colors.green.string(), animationTimingFunction: 'ease-in'},
	'100%': {transform: 'scale(1)'},
})

const shameAnim = jssKeyframes('shame', {
	'0%':   {transform: 'scale(1)', animationTimingFunction: 'ease-out'},
	'50%':  {transform: 'scale(0.8)', fill: colors.red.string(), animationTimingFunction: 'ease-in'},
	'100%': {transform: 'scale(1)'},
})

const $ = jss({
	robot: {
		...layout.transition(['top', 'left', 'transform'], 0)
	},

	svgContainer: {
		...layout.overlay,
		...layout.flex.center,
	},

	svg: {
		width:  '88%',
		height: '88%',
		fill:   colors.fg.normal
	},

	shaming: {
		animation: `${shameAnim} linear 1s infinite`
	},

	jumpingForJoy1: {
		animation: `${rotateAnim} linear 1s infinite`
	},

	jumpingForJoy2: {
		animation: `${scaleAnim} linear 1s infinite`
	}
})