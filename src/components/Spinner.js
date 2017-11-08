// @flow

import React from 'react' // eslint-disable-line no-unused-vars
import activity from 'react-activity'
import {jss} from '../styles'

export default function Spinner({shown = true, size = 16, color = null, ...props}: Object) {
	return (
		<activity.Spinner
			className={!shown && $.hidden}
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