// @flow

import * as React from 'react'
import {jss, layout, colors, fonts, presets} from '../styles'
import {SVG, Button} from '../components'
import {disabledLock} from '../program'
import {Lock, KeyColor} from '../program'

export interface Props {
  lock:       Lock,
  level:      Level,
  onCloseTap: () => void
}

export default class UnlockSchema extends React.Component<Props> {

  props: Props

  get values(): Array<{[color: KeyColor]: ?mixed}> {
    const {lock: {acceptsKeys}, level} = this.props

    return level.allKeyValues(acceptsKeys)
  }

  render() {
    return (
      <div classNames={$.lockAcceptTable}>
        {this.renderHeader()}
        {this.renderTable()}
      </div>
    )
  }

  renderHeader() {
    const {lock} = this.props

    return (
      <div classNames={$.header}>
        <SVG name='lock' classNames={$.headerIcon} style={{fill: colors.keys[lock.color]}}/>
        <span>Lock</span>
        <Button classNames={$.closeButton} color={colors.purple.darken(0.1)} icon='cross' onTap={this.props.onCloseTap}/>
      </div>
    )
  }

  renderTable() {
    return (
      <div classNames={$.table}>
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
      <div classNames={$.headerRow}>
        {acceptedColors.map(color => (
          <div key={color} classNames={[$.headerCell, $.keyValueHeader]}>
            <SVG name='key' classNames={$.headerIcon} style={{fill: colors.keys[color]}}/>
            <span>If this key has this value:</span>
          </div>
        ))}
        <div classNames={[$.headerCell, $.expectedValueHeader]}>
          <SVG name='lock' classNames={$.headerIcon} style={{fill: colors.keys[lock.color]}}/>
          <span>You should unlock with this value:</span>
        </div>
      </div>
    )
  }

  renderRow(values: {[color: KeyColor]: ?mixed}, index: number) {
    const {lock} = this.props
    const expectedValue = lock.acceptFunction(values)

    return (
      <div key={index} classNames={$.row}>
        {Object.keys(values).map(color => (
          <div key={color} classNames={[$.cell, $.keyValueCell]}>
            {JSON.stringify(values[color])}
          </div>
        ))}
        <div classNames={[$.cell, $.expectedValueCell]}>
          {expectedValue === disabledLock
            ? <SVG classNames={$.disabledLock} name='cross'/>
            : JSON.stringify(expectedValue)}
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

  disabledLock: {
    width:  16,
    height: 16,
    fill:   colors.red
  }
})