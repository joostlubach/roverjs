// @flow

import Color from 'color'

export const black = new Color('black')
export const white = new Color('white')
export const transparent = new Color('transparent')

export const green  = new Color('#8ABB55')
export const blue   = new Color('#4A90E2')
export const yellow = new Color('#FFE70F')
export const amber  = new Color('#F6A623')
export const red    = new Color('#CB2A3E')
export const purple = new Color('#70657C')

export const primary   = green
export const secondary = blue
export const link      = amber
export const error     = red
export const shadow    = black.alpha(0.3)
export const focus     = blue.alpha(0.4)
export const search    = blue

export const bg = {
	light:         white,
	medium:        new Color('#F9F9F9'),
	dark:          new Color('#CCCCCC'),

	toolbar:       new Color('#444').alpha(0.9),
	grid:          purple.darken(0.4),

	overlay:       black.alpha(0.4)
}

export const fg = {
	normal:       new Color('#333'),
	dim:          new Color('#777'),
	dashboard:    new Color('#B1CCDB'),
	inverted:     white
}

export const placeholder = fg.normal.alpha(0.3)

export const border = {
	light:    new Color('#eee'),
	medium:   new Color('#ccc'),
	dark:     new Color('#aaa'),
	grid:     amber
}

export const leftnav = {
	background:      primary,
	eventBackground: new Color('black').alpha(0.1),
	navBackground:   new Color('black').alpha(0.3),
	foreground:      new Color('white').alpha(0.8),
	highlight:       new Color('white').alpha(0.04),
	bright:          new Color('white'),
	accent:          secondary,
}

export const positive  = green
export const neutral   = blue
export const negative  = red

export const overlay   = new Color('black').alpha(0.3)
export const highlight = green

export const alert = {
	info: {
		background: blue,
		foreground: new Color('white')
	},
	success: {
		background: green,
		foreground: new Color('white')
	},
	warning: {
		background: amber,
		foreground: new Color('white')
	},
	error: {
		background: red,
		foreground: new Color('white')
	}
}

export function contrast(backgroundColor: Color): Color {
	return backgroundColor.luminosity() < 0.5 ? fg.inverted : fg.normal
}

export function linearGradient(side: string, from: Color, to: Color): string {
	return `linear-gradient(${side}, ${from.string()}, ${to.string()})`
}

export function bevelGradient(side: string) {
	return linearGradient(side, white.alpha(0.05), black.alpha(0.05))
}