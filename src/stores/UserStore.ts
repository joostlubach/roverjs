import {observable} from 'mobx'
import firebaseService from '../services/FirebaseService'
import {User} from '../services/FirebaseService'

export default class UserStore {

  @observable
  user: User | null = null

  constructor() {
    firebaseService.on('authChange', (user: User) => {
      this.user = user
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