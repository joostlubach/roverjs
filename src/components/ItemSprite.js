// @flow

import React from 'react'
import {jss, layout} from '../styles'
import {Sprite, SVG} from '.'
import type {Item} from '../program'

export type Props = {
	item: Item
}

export default class ItemSprite extends React.Component<*, Props, *> {

	props: Props

	render() {
		const {position, type} = this.props.item

		return (
			<Sprite className={$.sprite} position={position}>
				<SVG className={$.svg} name={type}/>
			</Sprite>
		)
	}

}

const $ = jss({
	sprite: {
		...layout.flex.center
	},

	svg: {
		width:  '70%',
		height: '70%'
	}
})