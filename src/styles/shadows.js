// @flow

import * as colors from './colors'

export function vertical(depth: number, inset: boolean = false) {
	const shadow = [0, depth, 2 * depth, 0, colors.shadow.alpha(depth * 0.1)]
	if (inset) { shadow.unshift('inset') }
	return shadow
}

export function horizontal(depth: number, inset: boolean = false) {
	const shadow = [depth, 0, 2 * depth, 0, colors.shadow.alpha(depth * 0.1)]
	if (inset) { shadow.unshift('inset') }
	return shadow
}

export function float(depth: number, inset: boolean = false) {
	const shadow = [depth, depth, 2 * depth, 0, colors.shadow.alpha(depth * 0.1)]
	if (inset) { shadow.unshift('inset') }
	return shadow
}

export const toolbar = vertical(2)
export const modal   = float(3)
export const focus   = [0, 0, 2, 1, colors.blue]
export const input   = ['inset', 0, 1, 2, 0, colors.shadow.alpha(0.1)]