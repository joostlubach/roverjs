// @flow

import * as React from 'react'
import PropTypes from 'prop-types'
import {jss, layout} from '../styles'
import {Position} from '../program'

export type Props = {
  position: Position,

  children?:  any,
  className?: ClassNameProp,
  style?:     Object
}

export default class Sprite extends React.Component<*, Props, *> {

  props: Props

  static contextTypes = {
    spriteBounds: PropTypes.func
  }

  render() {
    const {className, style, position: {x, y}, children} = this.props
    const bounds = this.context.spriteBounds(x, y)

    return (
      <div className={[$.sprite, className]} style={{...style, ...bounds}}>
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