// @flow

import {Level} from '../program'
import manifest from './chapters.yml'

export const levels = {
	intro:       require('./intro.yml'),

	loops1:      require('./loops1.yml'),
	loops2:      require('./loops2.yml'),

	variables1:  require('./variables1.yml'),
	variables2:  require('./variables2.yml'),
	variables3:  require('./variables3.yml'),
	variables4:  require('./variables4.yml'),
	variables5:  require('./variables5.yml'),
	variables6:  require('./variables6.yml'),
	variables7:  require('./variables7.yml'),
	variables8:  require('./variables8.yml'),

	boolean1:  require('./boolean1.yml'),
	boolean2:  require('./boolean2.yml'),

	functions1:  require('./functions1.yml'),
	functions2:  require('./functions2.yml'),
	functions3:  require('./functions3.yml'),

	arrays1:     require('./arrays1.yml'),
	arrays2:     require('./arrays2.yml'),

	algorithms1: require('./algorithms1.yml'),
	algorithms2: require('./algorithms2.yml'),
	algorithms3: require('./algorithms3.yml'),
	algorithms4: require('./algorithms4.yml'),
}

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