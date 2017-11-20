// @flow

import * as React from 'react' // eslint-disable-line no-unused-vars
import activity from 'react-activity'
import {jss} from '../styles'
import 'react-activity/dist/react-activity.css'

export default function Spinner({shown = true, size = 16, color = null, ...props}: Object) {
  return (
    <activity.Spinner
      classNames={!shown && $.hidden}
      size={size}
      color={color == null ? null : color.toString()}
      {...props}
    />
  )
}

const $ = jss({
  hidden: {
    visibility: 'hidden'
  }
})