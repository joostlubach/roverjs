const firebase = require('firebase/app')
require('firebase/firestore')
const YAML = require('js-yaml')

const config = {
  apiKey: "AIzaSyCnYg-NrgWdtssBUFfhIwRTmLL_TcW-ww4",
  authDomain: "roverjs-dev-ddb3e.firebaseapp.com",
  databaseURL: "https://roverjs-dev-ddb3e.firebaseio.com",
  projectId: "roverjs-dev-ddb3e",
  storageBucket: "",
  messagingSenderId: "551204066720"
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
