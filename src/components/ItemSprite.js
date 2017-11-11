// @flow

import * as React from 'react'
import {jss, layout, colors} from '../styles'
import {Sprite, SVG, Tappable} from '.'
import {Item} from '../program'

export type Props = {
  item:  Item,
  onTap: ?(() => void)
}

export default class ItemSprite extends React.Component<*, Props, *> {

  props: Props

  render() {
    const {item, onTap} = this.props
    const {position, type} = item

    const Component = onTap == null ? 'div' : Tappable
    const tapProps  = onTap == null ? {} : {onTap}

    let name = type

    const style = {}
    if (item.type === 'key' || item.type === 'lock') {
      style.fill = colors.keys[item.color]
    }

    return (
      <Sprite position={position}>
        <Component className={$.content} {...tapProps}>
          <SVG className={$.svg} name={name} style={style}/>
        </Component>
      </Sprite>
    )
  }

}

const $ = jss({
  content: {
    ...layout.overlay,
    ...layout.flex.center
  },

  svg: {
    width:  '70%',
    height: '70%'
  }
})