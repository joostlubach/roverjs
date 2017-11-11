// @flow

import * as React from 'react'
import PropTypes from 'prop-types'
import {jss, colors, layout, fonts, shadows} from '../styles'
import times from 'lodash/times'

export type Props = {
  rows:    number,
  columns: number,

  showCoordinates: boolean,
  dark:            boolean,

  className?: ClassNameProp,
  children?:  any
}
export const defaultProps = {
  dark: false
}

export default class Grid extends React.Component<*, Props, *> {

  props: Props
  static defaultProps = defaultProps

  static childContextTypes = {
    spriteBounds: PropTypes.func
  }

  getChildContext() {
    return {
      spriteBounds: this.spriteBounds.bind(this)
    }
  }

  spriteBounds(x: number, y: number) {
    const {width, height} = layout.gridCell

    return {
      top:  y * height,
      left: x * width,
      height,
      width
    }
  }

  render() {
    const {showCoordinates, className} = this.props

    return (
      <div className={[$.gridContainer, className]}>
        {showCoordinates && this.renderRowCoordinates()}
        <div className={$.gridBody}>
          {showCoordinates && this.renderColumnCoordinates()}
          {this.renderGrid()}
        </div>
      </div>
    )
  }

  renderColumnCoordinates() {
    const {columns} = this.props

    return (
      <div className={$.columnCoordinates}>
        {times(columns, coord =>
          <div
            key={coord}
            className={[$.coordinate, $.columnCoordinate]}
            style={{width: layout.gridCell.width}}
          >
            <div>{coord}</div>
          </div>
        )}
      </div>
    )
  }

  renderRowCoordinates() {
    const {rows} = this.props

    return (
      <div className={$.rowCoordinates}>
        {times(rows, coord =>
          <div
            key={coord}
            className={[$.coordinate, $.rowCoordinate]}
            style={{height: layout.gridCell.height}}
          >
            <div>{coord}</div>
          </div>
        )}
      </div>
    )
  }

  renderGrid() {
    const {rows, columns, dark} = this.props
    const size = {
      width:  columns * layout.gridCell.width,
      height: rows * layout.gridCell.height
    }

    return (
      <div className={[$.grid, dark && $.gridDark]} style={size}>
        {this.renderCells()}
        {this.renderContents()}
      </div>
    )
  }

  renderCells() {
    const {rows} = this.props

    return (
      <div className={$.cells}>
        {times(rows, r => this.renderRow(r))}
      </div>
    )
  }

  renderContents() {
    const {children} = this.props

    return (
      <div className={$.contents}>
        {children}
      </div>
    )
  }

  renderRow(row: number) {
    const {columns} = this.props

    return (
      <div key={row} className={$.row}>
        {times(columns, c => this.renderCell(row, c))}
      </div>
    )
  }

  renderCell(row: number, column: number) {
    return (
      <div key={`${row}-${column}`} className={$.cell}>
      </div>
    )
  }

}

const borderWidth = 5
const columnCoordinateHeight = fonts.tiny.size + 2 * borderWidth + 2 * layout.padding.xs

const $ = jss({
  gridContainer: {
    ...layout.flex.row
  },

  gridBody: {
    ...layout.flex.height
  },

  columnCoordinates: {
    ...layout.flex.row,
    padding: borderWidth
  },

  rowCoordinates: {
    ...layout.flex.column,
    marginTop: columnCoordinateHeight,
    padding:   borderWidth
  },

  coordinate: {
    ...layout.flex.center,
    padding: layout.padding.xs,

    color:      colors.fg.inverted,
    font:       fonts.tiny,
    opacity:    0.8,
    lineHeight: 1
  },

  columnCoordinate: {
    textAlign: 'center'
  },

  rowCoordinate: {
    textAlign: 'right'
  },

  grid: {
    position: 'relative',
    ...layout.flex.column,

    boxSizing:  'content-box',
    background: colors.bg.grid,
    border:     [borderWidth, 'solid', colors.border.grid],
    boxShadow:  shadows.float(5)
  },

  gridDark: {
    background:  colors.bg.gridDark,
    borderColor: colors.border.gridDark
  },

  cells: {
    ...layout.overlay,
  },

  contents: {
    ...layout.overlay,
  },

  row: {
    ...layout.flex.row,

    '& > :last-child': {
      borderRight: 0
    },
    '&:last-child > *': {
      borderBottom: 0
    }
  },

  cell: {
    width:  layout.gridCell.width,
    height: layout.gridCell.height,

    border:      [1, 'solid', colors.border.medium],

    borderLeftWidth: 0,
    borderTopWidth:  0,
  }

})