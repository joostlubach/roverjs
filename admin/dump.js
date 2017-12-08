require('dotenv').config({path: '../.env.local'})
const firebase = require('firebase/app')
require('firebase/firestore')
const YAML = require('js-yaml')

const config = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID
}

function dumpData() {
  firebase.initializeApp(config)
  const db = firebase.firestore()
  return db.collection('levels')
    .orderBy('timestamp', 'desc')
    .get()
    .then(querySnapshot => {
      const docs = querySnapshot.docs.map(doc => doc.data())
      console.log(YAML.safeDump(docs))
    })
}

dumpData()
  .then(() => {
    process.exit()
  })
