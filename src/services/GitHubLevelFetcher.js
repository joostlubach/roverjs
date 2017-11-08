// @flow

import yaml from 'js-yaml'
import * as github from './github'

export default class GitHubLevelFetcher {

	constructor(repositoryURL: string, branch: string) {
		this.repositoryURL = repositoryURL
		this.branch = branch
	}

	repositoryURL: string
	branch:        string

	// JIM: De onderstaande methodes moeten aangepast worden aan de nieuwe structuur,
	// zoals ze al staan op hackyourfuture/rover-levels.

	// Ik heb nu de repository URL en branch hier staan. Als dat lastig is, verplaats
	// dat gerust naar github.js, maar ik heb het iig in ../config.js gezet.

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