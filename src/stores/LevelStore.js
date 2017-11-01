// @flow

import {observable, reaction, action} from 'mobx'
import levels from '../levels'
import type {Level} from '../program'
import {programStore} from '.'
import URL from 'url'

export default class LevelStore {

	@observable
	levels: Level[] = levels

	@observable
	levelScores: Map<number, number> = new Map()

	@action
	completeLevel(score: number) {
		const currentLevel = programStore.level
		if (currentLevel == null) { return }

		const existingScore = this.levelScores.get(currentLevel.id)
		if (existingScore == null || existingScore < score) {
			this.levelScores.set(currentLevel.id, score)
			this.save()
		}
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
		this.save()
	}

	isLevelSelectable(level: Level) {
		const url = URL.parse(document.location.href, true)
		if (url.query.dbg != null) { return true }
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