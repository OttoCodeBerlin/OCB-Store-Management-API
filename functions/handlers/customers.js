const { admin, db } = require('../utilities/admin')
const nodemailer = require('nodemailer')
const fs = require('fs')

// const firebase = require('firebase')
require('dotenv').config()

const email_part1 = fs.readFileSync(__dirname + '/emailSnippets/email_part1.txt').toString()
const email_part2 = fs.readFileSync(__dirname + '/emailSnippets/email_part2.txt').toString()
const resend_email_part1 = fs.readFileSync(__dirname + '/emailSnippets/resend_email_part1.txt').toString()
const resend_email_part2 = fs.readFileSync(__dirname + '/emailSnippets/resend_email_part2.txt').toString()

let transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
})

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

// firebase.initializeApp(config)

exports.getAllCustomers = (req, res) => {
  db.collection('customers')
    .orderBy('createdAt', 'desc')
    .get()
    .then(data => {
      let customers = []
      data.forEach(doc => {
        customers.push({
          customerId: doc.id,
          first_name: doc.data().first_name,
          last_name: doc.data().last_name,
          email: doc.data().email,
          createdAt: doc.data().createdAt,
          userHandle: doc.data().userHandle,
          customerImage_1: doc.data().customerImage_1,
          customerImage_2: doc.data().customerImage_2
        })
      })
      return res.json(customers)
    })
    .catch(err => {
      console.error(err)
      res.status(500).json({ error: err.code })
    })
}

exports.createCustomer = (req, res) => {
  // if (req.body.body.trim() === '') {
  //   return res.status(400).json({ body: 'Body must not be empty.' })
  // }
  const newCustomer = {
    first_name: '', //req.body.first_name,
    last_name: '', //req.body.last_name,
    email: req.body.email,
    createdAt: new Date().toISOString(),
    updatedAt: '',
    userHandle: req.user.handle,
    customerImage_1: '',
    customerImage_2: ''
  }
  db.collection('customers')
    .add(newCustomer)
    .then(doc => {
      transporter.sendMail({
        from: '"Sustainable. Fashion. O." <mailer@ocbcms.com>',
        to: req.body.email,
        subject: 'Sustainable. Fashion. O. Welcome to your store - Please complete your profile',
        html: email_part1 + 'https://ocb-store-management.firebaseapp.com/confirm/' + doc.id + email_part2
      })
    })
    .then(doc => {
      res.status(200).json({ message: 'Email sent successfully to ' + req.body.email + '.' })
    })
    .catch(err => {
      res.status(500).json({ error: 'Something went wrong' })
      console.error(err)
    })
}

exports.confirmCustomer = (req, res) => {
  const updateData = {
    updatedAt: new Date().toISOString(),
    customerImage_1: '',
    customerImage_2: ''
  }
  let custId = req.params.customerId
  db.doc(`/customers/${custId}`)
    .update(updateData)
    // db.collection('customers')
    //   .add(newCustomer)
    .then(doc => {
      db.doc(`/customers/${custId}`)
        .get()
        .then(doc => {
          if (!doc.exists) {
            return res.status(404).json({ error: 'Customer not found' })
          }
          customerData = doc.data()
          transporter.sendMail({
            from: '"Sustainable. Fashion. O." <mailer@ocbcms.com>',
            to: customerData.email,
            subject: 'Sustainable. Fashion. O. Welcome to your store - Please complete your profile',
            html:
              resend_email_part1 + 'https://ocb-store-management.firebaseapp.com/confirm/' + custId + resend_email_part2
          })
        })
        .then(doc => {
          res
            .status(200)
            .json({ message: 'Customer confirmation email sent successfully to ' + customerData.email + '.' })
        })
      // .catch(err => {
      //   res.status(500).json({ error: 'Something went wrong' })
      //   console.error(err)
      // })
    })
    .catch(err => {
      res.status(500).json({ error: 'Something went wrong' })
      console.error(err)
    })
}

//Fetch customer by ID
exports.getCustomer = (req, res) => {
  let customerData = {}
  db.doc(`/customers/${req.params.customerId}`)
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: 'Customer not found' })
      }
      customerData = doc.data()
      customerData.customerId = doc.id
      // return db
      //   .collection('customers')
      //   .orderBy('createdAt', 'desc')
      //   .where('customerId', '==', req.params.customerId)
      //   .get()
      return res.json(customerData)
    })
    // .then(data => {
    //   customerData.comments = []
    //   data.forEach(doc => {
    //     customerData.comments.push(doc.data())
    //   })
    //   return res.json(customerData)
    // })
    .catch(err => {
      console.error(err)
      res.status(500).json({ error: err.code })
    })
}

//Update customer
exports.updateCustomer = (req, res) => {
  if (req.body.first_name.trim() === '') {
    return res.status(400).json({ body: 'First name must not be empty.' })
  }
  const updateData = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    updatedAt: new Date().toISOString(),
    customerImage_1: '',
    customerImage_2: ''
  }

  db.doc(`/customers/${req.params.customerId}`)
    .update(updateData)
    .then(() => {
      return res.json({ message: 'Customer updated successfully.' })
    })
    .catch(err => {
      console.error(err)
      return res.status(500).json({ error: err.code })
    })
}

//Delete customer
exports.deleteCustomer = (req, res) => {
  const document = db.doc(`/customers/${req.params.customerId}`)
  document
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: 'Customer not found' })
      } else {
        return document.delete()
      }

      // if (doc.data().userHandle !== req.user.handle) {
      //   return res.status(403).json({ error: 'Unauthorized' })
      // } else {
      //   return document.delete()
      // }
    })
    .then(() => {
      res.json({ message: 'Customer deleted successfully' })
    })
    .catch(err => {
      console.error(err)
      return res.status(500).json({ error: err.code })
    })
}

//Upload Images
exports.uploadImage_1 = (req, res) => {
  const BusBoy = require('busboy')
  const path = require('path')
  const os = require('os')
  const fs = require('fs')

  const busboy = new BusBoy({ headers: req.headers })

  let imageFileName
  let imageToBeUploaded = {}

  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    if (mimetype !== 'image/jpeg' && mimetype !== 'image/jpg' && mimetype !== 'image/png') {
      return res.status(400).json({ error: 'Wrong file type submitted' })
    }
    const imageExtension = filename.split('.')[filename.split('.').length - 1]
    imageFileName = `${Math.round(Math.random() * 100000000000)}.${imageExtension}`
    const filepath = path.join(os.tmpdir(), imageFileName)
    imageToBeUploaded = { filepath, mimetype }
    file.pipe(fs.createWriteStream(filepath))
  })
  busboy.on('finish', () => {
    admin
      .storage()
      .bucket('ocb-store-management.appspot.com')
      .upload(imageToBeUploaded.filepath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageToBeUploaded.mimetype
          }
        }
      })
      .then(() => {
        const customerImage_1 = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`
        return db.doc(`/customers/${req.params.customerId}`).update({ customerImage_1 })
      })
      .then(() => {
        return res.json({ message: 'Image uploaded successfully' })
      })
      .catch(err => {
        console.error(err)
        return res.status(500).json({ error: err.code })
      })
  })
  busboy.end(req.rawBody)
}

exports.uploadImage_2 = (req, res) => {
  const BusBoy = require('busboy')
  const path = require('path')
  const os = require('os')
  const fs = require('fs')

  const busboy = new BusBoy({ headers: req.headers })

  let imageFileName
  let imageToBeUploaded = {}

  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    if (mimetype !== 'image/jpeg' && mimetype !== 'image/jpg' && mimetype !== 'image/png') {
      return res.status(400).json({ error: 'Wrong file type submitted' })
    }
    const imageExtension = filename.split('.')[filename.split('.').length - 1]
    imageFileName = `${Math.round(Math.random() * 100000000000)}.${imageExtension}`
    const filepath = path.join(os.tmpdir(), imageFileName)
    imageToBeUploaded = { filepath, mimetype }
    file.pipe(fs.createWriteStream(filepath))
  })
  busboy.on('finish', () => {
    admin
      .storage()
      .bucket('ocb-store-management.appspot.com')
      .upload(imageToBeUploaded.filepath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageToBeUploaded.mimetype
          }
        }
      })
      .then(() => {
        console.log('Url')
        const customerImage_2 = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`
        return db.doc(`/customers/${req.params.customerId}`).update({ customerImage_2 })
      })
      .then(() => {
        return res.json({ message: 'Image uploaded successfully' })
      })
      .catch(err => {
        console.error(err)
        return res.status(500).json({ error: err.code })
      })
  })
  busboy.end(req.rawBody)
}
