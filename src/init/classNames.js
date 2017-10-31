import React from 'react'
import classNames from 'classnames'

// Before creating an element, flatten class names

const originalCreateElement = React.createElement

React.createElement = function (type, ...args) {
	let props = args.length > 0 ? args.shift() : null
	if (props != null && 'className' in props) {
		props = {
			...props,
			className: classNames(props.className).toString()
		}
	}
	return originalCreateElement.call(this, type, props, ...args)
}