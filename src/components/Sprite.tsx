import * as React from 'react'
import * as PropTypes from 'prop-types'
import {jss, layout} from '../styles'
import {Position} from '../program'

export interface Props {
  position: Position,

  children?:   React.ReactNode,
  classNames?: React.ClassNamesProp,
  style?:      Object
}

export default class Sprite extends React.Component<Props> {

  static contextTypes = {
    spriteBounds: PropTypes.func
  }

  render() {
    const {classNames, style, position: {x, y}, children} = this.props
    const bounds = this.context.spriteBounds(x, y)

    return (
      <div classNames={[$.sprite, classNames]} style={{...style, ...bounds}}>
        {children}
      </div>
    )
  }

}

const $ = jss({
  sprite: {
    position: 'absolute',
    ...layout.flex.center
  }
})