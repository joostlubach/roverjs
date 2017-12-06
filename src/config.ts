import * as URL from 'url'
import GitHubLevelFetcher from './services/GitHubLevelFetcher'
import HTTPLevelFetcher from './services/HTTPLevelFetcher'

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

function localLevelFetcher() {
  return new HTTPLevelFetcher('http://localhost:3012')
}

function tmpFetcher() {
  return new HTTPLevelFetcher('https://rover-levels-ytvaktpxqm.now.sh')
}

function gitHubLevelFetcher() {
  return new GitHubLevelFetcher(
    'HackYourFuture/rover-levels',
    is('live') ? 'live' : 'test'
  )
}

export default {

  environment: environment(),

  svg: {
    iconPrefix: 'icon-'
  },

  levels: {
    firstLevelID: 'intro1',

    fetcher: is('dev')
      ? tmpFetcher() //localLevelFetcher()
      : tmpFetcher()
      // : gitHubLevelFetcher()
  },

  firebase: {
    apiKey: "AIzaSyCnYg-NrgWdtssBUFfhIwRTmLL_TcW-ww4",
    authDomain: "roverjs-dev-ddb3e.firebaseapp.com",
    databaseURL: "https://roverjs-dev-ddb3e.firebaseio.com",
    projectId: "roverjs-dev-ddb3e",
    storageBucket: "",
    messagingSenderId: "551204066720"
  }

}