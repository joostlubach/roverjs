import EventEmitter from 'events'
import * as firebase from 'firebase/app'
import { User as FirebaseUser } from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'
import 'firebase/firestore'
import axios from 'axios'
import config from '../config'

const baseURL = 'https://api.github.com'

const requestConfig = (token: string) => ({
  headers: {
    Accept: 'application/vnd.github.v3+json',
    Authorization: 'token ' + token
  }
})

export interface User {
  name: string
  email: string
  login: string
}

class FirebaseService extends EventEmitter {

  private provider = new firebase.auth.GithubAuthProvider()

  user: User | null = null

  constructor() {
    super()
    firebase.initializeApp(config.firebase)
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
          this.user = user
          this.emit('authChange', user)
        })
    } else {
      this.user = null
      this.emit('authChange', null)
    }
  }

  signIn() {
    firebase.auth().signInWithPopup(this.provider)
      .then(result => {
        // This gives you a GitHub Access Token. You can use it to access the GitHub API.
        const token = result.credential.accessToken
        window.localStorage.setItem('github:token', token)
      }).catch((error: any) => {
        this.user = null
        // TODO: Handle Errors here.
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
        this.user = null
        // Sign-out successful.
      }).catch((error: any) => {
        // TODO: An error happened.
      })
  }

  writeLevelScores(scores: any[]) {
    if (this.user != null) {
      firebase.database().ref(`scores/${this.user.login}`).set(scores)
      const codes = JSON.parse(window.localStorage.codes || '{}')
      firebase.database().ref(`codes/${this.user.login}`).set(codes)
    }
  }
}

export default new FirebaseService()
