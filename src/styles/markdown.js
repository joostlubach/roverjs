// @flow

import * as fonts from './fonts'
import * as colors from './colors'
import * as layout from './layout'

export const base = {
	'& > :not(:last-child)': {
		paddingBottom: '0.5em'
	},

	'& h1': {
		color: colors.primary,
		font:  fonts.huge,

		'&:not(:first-child)': {
			paddingTop: '1.2em'
		}
	},

	'& h2': {
		color: colors.primary,
		font:  fonts.large,

		'&:not(:first-child)': {
			paddingTop: '0.6em'
		}
	},
	'& h3': {
		fontWeight: '500',

		'&:not(:first-child)': {
			paddingTop: '0.3em'
		}
	},

	'& em': {
		fontStyle: 'italic'
	},
	'& strong': {
		fontWeight: 600
	},
	'& li': {
		listStyle:  'disc',
		marginLeft: '1.4em'
	},
	'& a[href]': {
		color: colors.secondary
	}
}

export const page = {
	'& > *': {
		padding: [0, layout.padding.m]
	},
	'& h1, & h2, & h3': {
		padding: 0
	},
	'& .paragraph figure': {
		display: 'block',
		margin:  [0, -layout.padding.m]
	}
}