// @flow

import JSS from 'jss'

// @index: export * as ${variable} from ${relpath}

export * as colors from './colors'
export * as fonts from './fonts'
export * as layout from './layout'
export * as markdown from './markdown'
export * as presets from './presets'
export * as shadows from './shadows'

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