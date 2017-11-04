// @flow

import React from 'react' // eslint-disable-line no-unused-vars
import classNames from 'classnames'
import Modal from 'react-modal'
import {jss, colors, layout} from '../styles'

export type Props = {
	isOpen:         boolean,
	onRequestClose: () => void,
	contentLabel:   string,

	className?:        ClassNameProp,
	overlayClassName?: ClassNameProp
}

export default function ({className, overlayClassName, ...props}: Props) {
	return (
		<Modal
			className={[$.modal, className]}
			overlayClassName={classNames($.overlay, overlayClassName)}
			{...props}
		/>
	)
}

const $ = jss({
	overlay: {
		zIndex: layout.z.modal,

		...layout.overlay,
		...layout.flex.center,
		background: colors.bg.overlay,
	},

	modal: {
		flex:       [0, 1, 'auto'],
		overflow:   'auto',
		maxWidth:   '80%',

		border: [4, 'solid', colors.amber],

		pointerEvents: 'auto',

		background:    colors.bg.light,
		borderRadius:  layout.radius.m,

		'&:focus': {
			outline: 'none'
		},
	}
})