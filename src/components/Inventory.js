// @flow

import React from 'react'
import {jss, colors, layout, fonts} from '../styles'
import {SVG} from '.'
import {simulatorStore} from '../stores'

export type Props = {}

export default class Inventory extends React.Component<*, Props, *> {

	props: Props

	render() {
		const {state} = simulatorStore
		const apples = state != null ? state.apples : 0

		return (
			<div className={$.inventory}>
				<SVG className={$.inventoryIcon} name='apple'/>
				<div className={$.inventoryLabel}>
					x {apples}
				</div>
			</div>
		)
	}


}

const $ = jss({
	inventory: {
		...layout.row(),
		alignItems: 'flex-end',
		padding:    layout.padding.m,

		marginTop: layout.padding.l,

		background:   colors.bg.light,
		borderRadius: layout.radius.l
	},

	inventoryIcon: {
		width:  32,
		height: 32
	},

	inventoryLabel: {
		font:       fonts.large,
		fontWeight: 500
	}
})