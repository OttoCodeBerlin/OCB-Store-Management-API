// firebase deploy
// For firebase serve change admin settings
// npm i -S ********

const functions = require('firebase-functions')
const app = require('express')()
const cors = require('cors')
const FBauth = require('./utilities/fbauth')
const { db } = require('./utilities/admin')
const {
  getAllCustomers,
  confirmCustomer,
  createCustomer,
  getCustomer,
  deleteCustomer,
  uploadImage_1,
  uploadImage_2,
  updateCustomer
} = require('./handlers/customers')

const { signup, login, updateUser, getAuthenticatedUser, getUserDetails } = require('./handlers/users')

app.use(cors())

//Customer routes
app.get('/customers', getAllCustomers) //OK
app.post('/customer/:customerId/confirm', FBauth, confirmCustomer) //OK?
app.post('/customer', FBauth, createCustomer) //OK
app.post('/customer/:customerId/image1', uploadImage_1) //OK
app.post('/customer/:customerId/image2', uploadImage_2) //OK
app.get('/customer/:customerId', getCustomer) //OK
app.post('/customer/:customerId', updateCustomer) //OK
app.delete('/customer/:customerId', FBauth, deleteCustomer) //OK

//User routes
app.post('/signup', signup) //OK
app.post('/login', login) //OK
app.post('/user', FBauth, updateUser) //OK, all fields to be pre-fetched and pre-filled on update!
app.get('/user', FBauth, getAuthenticatedUser) //OK
app.get('/user/:handle', getUserDetails) //OK

exports.api = functions.region('europe-west1').https.onRequest(app)

// exports.createNotificationOnLike = functions
//   .region('europe-west1')
//   .firestore.document('likes/{id}')
//   .onCreate(snapshot => {
//     return db
//       .doc(`/screams/${snapshot.data().screamId}`)
//       .get()
//       .then(doc => {
//         if (doc.exists && doc.data().userHandle !== snapshot.data().userHandle) {
//           return db.doc(`/notifications/${snapshot.id}`).set({
//             createdAt: new Date().toISOString(),
//             recipient: doc.data().userHandle,
//             sender: snapshot.data().userHandle,
//             type: 'like',
//             read: false,
//             screamId: doc.id
//           })
//         }
//       })
//       .catch(err => console.error(err))
//   })

// exports.deleteNotificationOnUnlike = functions
//   .region('europe-west1')
//   .firestore.document('likes/{id}')
//   .onDelete(snapshot => {
//     return db
//       .doc(`/notifications/${snapshot.id}`)
//       .delete()
//       .catch(err => console.error(err))
//   })

// exports.createNotificationOnComment = functions
//   .region('europe-west1')
//   .firestore.document('comments/{id}')
//   .onCreate(snapshot => {
//     return db
//       .doc(`/screams/${snapshot.data().screamId}`)
//       .get()
//       .then(doc => {
//         if (doc.exists && doc.data().userHandle !== snapshot.data().userHandle) {
//           return db.doc(`/notifications/${snapshot.id}`).set({
//             createdAt: new Date().toISOString(),
//             recipient: doc.data().userHandle,
//             sender: snapshot.data().userHandle,
//             type: 'comment',
//             read: false,
//             screamId: doc.id
//           })
//         }
//       })
//       .catch(err => console.error(err))
//   })

// exports.onUserImageChange = functions
//   .region('europe-west1')
//   .firestore.document('/users/{userId}')
//   .onUpdate(change => {
//     console.log(change.before.data())
//     console.log(change.before.data())
//     if (change.before.data().imageUrl !== change.after.data().imageUrl) {
//       console.log('Image changed')
//       let batch = db.batch()
//       return db
//         .collection('screams')
//         .where('userHandle', '==', change.before.data().handle)
//         .get()
//         .then(data => {
//           data.forEach(doc => {
//             const scream = db.doc(`/screams/${doc.id}`)
//             batch.update(scream, { userImage: change.after.data().imageUrl })
//           })
//           return batch.commit()
//         })
//     } else return true
//   })

// exports.onScreamDelete = functions
//   .region('europe-west1')
//   .firestore.document('/screams/{screamId}')
//   .onDelete((snapshot, context) => {
//     const screamId = context.params.screamId
//     const batch = db.batch()
//     return db
//       .collection('comments')
//       .where('screamId', '==', screamId)
//       .get()

//       .then(data => {
//         data.forEach(doc => {
//           batch.delete(db.doc(`/comments/${doc.id}`))
//         })
//         return db
//           .collection('likes')
//           .where('screamId', '==', screamId)
//           .get()
//       })

//       .then(data => {
//         data.forEach(doc => {
//           batch.delete(db.doc(`/likes/${doc.id}`))
//         })
//         return db
//           .collection('notifications')
//           .where('screamId', '==', screamId)
//           .get()
//       })

//       .then(data => {
//         data.forEach(doc => {
//           batch.delete(db.doc(`/notifications/${doc.id}`))
//         })
//         return batch.commit()
//       })
//       .catch(err => console.error(err))
//   })
