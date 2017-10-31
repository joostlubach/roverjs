// @flow

import {observable, reaction, action} from 'mobx'
import levels from '../levels'
import type {Level} from '../program'
import {programStore} from '.'

export default class LevelStore {

	constructor() {
		reaction(() => [this.levelScores, programStore && programStore.level], () => { this.save() })
	}

	@observable
	levels: Level[] = levels

	@observable
	levelScores: Map<number, number> = new Map()

	@action
	completeLevel(score: number) {
		const currentLevel = programStore.level
		if (currentLevel == null) { return }

		this.levelScores.set(currentLevel.id, score)
	}

	@action
	next() {
		const currentLevel = programStore.level
		if (currentLevel == null) { return }

		this.goTo(currentLevel.id + 1)
	}

	@action
	goTo(levelID: number) {
		const level = levels.find(lvl => lvl.id === levelID)
		if (level == null) { return }

		programStore.loadLevel(level)
	}

	isLevelSelectable(level: Level) {
		return level.id <= this.levelScores.size + 1
	}

	@action
	load() {
		this.levelScores = new Map(JSON.parse(window.localStorage.levelScores || '[]'))

		const currentLevelID = JSON.parse(window.localStorage.currentLevelID || '1')
		const currentLevel = levels.find(lvl => lvl.id === currentLevelID)
		programStore.loadLevel(currentLevel)
	}

	save() {
		const currentLevel = programStore.level
		if (currentLevel != null) {
			window.localStorage.currentLevelID = JSON.stringify(currentLevel.id)
		}

		window.localStorage.levelScores = JSON.stringify(Array.from(this.levelScores))
	}

}