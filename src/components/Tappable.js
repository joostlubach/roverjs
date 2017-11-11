// @flow

import * as React from 'react' // eslint-disable-line no-unused-vars
import {jss, shadows} from '../styles'

export type TappableState = ?('hover' | 'active')

export type Props = {
  tag?:          string,
  disabled:      boolean,
  onTap:         () => void,
  onStateChange: (state: TappableState) => void,

  className?:    ClassNameProp,
  style?:        Object,
  focusable?:    boolean,
  children?:     any
}

export default function Tappable(props: Props) {
  const {
    tag: Component = 'div',
    disabled       = false,
    onTap         = () => void 0,
    onStateChange = () => void 0,
    focusable     = true,

    className,
    style,
    children
  } = props

  let inside = false

  function setState(state: TappableState) {
    if (disabled) { return }

    onStateChange(state)
  }

  return (
    <Component
      className={[$.tappable, focusable && $.focusable, disabled && $.disabled, className]}
      style={style}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onClick={onClick}
      onTouchEnd={onTouchEnd}
      onKeyDown={onKeyDown}

      onMouseEnter={() => { setState('hover'); inside = true }}
      onMouseLeave={() => { setState(null); inside = false }}
      onTouchStart={() => { setState('active') }}
      onTouchEnd={() => { setState(null) }}
      onTouchCancel={() => { setState(null) }}

      children={children}
    />
  )

  function onMouseDown(e: Event) {
    if (e.target !== e.currentTarget && isInteractiveElement(e.target)) { return }

    setState('active')
    e.stopPropagation()
  }

  function onMouseUp(e: Event) {
    if (e.target !== e.currentTarget && isInteractiveElement(e.target)) { return }

    setState(inside ? 'hover' : null)
    e.stopPropagation()
  }

  function onTouchEnd(e: Event) {
    onClick(e)
    e.preventDefault()
  }

  function onClick(e: Event) {
    if (disabled) { return }
    if (e.target !== e.currentTarget && isInteractiveElement(e.target)) { return }

    e.stopPropagation()
    if (onTap) { onTap(e) }
  }

  function onKeyDown(e: Event) {
    if (disabled) { return }

    if (e.which === 0x20 || e.which === 0x0D) {
      if (onTap) { onTap(e) }
      e.preventDefault()
    }
  }
}

function isInteractiveElement(element: HTMLElement) {
  const tag = element.tagName.toLowerCase()
  if (tag === 'input' || tag === 'select' || tag === 'textarea' || tag === 'button') { return true }
  if (tag === 'a' && element.hasAttribute('href')) { return true }

  return false
}

const $ = jss({
  tappable: {
    cursor:     'pointer',
    userSelect: 'none',
    outline:    'none',
  },

  disabled: {
    cursor: 'default'
  },

  focusable: {
    '&:focus': {
      boxShadow: shadows.focus
    }
  }
})