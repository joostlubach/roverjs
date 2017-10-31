// @flow

import React from 'react' // eslint-disable-line
import {render} from 'react-dom'
import App from './components/App'
import {jss, layout, fonts} from './styles'

render(<App />, document.getElementsByTagName('main')[0])

jss({
	'@global': {
		'html': {
			height: '100vh',
		},
		'body': {
			height:  '100vh',
			margin:  0,
			padding: 0,

			...layout.flex.column,

			font: fonts.normal
		}
	}
})