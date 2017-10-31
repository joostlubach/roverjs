// @flow

import React from 'react'
import {jss, jssKeyframes, colors, layout} from '../styles'
import {Sprite, SVG} from '.'
import type {Props as SpriteProps} from './Sprite'
import type {Direction} from '../program'
import type Color from 'color'

export type Props = SpriteProps & {
	triedX: number,
	triedY: number,

	direction:          Direction,
	transitionDuration: number,
	jumpForJoy:         boolean
}

export const defaultProps = {
	transitionDuration: 0,
	jumpForJoy:         false
}

type State = {
	tryX:    ?number,
	tryY:    ?number,
	animate: boolean
}

export default class Robot extends React.Component<*, Props, *> {

	props: Props
	static defaultProps = defaultProps

	state: State = {
		tryX:    null,
		tryY:    null,
		animate: true
	}

	tryTimeout: ?number = null

	get directionDegrees(): string {
		switch (this.props.direction) {
		case 'up':    return 0
		case 'down':  return 180
		case 'left':  return -90
		case 'right': return 90
		}
	}

	componentWillReceiveProps(props: Props) {
		const {tryX, tryY} = props
		if (tryX != null && tryY != null) {
			this.setState({tryX, tryY, animate: true})
			this.tryTimeout = setTimeout(() => {
				this.setState({tryX: null, tryY: null, animate: false})
			}, this.props.transitionDuration * 0.4)
		} else {
			this.setState({tryX, tryY, animate: true})
			clearTimeout(this.tryTimeout)
		}
	}

	render() {
		const {transitionDuration, jumpForJoy} = this.props
		const {animate} = this.state
		const style = {
			transform:          `rotateZ(${this.directionDegrees}deg)`,
			transitionDuration: animate ? `${transitionDuration}ms` : 0
		}

		const {tryX, tryY} = this.state
		const x = tryX == null ? this.props.x : tryX
		const y = tryY == null ? this.props.y : tryY

		return (
			<Sprite className={[$.robot]} {...{x, y}} style={style}>
				<div className={[$.svgContainer, jumpForJoy && $.jumpingForJoy1]}>
					<SVG className={[$.svg, jumpForJoy && $.jumpingForJoy2]} name='robot'/>
				</div>
			</Sprite>
		)
	}

}

const rotateAnim = jssKeyframes('rotate', {
	'0%':   {transform: 'rotateZ(0)'},
	'100%': {transform: 'rotateZ(-360deg)'},
})

const scaleAnim = jssKeyframes('jump', {
	'0%':   {transform: 'scale(1)', animationTimingFunction: 'ease-out'},
	'50%':  {transform: 'scale(2)', fill: colors.green.string(), animationTimingFunction: 'ease-in'},
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

	jumpingForJoy1: {
		animation: `${rotateAnim} linear 1s infinite`
	},

	jumpingForJoy2: {
		animation: `${scaleAnim} linear 1s infinite`
	}
})