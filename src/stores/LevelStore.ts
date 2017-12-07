import {observable, computed, action} from 'mobx'
import {Chapter, Level} from '../program'
import {programStore, viewStateStore} from '.'
import * as URL from 'url'
import config from '../config'

const levelFetcher = config.levels.fetcher
const firstLevelID = config.levels.firstLevelID

export default class LevelStore {

  //------
  // Chapters & levels

  @observable
  loading: boolean = true

  @observable
  loadError: Error | null = null

  @observable
  chapters: Chapter[] = []

  @observable
  currentChapter: Chapter | null = null

  @computed
  get levels(): Level[] {
    if (this.currentChapter == null) { return [] }
    return this.currentChapter.levels
  }

  @observable
  currentLevelNumber: number = 1

  @computed
  get currentLevel(): Level | null {
    return this.levels[this.currentLevelNumber - 1]
  }

  @computed
  get nextLevel(): Level | null {
    if (this.currentLevelNumber >= this.levels.length) { return null }
    return this.levels[this.currentLevelNumber]
  }

  //------
  // Level completion

  @observable
  levelScores: Map<string, number> = new Map()

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

  isChapterComplete(chapter: Chapter) {
    for (const level of chapter.levels) {
      if (!this.levelScores.has(level.id)) { return false }
    }
    return true
  }

  //------
  // Chapter selection dialog

  @observable
  selectingChapter: boolean = false

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
    this.currentChapter = null
    this.currentLevelNumber = 0
    for (const chapter of this.chapters) {
      const index = chapter.levels.findIndex(level => level.id === id)
      if (index === -1) { continue }

      this.currentChapter = chapter
      this.currentLevelNumber = index + 1
      viewStateStore.selectedLock = null

      const {currentLevel} = this
      if (currentLevel != null) {
        programStore.loadLevel(currentLevel)
      }
      break
    }

    // If the level was deleted or something, default to the first level.
    if (this.currentChapter == null && id !== firstLevelID) {
      this.loadLevel(firstLevelID)
      return
    }

    this.selectingChapter = false
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
  next() {
    const { nextLevel } = this
    if (nextLevel == null) { return }

    this.loadLevel(nextLevel.id)
  }

  @action
  goTo(levelNumber: number) {
    const level = this.levels[levelNumber - 1]
    if (level == null) { return }

    programStore.loadLevel(level)
    this.save()
  }

  //------
  // Loading & saving

  @action
  load() {
    this.loading = true

    this.levelScores = new Map(JSON.parse(window.localStorage.levelScores || '[]'))
    this.chapters = loadChapterCache()

    return levelFetcher.fetchChapters()
      .then(action((chapters: Chapter[]) => {
        this.chapters = chapters
        saveChapterCache(this.chapters)
      }), action((error: Error) => {
        this.loadError = error
      }))
      .finally(action(() => {
        this.loading = false

        const currentLevelID = JSON.parse(window.localStorage.currentLevelID || `"${firstLevelID}"`)
        this.loadLevel(currentLevelID)
      }))
  }

  save() {
    const { currentLevel } = this
    if (currentLevel != null) {
      window.localStorage.currentLevelID = JSON.stringify(currentLevel.id)
    }

    const data = Array.from(this.levelScores)
    window.localStorage.levelScores = JSON.stringify(data)
  }

}

function loadChapterCache() {
  const serialized = JSON.parse(localStorage.chapterCache || '[]')

  return serialized.map((serialized: any) => {
    const chapter = {
      ...serialized
    }

    chapter.levels = serialized.levels.map((level: any) => new Level(chapter, level))
    return chapter
  })
}

function saveChapterCache(chapters: Chapter[]) {
  const serialized = chapters.map(chapter => {
    return {
      ...chapter,
      levels: chapter.levels.map(level => level.serialized)
    }
  })

  localStorage.chapterCache = JSON.stringify(serialized)
}