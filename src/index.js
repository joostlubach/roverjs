// @flow

import React from 'react' // eslint-disable-line
import {render} from 'react-dom'
import {App} from './app'
import {jss, layout, fonts} from './styles'

render(<App />, document.getElementsByTagName('main')[0])

jss({
	'@global': {
		'html': {
			height: '100vh',
		},
		'body': {
			height:    '100vh',
			margin:    0,
			padding:   0,
			overflow: 'hidden',

			...layout.flex.column,

			font: fonts.normal
		},
		'h1, h2, h3': {
			fontSize: '100%',
			padding:  0,
			margin:   0
		}
	}
})