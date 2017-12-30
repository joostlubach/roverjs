import * as URL from 'url'
// import GitHubLevelFetcher from './services/GitHubLevelFetcher'
// import HTTPLevelFetcher from './services/HTTPLevelFetcher'
import FireStoreLevelFetcher from './services/FireStoreLevelFetcher'

function environment() {
  const url = URL.parse(document.location.href)

  switch (url.hostname) {
  case 'roverjs.com':      return 'live'
  case 'test.roverjs.com': return 'test'
  default:                 return 'dev'
  }
}

function is(env: string) {
  return env === environment()
}

// function localLevelFetcher() {
//   return new HTTPLevelFetcher('http://localhost:3012')
// }

// function tmpFetcher() {
//   return new HTTPLevelFetcher('https://rover-levels-ytvaktpxqm.now.sh')
// }

// function gitHubLevelFetcher() {
//   return new GitHubLevelFetcher(
//     'HackYourFuture/rover-levels',
//     is('live') ? 'live' : 'test'
//   )
// }

function fireStoreLevelFetcher() {
  return new FireStoreLevelFetcher()
}

export default {

  environment: environment(),

  svg: {
    iconPrefix: 'icon-'
  },

  levels: {
    firstLevelID: 'intro1',

    fetcher: is('dev')
      ? fireStoreLevelFetcher() //localLevelFetcher()
      : fireStoreLevelFetcher()
      // : gitHubLevelFetcher()
  },

  firebase: {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID
  }
}