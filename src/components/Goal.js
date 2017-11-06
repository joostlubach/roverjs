// @flow

import React from 'react'
import {jss, layout} from '../styles'
import {Sprite, SVG} from '.'
import type {Props as SpriteProps} from './Sprite'

export type Props = SpriteProps & {}

export default class Goal extends React.Component<*, Props, *> {

	props: Props

	render() {
		const {position} = this.props
		return (
			<Sprite className={$.goal} position={position}>
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