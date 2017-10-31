// @flow

import React from 'react'
import {jss, layout} from '../styles'
import {Sprite, SVG} from '.'
import type {Props as SpriteProps} from './Sprite'

export type Props = SpriteProps & {}

export default class Robot extends React.Component<*, Props, *> {

	props: Props

	render() {
		const {x, y} = this.props
		return (
			<Sprite className={$.goal} {...{x, y}}>
				<SVG className={$.svg} name='goal'/>
			</Sprite>
		)
	}

}

const $ = jss({
	goal: {
		...layout.flex.center
	},

	svg: {
		width:  '70%',
		height: '70%'
	}
})