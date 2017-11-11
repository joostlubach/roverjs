import * as fonts from './fonts'

export const padding = {
  xs:            6,
  s:             12,
  m:             14,
  l:             20,
  input:         [6, 0],
  search:        [6, 6, 6, 0],
  opaqueControl: 6
}

export const radius = {
  s:  2,
  m:  4,
  l:  8,
  xl: 16
}

export const flex = {
  column: {
    display:       'flex',
    flexDirection: 'column',
    alignItems:    'stretch'
  },
  row: {
    display:       'flex',
    flexDirection: 'row',
    alignItems:    'stretch'
  },
  center: {
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    justifyContent: 'center'
  }
}

export function row(gap: number = padding.m) {
  return {
    ...flex.row,
    alignItems: 'center',

    '& > :not(:last-child)': {
      marginRight: gap
    }
  }
}

export const overlay = {
  position: 'absolute',
  top:      0,
  bottom:   0,
  left:     0,
  right:    0
}

export const icon = {
  small:  {width: 12, height: 12},
  normal: {width: 16, height: 16},
  large:  {width: 24, height: 24}
}

export const gridCell = {
  width:  50,
  height: 50,
}

export const fitImage = {
  '& img': {
    display:   'block',
    maxWidth:  '100%',
    maxHeight: '100%'
  }
}

export const logo = {width: 150, height: 40}
export const avatar = {width: 32, height: 32}

export const badge = {
  height: {
    normal: fonts.small.size + 2 * padding.xs
  }
}

export const buttonPadding = [8, 16]
export const leftNavWidth  = 244

export const z = {
  modal:      100,
  messageBox: 200,
  popup:      1000
}

export const durations = {
  short:  200,
  medium: 300,
  long:   500
}

export const transitions = {
  short:  transitionBuilder(durations.short),
  medium: transitionBuilder(durations.medium),
  long:   transitionBuilder(durations.long),
}

function transitionBuilder(duration: number) {
  return function (property: string | string[], timing: string = 'ease-in-out') {
    return transition(property, duration, timing)
  }
}

export function transition(
  property: string | string[],
  duration: number = durations.medium,
  timing: string = 'ease-in-out'
) {
  const properties = property instanceof Array ? property : [property]
  return properties.map(prop => [prop, `${duration}ms`, timing])
}