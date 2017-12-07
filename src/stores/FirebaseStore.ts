import {observable} from 'mobx'
import firebaseService from '../services/FirebaseService'
import {programStore, simulatorStore} from '.'
// import {User} from '../services/FirebaseService'

export interface User {
  name: string
  email: string
  login: string
}

export interface LevelStats {
  id: string
  code: string,
  chapter: {
    id: string,
    number: number
  },
  scores: number[]
}

export default class FirebaseStore {

  @observable
  user: User | null = null

  constructor() {
    programStore.on('start', (data: LevelStats) => {
      firebaseService.writeLevelStats(data)
    })
    simulatorStore.on('done', (score: any) => {
      firebaseService.updateLevelStats(score)
    })
  }

  toggleSignIn() {
    if (this.user) {
      firebaseService.signOut()
    } else {
      firebaseService.signIn()
    }
  }
}