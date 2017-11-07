// @flow
import { observable, computed, action } from 'mobx'
import yaml from 'js-yaml'
import { Level } from '../program'
import { programStore, viewStateStore } from '.'
import URL from 'url'
import * as github from '../services/github'

export type Chapter = {
	name: string,
	description: string,
	levels: Level[]
}

export default class GitHubLevelStore {

	_chapters = []

	get chapters() {
		return this._chapters
	}

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
		for (const chapter of this._chapters) {
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
		const { currentLevel } = this
		if (currentLevel == null) { return }

		const existingScore = this.levelScores.get(currentLevel.id)
		if (existingScore == null || existingScore < score) {
			this.levelScores.set(currentLevel.id, score)
			this.save()
		}
	}

	@action
	next() {
		const { nextLevel } = this
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

		const { chapter } = level
		const index = chapter.levels.indexOf(level)
		if (index <= 0) { return true }

		const previousLevel = chapter.levels[index - 1]
		return this.levelScores.has(previousLevel.id)
	}

	@action
	async load() {
		try {
			this._chapters = await this.fetchChapters()

			this.levelScores = new Map(JSON.parse(window.localStorage.levelScores || '[]'))

			const currentLevelID = JSON.parse(window.localStorage.currentLevelID || '"intro"')
			this.loadLevel(currentLevelID)
		} catch (err) {
			console.error('load', err)
		}
	}

	async fetchChapters() {
		const {data: chapterDescriptors} = await this.fetchLevel('chapters')
		const levels = await this.fetchLevels(chapterDescriptors)

		const chapters = []
		for (const [i, config] of chapterDescriptors.entries()) {
			const { id, name, description } = config

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
		return chapters
	}

	async fetchLevels(chapterDescriptors) {
		const levelNames = chapterDescriptors.reduce((prev, descriptor) => {
			prev = [...prev, ...descriptor.levels]
			return prev
		}, [])

		const promises = levelNames.map(levelName => this.fetchLevel(levelName))
		const results = await Promise.all(promises)
		return results.reduce((acc, result) => {
			acc[result.name] = result.data
			return acc
		}, {})
	}

	save() {
		const { currentLevel } = this
		if (currentLevel != null) {
			window.localStorage.currentLevelID = JSON.stringify(currentLevel.id)
		}

		window.localStorage.levelScores = JSON.stringify(Array.from(this.levelScores))
	}

	async fetchLevel(levelName) {
		const fileList = await github.fetchFileList()
		const fileInfo = fileList[levelName]
		if (!fileInfo) {
			throw new Error(`File for level '${levelName}' not found`)
		}

		let levelCache = JSON.parse(window.localStorage.getItem('levelCache')) || {}
		let levelNode = levelCache[levelName]
		const haveValidData = levelNode && levelNode.sha === fileInfo.sha

		if (!haveValidData) {
			const yamlString = await github.fetchLevel(fileInfo.url)
			levelNode = {
				sha:  fileInfo.sha,
				data: yaml.safeLoad(yamlString)
			}
			levelCache = JSON.parse(window.localStorage.getItem('levelCache')) || {}
			levelCache[levelName] = levelNode
			window.localStorage.setItem('levelCache', JSON.stringify(levelCache))
		}

		return {
			name: levelName,
			data: levelNode.data
		}
	}
}