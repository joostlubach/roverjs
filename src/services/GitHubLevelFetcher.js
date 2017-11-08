// @flow

import YAML from 'js-yaml'
import GitHub from './GitHub'
import {Level} from '../program'
import type {Chapter} from '../stores/LevelStore'

export default class GitHubLevelFetcher {

	constructor(repository: string, branch: string) {
		this.gitHub = new GitHub(repository, {branch})
	}

	gitHub: GitHub

	async fetchChapters() {
		const chaptersYAML = await this.fetchYAML('chapters.yml')

		const promises = chaptersYAML.chapters.map((id, i) => {
			return this.fetchChapter(i + 1, id)
		})

		return Promise.all(promises)
	}

	async fetchChapter(number: number, id: string) {
		const chapterYAML = await this.fetchYAML(`${id}/chapter.yml`)
		const {name, description} = chapterYAML

		const chapter = {
			id,
			number,
			name,
			description,
			levels: []
		}

		chapter.levels = await this.fetchLevelsForChapter(chapter)
		return chapter
	}

	async fetchLevelsForChapter(chapter: Chapter) {
		const files = await this.gitHub.fetchDirectory(chapter.id)
		files.sort((a, b) => a.name.localeCompare(b.name))

		const promises = []
		for (const file of files) {
			if (file.name === 'chapter.yml') { continue }

			const id = file.name.replace(/\.yml$/, '')
			promises.push(this.fetchLevel(chapter, id))
		}

		return Promise.all(promises)
	}

	async fetchLevel(chapter: Chapter, id: string) {
		const levelYAML = await this.fetchYAML(`${chapter.id}/${id}.yml`)
		return new Level(chapter, {id, ...levelYAML})
	}

	async fetchYAML(path: string): ?Object {
		const file = await this.gitHub.fetchFile(path)
		const content = atob(file.content)
		return YAML.safeLoad(content)
	}

}