// @flow

import * as layout from './layout'
import * as colors from './colors'
import * as fonts from './fonts'
import * as shadows from './shadows'

export const panelHeader = {
	zIndex:       10,
	background:   colors.purple.darken(0.05),
	borderBottom: [1, 'solid', colors.white.alpha(0.2)],
	boxShadow:    shadows.toolbar,

	minHeight:    34,
	...layout.row(),

	color:         colors.fg.inverted,
	padding:       [layout.padding.xs, layout.padding.s],
	font:          fonts.smallCaps,
	textTransform: 'uppercase'
}