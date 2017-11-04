// @flow

import React from 'react'
import CSSTransitionGroup from 'react-addons-css-transition-group'
import {jss, layout, colors} from '../styles'
import {SVG} from '.'
import times from 'lodash/times'

export type Props = {
	score:      number,
	maxScore:   number,
	starSize:   number,
	padding:    number,
	animated:   boolean,
	showGray:   boolean,
	className?: ClassNameProp
}
export const defaultProps = {
	maxScore: 3,
	starSize: 48,
	padding:  layout.padding.m,
	animated: true,
	showGray: false
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
		const {maxScore, showGray, starSize, padding, className} = this.props
		const width = starSize * maxScore + padding * (maxScore - 1)
		const height = starSize

		return (
			<div className={[$.scoreStars, className]} style={{width, height}}>
				{showGray && this.renderGrayStars()}
				{this.renderStars()}
			</div>
		)
	}

	renderGrayStars() {
		const {starSize, maxScore, padding} = this.props

		return (
			<div className={$.grayStars}>
				{times(maxScore, i => (
					<SVG
						key={i}
						name='star-gray'
						className={$.grayStar}
						size={{width: starSize, height: starSize}}
						style={{marginLeft: i === 0 ? 0 : padding}}
					/>
				))}
			</div>
		)
	}

	renderStars() {
		const {score, animated, starSize, padding} = this.props
		const currentScore = animated ? this.state.currentScore : score

		return (
			<CSSTransitionGroup component="div" className={$.goldStars} transitionName={$.anim} transitionEnterTimeout={animDuration} transitionLeaveTimeout={animDuration}>
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
		position: 'relative'
	},

	grayStars: {
		...layout.overlay,
		...layout.flex.row,
		alignItems:     'center',
		justifyContent: 'flex-start',
	},

	grayStar: {
		fill: colors.fg.dim
	},

	goldStars: {
		...layout.overlay,
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