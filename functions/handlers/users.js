const { admin, db } = require('../utilities/admin')
const firebase = require('firebase')
require('dotenv').config()

const config = {
  apiKey: process.env.apiKey,
  authDomain: process.env.authDomain,
  databaseURL: process.env.databaseURL,
  projectId: process.env.projectId,
  storageBucket: process.env.storageBucket,
  messagingSenderId: process.env.messagingSenderId,
  appId: process.env.appId,
  measurementId: process.env.measurementId
}

firebase.initializeApp(config)

const { validateSignupData, validateLoginData, reduceUserDetails } = require('../utilities/validators')

//Signup
exports.signup = (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
    store_location: req.body.store_location,
    role: req.body.role,
    updatedAt: ''
  }

  const { valid, errors } = validateSignupData(newUser)

  if (!valid) return res.status(400).json(errors)

  // const noImg = 'profile_anonymus.png'

  let token, userId
  db.doc(`/users/${newUser.handle}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        return res.status(400).json({ handle: 'This username already exists.' })
      } else {
        return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
      }
    })
    .then(data => {
      userId = data.user.uid
      return data.user.getIdToken()
    })
    .then(idToken => {
      token = idToken
      const userCredentials = {
        handle: newUser.handle,
        email: newUser.email,
        store_location: newUser.store_location,
        role: newUser.role,
        createdAt: new Date().toISOString(),
        // imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
        userId
      }
      return db.doc(`/users/${newUser.handle}`).set(userCredentials)
    })
    .then(() => {
      return res.status(201).json({ token })
    })
    .catch(err => {
      console.error(err)
      if (err.code === 'auth/email-already-in-use') {
        return res.status(400).json({ email: 'Email is already registered.' })
      } else {
        return res.status(500).json({ general: 'Something went wrong, please try again' })
      }
    })
}

//Login route
exports.login = (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password
  }

  const { valid, errors } = validateLoginData(user)

  if (!valid) return res.status(400).json(errors)

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then(data => {
      return data.user.getIdToken()
    })
    .then(token => {
      return res.json({ token })
    })
    .catch(err => {
      console.error(err)
      return res.status(403).json({ general: 'Wrong credentials, please try again' })
    })
}

//Update User
exports.updateUser = (req, res) => {
  // let userDetails = reduceUserDetails(req.body)
  // if (req.body.first_name.trim() === '') {
  //   return res.status(400).json({ body: 'First name must not be empty.' })
  // }

  const updateData = {
    handle: req.body.handle,
    email: req.body.email,
    store_location: req.body.store_location,
    role: req.body.role,
    updatedAt: new Date().toISOString()
  }

  db.doc(`/users/${req.user.handle}`)
    .update(updateData)
    .then(() => {
      return res.json({ message: 'User updated successfully.' })
    })
    .catch(err => {
      console.error(err)
      return res.status(500).json({ error: err.code })
    })
}

//Get any user's details
exports.getUserDetails = (req, res) => {
  let userData = {}
  db.doc(`/users/${req.params.handle}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        userData.user = doc.data()
        return db
          .collection('customers')
          .where('userHandle', '==', req.params.handle)
          .orderBy('createdAt', 'desc')
          .get()
      } else {
        return res.status(404).json({ error: 'User not found' })
      }
    })
    .then(data => {
      userData.customers = []
      data.forEach(doc => {
        userData.customers.push({
          first_name: doc.data().first_name,
          last_name: doc.data().last_name,
          email: doc.data().email,
          createdAt: doc.data().createdAt,
          userHandle: doc.data().userHandle,
          customerImage_1: doc.data().customerImage_1,
          customerImage_2: doc.data().customerImage_2,
          updatedAt: doc.data().updatedAt,
          customerId: doc.id
        })
      })
      return res.json(userData)
    })
    .catch(err => {
      console.error(err)
      return res.status(500).json({ error: err.code })
    })
}

//Get own User Details
exports.getAuthenticatedUser = (req, res) => {
  let userData = {}

  db.doc(`/users/${req.user.handle}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        userData.credentials = doc.data()
        // return db
        //   .collection('likes')
        //   .where('userHandle', '==', req.user.handle)
        //   .get()
        return res.json(userData)
      }
    })
    // .then(data => {
    //   userData.customers = []
    //   data.forEach(doc => {
    //     userData.customers.push(doc.data())
    //   })
    //   return db
    //     .collection('notifications')
    //     .where('recipient', '==', req.user.handle)
    //     .orderBy('createdAt', 'desc')
    //     .limit(20)
    //     .get()
    // })
    // .then(data => {
    //   userData.notifications = []
    //   data.forEach(doc => {
    //     userData.notifications.push({
    //       recipient: doc.data().recipient,
    //       sender: doc.data().sender,
    //       createdAt: doc.data().createdAt,
    //       screamId: doc.data().screamId,
    //       type: doc.data().type,
    //       read: doc.data().read,
    //       notificationId: doc.id
    //     })
    //   })
    //   return res.json(userData)
    // })
    .catch(err => {
      console.error(err)
      return res.status(500).json({ error: err.code })
    })
}
