import * as React from 'react' // ts:disable-line no-unused
import {jss, shadows} from '../styles'

export type TappableState = 'hover' | 'active' | null

export interface Props {
  tag?:           string,
  disabled?:      boolean,
  onTap?:         (event: React.SyntheticEvent<any>) => void,
  onStateChange?: (state: TappableState) => void,

  classNames?:   React.ClassNamesProp,
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

    classNames,
    style,
    children
  } = props

  let inside = false

  function setState(state: TappableState) {
    if (disabled) { return }

    onStateChange(state)
  }

  console.log('Tappable', props)

  return (
    <Component
      classNames={[$.tappable, focusable && $.focusable, disabled && $.disabled, classNames]}
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
      onTouchCancel={() => { setState(null) }}

      children={children}
    />
  )

  function onMouseDown(e: React.MouseEvent<any>) {
    if (e.target !== e.currentTarget && isInteractiveElement(e.target)) { return }

    setState('active')
    e.stopPropagation()
  }

  function onMouseUp(e: React.MouseEvent<any>) {
    if (e.target !== e.currentTarget && isInteractiveElement(e.target)) { return }

    setState(inside ? 'hover' : null)
    e.stopPropagation()
  }

  function onTouchEnd(e: React.TouchEvent<any>) {
    onTap(e)
    setState(null)
    e.preventDefault()
  }

  function onClick(e: React.MouseEvent<any>) {
    if (disabled) { return }
    if (e.target !== e.currentTarget && isInteractiveElement(e.target)) { return }

    e.stopPropagation()
    if (onTap) { onTap(e) }
  }

  function onKeyDown(e: React.KeyboardEvent<any>) {
    if (disabled) { return }

    if (e.which === 0x20 || e.which === 0x0D) {
      if (onTap) { onTap(e) }
      e.preventDefault()
    }
  }
}

function isInteractiveElement(element: HTMLElement | EventTarget) {
  const tag = (element as HTMLElement).tagName.toLowerCase()
  if (tag === 'input' || tag === 'select' || tag === 'textarea' || tag === 'button') { return true }
  if (tag === 'a' && (element as HTMLElement).hasAttribute('href')) { return true }

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