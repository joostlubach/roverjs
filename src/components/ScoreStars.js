// @flow

import React from 'react'
import CSSTransitionGroup from 'react-addons-css-transition-group'
import {jss, layout} from '../styles'
import {SVG} from '.'
import times from 'lodash/times'

export type Props = {
	score:      number,
	starSize:   number,
	padding:    number,
	animated:   boolean,
	className?: ClassNameProp
}
export const defaultProps = {
	starSize: 48,
	padding:  layout.padding.m
}

type State = {
	currentScore: number
}

export default class Scoring extends React.Component<*, Props, *> {

	props: Props
	static defaultProps = defaultProps

	state: State = {
		currentScore: 0
	}

	buildupTimeout: ?number = 0

	startBuildup() {
		clearTimeout(this.buildupTimeout)
		this.buildupTimeout = setTimeout(this.onNextBuildup, animInterval)
	}

	stopBuildup() {
		clearInterval(this.buildupTimeout)
	}

	onNextBuildup = () => {
		const {currentScore} = this.state
		if (currentScore === this.props.score) { return }

		this.setState({currentScore: currentScore + 1})
		this.buildupTimeout = setTimeout(this.onNextBuildup, animInterval)
	}

	componentDidMount() {
		if (this.props.animated) {
			this.startBuildup()
		}
	}

	componentWillUnmount() {
		this.stopBuildup()
	}

	componentWillReceiveProps(props: Props) {
		if (props.animated && props.score !== this.props.score) {
			this.startBuildup()
		}
	}

	render() {
		const {score, animated, starSize, padding, className} = this.props
		const currentScore = animated ? this.state.currentScore : score

		const width = starSize * score + padding * (score - 1)
		const height = starSize

		return (
			<CSSTransitionGroup className={[$.scoreStars, className]} style={{width, height}} component="div" transitionName={$.anim} transitionEnterTimeout={animDuration} transitionLeaveTimeout={animDuration}>
				{times(currentScore, i => (
					<SVG
						key={i}
						name='star'
						className={$.scoreStar}
						size={{width: starSize, height: starSize}}
						style={{marginLeft: i === 0 ? 0 : padding}}
					/>
				))}
			</CSSTransitionGroup>
		)
	}

}

const animInterval = 400
const animDuration = 400

const $ = jss({
	scoreStars: {
		...layout.flex.row,
		alignItems:     'center',
		justifyContent: 'flex-start',
	},

	anim: {
		'&-enter': {
			opacity:   0.3,
			transform: `scale(4)`
		},
		'&-enter-active': {
			opacity:    1,
			transform:  `scale(1)`,
			transition: layout.transition(['opacity', 'transform'], animDuration, 'cubic-bezier(0.22, 0.61, 0.36, 1)')
		},
		'&-leave': {
			transform:  `scale(1)`,
		},
		'&-leave-active': {
			opacity:    0,
			transform:  `scale(4)`,
			transition: layout.transition(['opacity', 'transform'], animDuration, 'cubic-bezier(0.22, 0.61, 0.36, 1)')
		}
	},

})