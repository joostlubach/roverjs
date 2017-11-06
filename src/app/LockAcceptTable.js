// @flow

import React from 'react'
import {jss, layout, colors, fonts, presets} from '../styles'
import {SVG, Button} from '../components'
import {exampleWords} from '../program'
import type {Lock} from '../program'

export type Props = {
	lock:       Lock,
	onCloseTap: () => void
}

export default class LockAcceptTable extends React.Component<*, Props, *> {

	props: Props

	get values(): Array<?mixed> {
		const {lock} = this.props
		const values = []

		if (lock.variableType === 'any') {
			values.push(null)
		}
		if (lock.variableType === 'any' || lock.variableType === 'boolean') {
			values.push(true, false)
		}
		if (lock.variableType === 'any' || lock.variableType === 'string') {
			values.push(...exampleWords)
		}
		if (lock.variableType === 'any' || lock.variableType === 'number') {
			values.push(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
		}
		return values
	}

	render() {
		return (
			<div className={$.lockAcceptTable}>
				{this.renderHeader()}
				{this.renderTable()}
			</div>
		)
	}

	renderHeader() {
		const {lock} = this.props

		return (
			<div className={$.header}>
				<SVG name='lock' className={$.headerIcon} style={{fill: colors.keys[lock.color]}}/>
				<span>Lock</span>
				<Button className={$.closeButton} color={colors.purple.darken(0.1)} icon='cross' onTap={this.props.onCloseTap}/>
			</div>
		)
	}

	renderTable() {
		return (
			<div className={$.table}>
				{this.renderHeaderRow()}
				{this.values.map(this.renderRow.bind(this))}
			</div>
		)
	}

	renderHeaderRow() {
		const {lock} = this.props

		return (
			<div className={$.headerRow}>
				<div className={[$.headerCell, $.keyValueHeader]}>
					<SVG name='key' className={$.headerIcon} style={{fill: colors.keys[lock.color]}}/>
					<span>If the key has this value:</span>
				</div>
				<div className={[$.headerCell, $.expectedValueHeader]}>
					<SVG name='lock' className={$.headerIcon} style={{fill: colors.keys[lock.color]}}/>
					<span>You should unlock with this value:</span>
				</div>
			</div>
		)
	}

	renderRow(keyValue: ?mixed) {
		const {lock} = this.props
		const expectedValue = lock.acceptFunction(keyValue)

		return (
			<div key={keyValue} className={$.row}>
				<div className={[$.cell, $.keyValueCell]}>
					{JSON.stringify(keyValue)}
				</div>
				<div className={[$.cell, $.expectedValueCell]}>
					{JSON.stringify(expectedValue)}
				</div>
			</div>
		)
	}

}

const $ = jss({
	lockAcceptTable: {
		...layout.overlay,
		...layout.flex.column,

		background: colors.bg.dark,
		color:      colors.fg.inverted,
	},

	header: {
		...presets.panelHeader,
		position:  'relative',
		marginTop: -4,

		...layout.row(),
		'& span': {flex: [1, 0, 0]}
	},

	headerIcon: {
		width:  20,
		height: 20
	},

	closeButton: {
		padding: layout.padding.xs,

		'& svg': {
			width:  16,
			height: 16,
			fill:   colors.fg.inverted
		}
	},

	table: {
		flex:     [1, 0, 0],
		overflow: 'auto'
	},

	headerRow: {
		...layout.flex.row,
		background: colors.purple,
	},

	headerCell: {
		flex:    [1, 0, 0],
		...layout.row(),

		padding:  [layout.padding.xs, layout.padding.s],
		font:     fonts.tiny,
		'& span': {flex: [1, 0, 0]}
	},

	keyValueHeader: {
		borderRight: [1, 'solid', colors.fg.inverted.alpha(0.2)]
	},

	row: {
		...layout.flex.row,

		'&:nth-child(2n)': {
			background: colors.purple.alpha(0.2)
		}
	},

	cell: {
		flex:         [1, 0, 0],
		font:         fonts.monospace,
		padding:      [layout.padding.xs, layout.padding.s],
		overflow:     'hidden',
		textOverflow: 'ellipsis'
	},

	keyValueCell: {
		borderRight: [1, 'solid', colors.fg.inverted.alpha(0.2)]
	},
})