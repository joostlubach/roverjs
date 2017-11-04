// @flow

import {Level} from '../program'
import manifest from './chapters.yml'

export const levels = {}
// @index((?!chapters)\.yml$): levels.${variable} = require(${relpathwithext})
levels.intro = require('./intro.yml')
levels.level10 = require('./level10.yml')
levels.level11 = require('./level11.yml')
levels.level12 = require('./level12.yml')
levels.level3 = require('./level3.yml')
levels.level4 = require('./level4.yml')
levels.level5 = require('./level5.yml')
levels.level6 = require('./level6.yml')
levels.level7 = require('./level7.yml')
levels.level8 = require('./level8.yml')
levels.level9 = require('./level9.yml')
levels.loops1 = require('./loops1.yml')
levels.loops2 = require('./loops2.yml')
// /index

export const chapters = []
for (const [i, config] of manifest.entries()) {
	const {id, name, description} = config

	const chapter = {
		id,
		number: i + 1,
		name,
		description,
		levels: []
	}

	chapter.levels = config.levels.map(id => {
		return Level.deserialize(chapter, id, levels[id])
	})

	chapters.push(chapter)
}