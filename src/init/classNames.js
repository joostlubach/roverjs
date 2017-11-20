import * as React from 'react'
import classNames from 'classnames'
import {omit} from 'lodash'

// Flatten the classNames prop into a classNames prop for all HTML elements. Not for regular components.s

const originalCreateElement = React.createElement

React.createElement = function (type, ...args) {
  let props = args.length > 0 ? args.shift() : null
  if (typeof type === 'string' && props != null && 'classNames' in props) {
    props = {
      ...omit(props, 'classNames'),
      className: classNames(props.classNames, props.classNames).toString()
    }
  }
  return originalCreateElement.call(this, type, props, ...args)
}