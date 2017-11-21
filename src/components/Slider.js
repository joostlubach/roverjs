import * as React from 'react'
import {jss, colors, layout, fonts, shadows} from '../styles'
import {DragHandle} from 'draggable'
import {DragHandleState} from 'draggable'

export type Props<T> = {
  values: T[],
  value:  T,
  onChange: (value: T) => void,

  showValues: boolean,

  classNames?: React.ClassNamesProp
}
export const defaultProps = {
  onChange:   (value: any) => void 0,
  showValues: true
}

export default class Slider<T> extends React.Component<Props> {

  props: Props
  static defaultProps = defaultProps

  container: ?HTMLElement = null

  setValueFromScreenX(x: number) {
    const {container} = this
    if (container == null) { return }

    let left = x - container.getBoundingClientRect().left
    left = Math.max(0, Math.min(container.clientWidth, left))

    const index = Math.round(left / container.clientWidth * (this.props.values.length - 1))
    const value = this.props.values[index]
    if (value === this.props.value) { return }

    this.props.onChange(value)
  }

  render() {
    const {classNames, showValues} = this.props

    return (
      <div classNames={[$.slider, classNames]} onClick={this.onClick}>
        <div classNames={$.container} ref={el => { this.container = el }}>
          {this.renderRail()}
          {this.renderThumb()}
        </div>
        {showValues && this.renderValues()}
      </div>
    )
  }

  renderRail() {
    return (
      <div classNames={$.rail}/>
    )
  }

  renderThumb() {
    const {values, value} = this.props
    const index = values.indexOf(value)
    const style = {
      left: index === -1 ? 0 : `${index * 100 / (values.length - 1)}%`
    }

    return (
      <DragHandle
        classNames={$.thumb}
        style={style}
        onDrag={this.onThumbDrag}
      />
    )
  }

  renderValues() {
    const {values} = this.props
    const stepPerc = 100 / (values.length - 1)

    return (
      <div classNames={$.values}>
        {values.map((value, i) =>
          <div key={i} classNames={$.value} style={{left: `${i * stepPerc}%`}}>
            {value}
          </div>
        )}
      </div>
    )
  }

  onClick = (e: MouseEvent) => {
    this.setValueFromScreenX(e.pageX)
  }

  onThumbDrag = (state: DragHandleState) => {
    this.setValueFromScreenX(state.mouseCurrent.x)
  }

}

const thumbSize = 24

const $ = jss({
  slider: {
    ...layout.flex.column,

    '&:focus': {
      boxShadow: [
        ['inset', 1, 1, 2, 0, colors.shadow.alpha(0.6)],
        shadows.focus
      ]
    }
  },

  container: {
    position: 'relative',
    margin:   [0, thumbSize / 2],
    height:   thumbSize + 4,
  },

  rail: {
    position: 'absolute',
    left:     0,
    right:    0,
    top:      '50%',

    marginTop:    -1,
    height:       2,
    borderRadius: 1,

    backgroundColor: colors.bg.light,
    boxShadow:       ['inset', 1, 1, 2, 0, colors.shadow.alpha(0.6)],
    border:          [1, 'solid', colors.white.alpha(0.6)],
  },

  thumb: {
    position: 'absolute',
    top:      0,

    width:        thumbSize,
    height:       thumbSize,
    borderRadius: thumbSize / 2,

    marginLeft: -thumbSize / 2,

    backgroundColor: colors.bg.control,
    boxShadow:       [
      ['inset', 0, 0, 5, 0, colors.white.alpha(0.4)],
      ['inset', 1, 1, 1, 0, colors.white],
      [1, 1, 2, 0, colors.shadow.alpha(0.6)],
    ],
    margin: 2
  },

  values: {
    position: 'relative',
    margin:   [0, thumbSize / 2],
    height:   fonts.reallyTiny.size * 1.2
  },

  value: {
    position:   'absolute',
    top:        0,
    width:      100,
    marginLeft: -50,

    font:      fonts.reallyTiny,
    textAlign: 'center'
  }
})