import * as React from 'react'
import {jss, layout} from '../styles'
import {Sprite, SVG} from '.'
import {Props as SpriteProps} from './Sprite'

export interface Props extends SpriteProps {}

export default class Goal extends React.Component<Props> {

  render() {
    const {position} = this.props
    return (
      <Sprite classNames={$.goal} position={position}>
        <SVG classNames={$.svg} name='goal'/>
      </Sprite>
    )
  }

}

const $ = jss({
  goal: {
    ...layout.flex.center
  },

  svg: {
    width:  '70%',
    height: '70%'
  }
})