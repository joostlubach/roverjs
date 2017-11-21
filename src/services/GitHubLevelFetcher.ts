import * as yaml from 'js-yaml'
import GitHub from './GitHub'
import {Level} from '../program'
import {Chapter} from '../program'

type YAML = any // tslint:disable-line no-any

export default class GitHubLevelFetcher {

  constructor(repository: string, branch: string) {
    this.gitHub = new GitHub(repository, {branch})
  }

  gitHub: GitHub

  async fetchChapters(): Promise<Chapter[]> {
    const chaptersYAML = await this.fetchYAML('chapters.yml')

    const promises: Promise<Chapter>[] = chaptersYAML.chapters
      .map((id: string, i: number) => {
        return this.fetchChapter(i + 1, id)
      })

    return Promise.all(promises)
  }

  async fetchChapter(number: number, id: string): Promise<Chapter> {
    const chapterYAML = await this.fetchYAML(`${id}/chapter.yml`)
    const {name, description} = chapterYAML

    const chapter: Chapter = {
      id,
      number,
      name,
      description,
      levels: []
    }

    chapter.levels = await this.fetchLevelsForChapter(chapter)
    return chapter
  }

  async fetchLevelsForChapter(chapter: Chapter): Promise<Level[]> {
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

  async fetchYAML(path: string): Promise<YAML> {
    const file = await this.gitHub.fetchFile(path)
    const content = atob(file.content)
    return yaml.safeLoad(content)
  }

}