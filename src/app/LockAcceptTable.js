// @flow

import React from 'react'
import {jss, layout, colors, fonts, presets} from '../styles'
import {SVG, Button} from '../components'
import {exampleWords, disabledLock} from '../program'
import type {Lock, KeyColor} from '../program'

export type Props = {
	lock:       Lock,
	level:      Level,
	onCloseTap: () => void
}

export default class LockAcceptTable extends React.Component<*, Props, *> {

	props: Props

	get values(): Array<{[color: KeyColor]: ?mixed}> {
		const {lock: {acceptsKeys}, level} = this.props

		let values = []
		for (const color of acceptsKeys) {
			const key = level.items.find(item => item.type === 'key' && item.color === color)
			if (key == null) { continue }

			values = cartesian(values, color, valuesForKeyType(key.keyType))
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
		const {values} = this
		if (values.length === 0) { return null }

		const acceptedColors = Object.keys(values[0])
		const {lock} = this.props

		return (
			<div className={$.headerRow}>
				{acceptedColors.map(color => (
					<div key={color} className={[$.headerCell, $.keyValueHeader]}>
						<SVG name='key' className={$.headerIcon} style={{fill: colors.keys[color]}}/>
						<span>If this key has this value:</span>
					</div>
				))}
				<div className={[$.headerCell, $.expectedValueHeader]}>
					<SVG name='lock' className={$.headerIcon} style={{fill: colors.keys[lock.color]}}/>
					<span>You should unlock with this value:</span>
				</div>
			</div>
		)
	}

	renderRow(values: {[color: KeyColor]: ?mixed}, index: number) {
		const {lock} = this.props
		const expectedValue = lock.acceptFunction(values)

		return (
			<div key={index} className={$.row}>
				{Object.keys(values).map(color => (
					<div key={color} className={[$.cell, $.keyValueCell]}>
						{JSON.stringify(values[color])}
					</div>
				))}
				<div className={[$.cell, $.expectedValueCell]}>
					{expectedValue === disabledLock
						? <SVG className={$.disabledLock} name='cross'/>
						: JSON.stringify(expectedValue)}
				</div>
			</div>
		)
	}

}

function cartesian(data: Object[], color: KeyColor, values: mixed[]) {
	if (data.length === 0) {
		return values.map(value => ({[color]: value}))
	}

	const result = []
	for (let i = 0; i < data.length; i++) {
		for (const value of values) {
			result.push({...data[i], [color]: value})
		}
	}
	return result
}

function valuesForKeyType(keyType: KeyType) {
	const values = []

	if (keyType === 'any') {
		values.push(null)
	}
	if (keyType === 'any' || keyType === 'boolean') {
		values.push(true, false)
	}
	if (keyType === 'any' || keyType === 'string') {
		values.push(...exampleWords)
	}
	if (keyType === 'any' || keyType === 'number') {
		values.push(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
	}
	return values
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

	disabledLock: {
		width:  16,
		height: 16,
		fill:   colors.red
	}
})