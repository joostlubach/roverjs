import JSS from 'jss'

// @index: export * as ${variable} from ${relpath}

import * as colors from './colors'
import * as fonts from './fonts'
import * as layout from './layout'
import * as markdown from './markdown'
import * as presets from './presets'
import * as shadows from './shadows'

export {colors, fonts, layout, markdown, presets, shadows}

// /index

// Pre-fab styles

export function jss(styles: Object) {
  return JSS.createStyleSheet(styles).attach().classes
}

let keyframesCounter = 0

export function jssKeyframes(name: string, config: Object) {
  const key = `${name}-${++keyframesCounter}`

  const stylesheet = JSS.createStyleSheet({
    [`@keyframes ${key}`]: config
  })
  stylesheet.attach()

  return key
}