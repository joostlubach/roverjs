// @flow

import * as React from 'react'
import {observer} from 'mobx-react'
import {jss, colors} from '../styles'
import {Button, ScoreStars} from '.'
import {levelStore} from '../stores'
import {Level} from '../stores'
import Color from 'color'

export interface Props {
  level:    Level,
  number:   number,
  small?:   boolean,
  color:    Color
}

export const defaultProps = {
  color: colors.purple
}

@observer
export default class LevelButton extends React.Component<Props> {

  props: Props
  static defaultProps = defaultProps

  render() {
    const {level, number, small} = this.props
    const score = levelStore.levelScores.get(level.id)
    const starSize = small ? 10 : 15
    const isSelectable = levelStore.isLevelSelectable(level)
    const isCurrent = levelStore.currentLevel != null && level.id === levelStore.currentLevel.id

    const color = isCurrent
      ? colors.green
      : this.props.color

    return (
      <Button
        label={number.toString()}
        small={small}
        color={color}
        disabled={!isSelectable}
        onTap={this.onTap}
      >
        <ScoreStars score={score || 0} starSize={starSize} padding={starSize * 0.4} showGray animated={false}/>
      </Button>
    )
  }

  onTap = () => {
    const {level} = this.props
    levelStore.loadLevel(level.id)
  }

}