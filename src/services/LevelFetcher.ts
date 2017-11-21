import {Chapter, Level} from '@src/program'

export default interface LevelFetcher {

  fetchChapters(): Promise<Chapter[]>
  fetchChapter(number: number, id: string): Promise<Chapter>
  fetchLevelsForChapter(chapter: Chapter): Promise<Level[]>
  fetchLevel(chapter: Chapter, id: string): Promise<Level>
    
}