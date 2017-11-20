import * as React from 'react' // eslint-disable-line no-unused-vars
import * as cn from 'classnames'
import * as ReactModal from 'react-modal'
import {Props as ModalProps} from 'react-modal'
import {jss, colors, layout} from '../styles'

export interface Props extends ModalProps {
  classNames?:        React.ClassNamesProp,
  overlayClassNames?: React.ClassNamesProp
}

export default function Modal({classNames, overlayClassNames, ...props}: Props) {
  return (
    <ReactModal
      className={cn($.modal, classNames)}
      overlayClassName={cn($.overlay, overlayClassNames)}
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