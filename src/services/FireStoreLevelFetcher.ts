import * as firebase from 'firebase/app'
import LevelFetcher from './LevelFetcher'
import { Chapter, Level } from '../program'

interface FireStoreDoc {
  id: string
  data: any
}

export default class FirestoreLevelFetcher implements LevelFetcher {

  docs: FireStoreDoc[]

  async fetchChapters(): Promise<Chapter[]> {
    await this.getFireStoreDocs()
    const doc = this.docs.find(doc => doc.id === 'chapters')
    if (doc != null) {
      const { chapters } = doc.data
      return chapters.map((id: string, i: number) => {
        return this.getChapter(i + 1, id)
      })
    } else {
      throw Error('error loading data')
    }
  }

  private getChapter(number: number, id: string): Chapter | null {
    const docId = `${id}.chapter`
    const doc = this.docs.find((doc: any) => doc.id === docId)
    if (doc == null) {
      return null
    }

    const { name, description } = doc.data

    const chapter: Chapter = {
      id,
      number,
      name,
      description,
      levels: []
    }

    chapter.levels = this.getLevelsForChapter(chapter)
    return chapter
  }

  getLevelsForChapter(chapter: Chapter): Level[] {
    return this.docs
      .filter(doc => doc.id.startsWith(chapter.id + '.'))
      .filter(doc => doc.id !== `${chapter.id}.chapter`)
      .sort((a, b) => a.id.localeCompare(b.id))
      .map(doc => {
        const [, id] = doc.id.split('.')
        return new Level(chapter, { id, ...doc.data })
      })
  }

  fetchChapter(number: number, id: string): Promise<Chapter> {
    throw Error('not implemented')
  }

  fetchLevelsForChapter(chapter: Chapter): Promise<Level[]> {
    throw Error('not implemented')
  }

  fetchLevel(chapter: Chapter, id: string): Promise<Level> {
    throw Error('not implemented')
  }

  private async getFireStoreDocs(): Promise<void> {
    this.docs = await firebase.firestore().collection('levels')
      .get()
      .then(querySnapshot => querySnapshot.docs.map(doc => {
        const { json } = doc.data()
        return {
          id: doc.id,
          data: JSON.parse(json)
        }
      }))
  }
}
