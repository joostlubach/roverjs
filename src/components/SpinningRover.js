// @flow

import * as React from 'react' // eslint-disable-line
import {jss, jssKeyframes, colors} from '../styles'
import {SVG} from '.'

export default function SpinningRover() {
  return <SVG classNames={$.spinningRover} name='robot'/>
}

const spin = jssKeyframes('spin', {
  '0%':   {transform: 'rotateZ(0)'},
  '100%': {transform: 'rotateZ(360deg)'},
})

const $ = jss({
  spinningRover: {
    width:     64,
    height:    64,

    fill:      colors.red,
    animation: `${spin} 1s linear infinite`
  }
})