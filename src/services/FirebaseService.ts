import * as firebase from 'firebase/app'
import { User as FirebaseUser } from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import axios from 'axios'
import config from '../config'
import {Level} from '../program'
import { firebaseStore, levelStore, programStore } from '../stores'
import { User, LevelStats } from '../stores/FirebaseStore'

const baseURL = 'https://api.github.com'

const requestConfig = (token: string) => ({
  headers: {
    Accept: 'application/vnd.github.v3+json',
    Authorization: 'token ' + token
  }
})

const devLog = (...args: any[]) => {
  if (config.environment === 'dev') {
    // tslint:disable-next-line:no-console
    console.log(...args)
  }
}

class FirebaseService {

  private provider = new firebase.auth.GithubAuthProvider()
  private db: firebase.firestore.Firestore

  constructor() {
    firebase.initializeApp(config.firebase)
    this.db = firebase.firestore()
    firebase.auth().onAuthStateChanged(this.onAuthStateChangeHandler)
  }

  onAuthStateChangeHandler = (user: FirebaseUser) => {
    const token = window.localStorage.getItem('github:token')
    if (user && token) {
      axios.get(baseURL + '/user', requestConfig(token))
        .then(res => {
          const email: string = res.data.email
          const login: string = res.data.login
          const name: string = res.data.name
          return { email, login, name }
        })
        .then((user: User) => {
          firebaseStore.user = user
        })
        .catch((error: Error) => {
          devLog('sign-in error:', error)
          firebaseStore.user = null
        })
    } else {
      firebaseStore.user = null
    }
  }

  signIn() {
    firebase.auth().signInWithPopup(this.provider)
      .then(result => {
        // This gives you a GitHub Access Token. You can use it to access the GitHub API.
        const token = result.credential.accessToken
        window.localStorage.setItem('github:token', token)
      }).catch((error: any) => {
        firebaseStore.user = null
        devLog('sign-in error:', error)
        // const errorCode = error.code
        // const errorMessage = error.message
        // The email of the user's account used.
        // const email = error.email
        // The firebase.auth.AuthCredential type that was used.
        // const credential = error.credential
        // ...
      })
  }

  signOut() {
    firebase.auth().signOut()
      .then(() => {
        firebaseStore.user = null
        // Sign-out successful.
      }).catch((error: Error) => {
        devLog('sign-out error:', error)
        // TODO: An error happened.
      })
  }

  async writeLevelStats(stats: LevelStats) {
    const { user } = firebaseStore
    const {currentChapter: chapter} = levelStore
    const { level } = programStore

    if (user && chapter && level) {
      try {
        const snapshot = await this.getLevelStats(level)
        const data = {
          ...stats,
          user: user.login,
          chapter: {
            id: chapter.id,
            number: chapter.number
          },
          timestamp: new Date().toISOString()
        }
        if (snapshot == null) {
          await this.db.collection('levels').add(data)
        } else {
          await this.db.collection('levels').doc(snapshot.id).set(data)
        }
      } catch (error) {
        // fail silently
        devLog('Error adding document: ', error)
      }
    }
  }

  async updateLevelStats(score: any) {
    const { user } = firebaseStore
    const { level } = programStore
    if (user && level) {
      try {
        const snapshot = await this.getLevelStats(level)
        if (snapshot !== null) {
          const data = {
            ...snapshot.data(),
            timestamp: new Date().toISOString(),
            score: score.score
          }
          await this.db.collection('levels').doc(snapshot.id).set(data)
        }
      } catch (error) {
        // fail silently
        devLog('Error updating document: ', error)
      }
    }
  }

  getLevelStats(level: Level) {
    const { user } = firebaseStore
    return this.db.collection('levels')
      .where('user', '==', user!.login)
      .where('id', '==', level.id)
      .get()
      .then(querySnapshot => {
        return querySnapshot.empty ? null : querySnapshot.docs[0]
      })
  }
}

export default new FirebaseService()
