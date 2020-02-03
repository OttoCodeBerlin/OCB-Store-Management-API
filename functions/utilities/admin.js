const admin = require('firebase-admin')

//serve
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://ocb-store-management.firebaseio.com"
})

//deploy
// admin.initializeApp()

const db = admin.firestore()

module.exports = { admin, db }
