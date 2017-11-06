// @flow

import {observable, computed, action} from 'mobx'
import {chapters, levels} from '../levels'
import type {Level} from '../program'
import {programStore, viewStateStore} from '.'
import URL from 'url'

export type Chapter = {
	name:        string,
	description: string,
	levels:      Level[]
}

export default class LevelStore {

	@observable
	currentChapter: ?Chapter = null

	@observable
	selectingChapter: boolean = false

	@computed
	get levels(): Level[] {
		if (this.currentChapter == null) { return [] }
		return this.currentChapter.levels
	}

	@observable
	currentLevelNumber: number = 1

	@computed
	get currentLevel(): ?Level {
		return this.levels[this.currentLevelNumber - 1]
	}

	@computed
	get nextLevel(): ?Level {
		if (this.currentLevelNumber >= this.levels.length) { return null }
		return this.levels[this.currentLevelNumber]
	}

	@observable
	levelScores: Map<string, number> = new Map()

	chapterComplete(chapter: Chapter) {
		for (const level of chapter.levels) {
			if (!this.levelScores.has(level.id)) { return false }
		}
		return true
	}

	@action
	selectChapter() {
		this.selectingChapter = true
	}

	@action
	cancelChapterSelection() {
		this.selectingChapter = false
	}

	@action
	loadLevel(id: string) {
		for (const chapter of chapters) {
			const index = chapter.levels.findIndex(level => level.id === id)
			if (index === -1) { continue }

			this.currentChapter = chapter
			this.currentLevelNumber = index + 1
			programStore.loadLevel(this.currentLevel)
			viewStateStore.selectedLock = null
			break
		}

		this.selectingChapter = false
		this.save()
	}

	@action
	completeLevel(score: number) {
		const {currentLevel} = this
		if (currentLevel == null) { return }

		const existingScore = this.levelScores.get(currentLevel.id)
		if (existingScore == null || existingScore < score) {
			this.levelScores.set(currentLevel.id, score)
			this.save()
		}
	}

	@action
	next() {
		const {nextLevel} = this
		if (nextLevel == null) { return }

		this.loadLevel(nextLevel.id)
	}

	@action
	goTo(levelNumber: number) {
		const level = levels[levelNumber - 1]
		if (level == null) { return }

		programStore.loadLevel(level)
		this.save()
	}

	isLevelSelectable(level: Level) {
		const url = URL.parse(document.location.href, true)
		if (url.query.dbg != null) { return true }

		const {chapter} = level
		const index = chapter.levels.indexOf(level)
		if (index <= 0) { return true }

		const previousLevel = chapter.levels[index - 1]
		return this.levelScores.has(previousLevel.id)
	}

	@action
	load() {
		this.levelScores = new Map(JSON.parse(window.localStorage.levelScores || '[]'))

		const currentLevelID = JSON.parse(window.localStorage.currentLevelID || '"intro"')
		this.loadLevel(currentLevelID)
	}

	save() {
		const {currentLevel} = this
		if (currentLevel != null) {
			window.localStorage.currentLevelID = JSON.stringify(currentLevel.id)
		}

		window.localStorage.levelScores = JSON.stringify(Array.from(this.levelScores))
	}

}