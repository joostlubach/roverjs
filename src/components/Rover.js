// @flow

import * as React from 'react'
import {jss, jssKeyframes, colors, layout} from '../styles'
import {Sprite, SVG, TextBalloon} from '.'
import {Props as SpriteProps} from './Sprite'
import {Position, Direction} from '../program'

export type Props = SpriteProps & {
  failedPosition:     ?Position,
  direction:          Direction,
  transitionDuration: number,

  textBalloon: TextBalloon,
  jumpForJoy:  boolean,
  shame:       boolean
}

export const defaultProps = {
  transitionDuration: 0,
  jumpForJoy:         false,
  shame:              false
}

type State = {
  failedPosition: ?Position,
  degrees:        number
}

export default class Rover extends React.Component<*, Props, *> {

  constructor(props: Props) {
    super(props)

    this.state = {
      failedPosition: null,
      degrees:        degreesForDirection(props.direction)
    }
  }

  props: Props
  static defaultProps = defaultProps

  state: State

  //------
  // Failed simulation

  failedTimeout: ?number = null

  simulateFailed(props: Props) {
    if (this.failedTimeout != null) { return }

    const {failedPosition, transitionDuration} = props

    // Simulate a move that fails.
    this.setState({failedPosition})
    this.failedTimeout = setTimeout(() => {
      this.setState({failedPosition: null})
    }, transitionDuration * 0.2)
    setTimeout(() => {
      this.stopFailedSimulation()
    }, transitionDuration)
  }

  stopFailedSimulation() {
    clearTimeout(this.failedTimeout)
    this.failedTimeout = null
    this.setState({failedPosition: null})
  }

  //------
  // Component lifecycle

  componentWillReceiveProps(props: Props) {
    if (props.direction !== this.props.direction) {
      this.setState({degrees: degreesForDirection(props.direction, this.props.direction, this.state.degrees)})
    }

    if (props.failedPosition != null) {
      this.simulateFailed(props)
    } else {
      this.stopFailedSimulation()
    }
  }

  render() {
    const {transitionDuration, jumpForJoy, shame, textBalloon} = this.props

    const position = this.state.failedPosition || this.props.position
    const spriteStyle = {
      transitionDuration: `${transitionDuration}ms`
    }
    const svgContainerStyle = {
      transform:          `rotateZ(${this.state.degrees}deg)`,
      transitionDuration: `${transitionDuration}ms`
    }

    return (
      <Sprite className={[$.robot]} position={position} style={spriteStyle}>
        <div className={[$.svgContainer, jumpForJoy && $.jumpingForJoy1]} style={svgContainerStyle}>
          <SVG className={[$.svg, shame && $.shaming, jumpForJoy && $.jumpingForJoy2]} name='robot'/>
        </div>
        {textBalloon && <TextBalloon balloon={textBalloon}/>}
      </Sprite>
    )
  }

}

function degreesForDirection(direction: Direction, existing: Direction = 'up', existingDegrees: number = 0): string {
  return existingDegrees + directionDiff(existing, direction)
}

function directionDiff(from: Direction, to: Direction) {
  switch (`${from}-${to}`) {
  case 'up-up': case 'right-right': case 'down-down': case 'left-left': return 0
  case 'up-right': case 'right-down': case 'down-left': case 'left-up': return 90
  case 'up-down': case 'right-left': case 'down-up': case 'left-right': return 180
  case 'up-left': case 'right-up': case 'down-right': case 'left-down': return -90
  }
}

const rotateAnim = jssKeyframes('rotate', {
  '0%':   {transform: 'rotateZ(0)'},
  '100%': {transform: 'rotateZ(-360deg)'},
})

const scaleAnim = jssKeyframes('scale', {
  '0%':   {transform: 'scale(1)', animationTimingFunction: 'ease-out'},
  '50%':  {transform: 'scale(2)', fill: colors.green.string(), animationTimingFunction: 'ease-in'},
  '100%': {transform: 'scale(1)'},
})

const shameAnim = jssKeyframes('shame', {
  '0%':   {transform: 'scale(1)', animationTimingFunction: 'ease-out'},
  '50%':  {transform: 'scale(0.8)', fill: colors.red.string(), animationTimingFunction: 'ease-in'},
  '100%': {transform: 'scale(1)'},
})

const $ = jss({
  robot: {
    ...layout.transition(['top', 'left', 'transform'], 0)
  },

  svgContainer: {
    ...layout.overlay,
    ...layout.flex.center,
  },

  svg: {
    width:  '88%',
    height: '88%',
    fill:   colors.fg.normal
  },

  shaming: {
    animation: `${shameAnim} linear 1s infinite`
  },

  jumpingForJoy1: {
    animation: `${rotateAnim} linear 1s infinite`
  },

  jumpingForJoy2: {
    animation: `${scaleAnim} linear 1s infinite`
  }
})