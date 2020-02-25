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
