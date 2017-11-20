// @flow

import * as React from 'react'
import {jss, colors, layout, fonts} from '../styles'
import {Tappable, SVG} from '.'
import {TappableState} from './Tappable'
import Color from 'color'

export interface Props {
  icon:       string,
  label:      string,
  children?:  any,
  classNames?: React.ClassNamesProp,
  style:      Object,

  color:    Color,
  disabled: boolean,
  small?:   boolean,
  tiny?:    boolean,

  onTap:    () => void
}
export const defaultProps = {
  color: colors.blue
}

interface State {
  tappableState: TappableState
}

export default class Button extends React.Component<Props> {

  props: Props
  static defaultProps = defaultProps

  state: State = {
    tappableState: null
  }

  render() {
    const {icon, label, children, classNames, small, tiny, disabled, color, onTap} = this.props

    const {tappableState} = this.state
    const style = {
      background: select(disabled ? 'disabled' : tappableState, {
        hover:    color.lighten(0.1).string(),
        active:   color.darken(0.1).string(),
        disabled: color.string(),
        default:  color.string()
      }),
      color: colors.contrast(color).string(),
      ...this.props.style
    }

    return (
      <Tappable
        classNames={[$.button, disabled && $.buttonDisabled, small && $.buttonSmall, tiny && $.buttonTiny, classNames]}
        style={style}

        focusable={!disabled}
        onTap={disabled ? null : onTap}
        onStateChange={state => { this.setState({tappableState: state}) }}
      >
        <div classNames={[$.content, small && $.contentSmall, tiny && $.contentTiny]}>
          {icon && <SVG classNames={[$.icon, small && $.iconSmall, tiny && $.iconTiny]} name={icon}/>}
          <div classNames={[$.label, small && $.labelSmall, tiny && $.labelTiny]}>{label}</div>
        </div>
        {children && <div classNames={$.body}>{children}</div>}
      </Tappable>
    )
  }

}

function select<T, U>(key: T, map: {[key: T | 'default']: U}): ?U {
  if (key in map) {
    return map[key]
  } else if ('default' in map) {
    return map.default
  }
}

const $ = jss({
  button: {
    ...layout.flex.column,
    alignItems:     'center',
    justifyContent: 'space-around',
    padding:        layout.padding.s,

    borderRadius: layout.radius.m,
    color:        colors.fg.inverted,

    cursor: 'pointer'
  },

  content: {
    ...layout.flex.column,
    alignItems:     'center',
    justifyContent: 'space-around',
  },

  buttonDisabled: {
    opacity: 0.3,
    cursor:  'default',

    '&:focus': {
      boxShadow: 'none'
    }
  },

  icon: {
    width:  36,
    height: 36
  },

  label: {
    font:          fonts.smallCaps,
    textTransform: 'uppercase',
    fontWeight:    500
  },

  buttonSmall: {
    padding: layout.padding.xs,
  },

  iconSmall: {
    width:  24,
    height: 24
  },

  labelSmall: {
  },

  buttonTiny: {
    padding: 2,
  },

  iconTiny: {
    width:  16,
    height: 16
  },

  labelTiny: {
    font:     fonts.tiny,
    fontSize: 10
  }
})