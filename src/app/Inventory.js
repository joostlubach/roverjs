// @flow

import React from 'react'
import {observer} from 'mobx-react'
import {jss, colors, layout, fonts} from '../styles'
import {SVG} from '../components'
import {levelStore, simulatorStore} from '../stores'

export type Props = {}

@observer
export default class Inventory extends React.Component<*, Props, *> {

	props: Props

	render() {
		const {currentLevel} = levelStore
		if (currentLevel == null) { return null }

		const apples = this.renderApples()
		const keys   = this.renderKeys()
		if (apples == null && keys == null) { return null }

		return (
			<div className={$.inventory}>
				{apples}
				{keys}
			</div>
		)
	}

	renderApples() {
		const {currentLevel} = levelStore
		if (currentLevel == null || !currentLevel.hasApples) { return null }

		const {state} = simulatorStore
		const apples = state == null ? 0 : state.apples

		return (
			<div className={$.inventoryItem}>
				<SVG className={$.inventoryIcon} name='apple'/>
				<div className={$.inventoryLabel}>
					x {apples}
				</div>
			</div>
		)
	}

	renderKeys() {
		const {currentLevel} = levelStore
		if (currentLevel == null || !currentLevel.hasKeys) { return null }

		const {state} = simulatorStore
		const keys = state == null ? {} : state.keys

		return (
			<div>
				{currentLevel.keyColors.map(color => {
					const hasValue = color in keys
					const value = keys[color]

					return (
						<div key={color} className={[$.inventoryItem, !hasValue && $.inventoryItemUnavailable]}>
							<SVG className={$.inventoryIcon} name='key' fill={colors.keys[color]}/>
							{hasValue &&
								<div className={$.inventoryLabel}>
									= <span className={$.keyValue}>{JSON.stringify(value)}</span>
								</div>
							}
						</div>
					)
				})}
			</div>
		)
	}

}

const $ = jss({
	inventory: {
		...layout.flex.column,
		marginTop: layout.padding.l,
		width:     180,

		background:   colors.bg.light,
		borderRadius: layout.radius.l
	},

	inventoryItem: {
		...layout.row(),
		alignItems: 'flex-end',
		padding:    layout.padding.m,
	},

	inventoryItemUnavailable: {
		opacity: 0.6
	},

	inventoryIcon: {
		width:  32,
		height: 32
	},

	inventoryLabel: {
		font:       fonts.large,
		fontWeight: 500
	},

	keyValue: {
		display:    'inline-block',
		whitespace: 'pre',
		font:       fonts.monospace,
	}
})