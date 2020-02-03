const { db } = require('../utilities/admin')

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
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    createdAt: new Date().toISOString(),
    userHandle: req.user.handle,
    customerImage_1: 'tbd',
    customerImage_2: 'tbd'

    // body: req.body.body,
    // userHandle: req.user.handle,
    // userImage: req.user.imageUrl,
    // createdAt: new Date().toISOString(),
    // likeCount: 0,
    // commentCount: 0
  }
  db.collection('customers')
    .add(newCustomer)
    .then(doc => {
      const responseCustomer = newCustomer
      responseCustomer.customerId = doc.id
      res.json(responseCustomer)
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
      return db
        .collection('customers')
        .orderBy('createdAt', 'desc')
        .where('customerId', '==', req.params.customerId)
        .get()
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

// //Comment on a customer
// exports.commentOncustomer = (req, res) => {
//   if (req.body.body.trim() === '') return res.status(400).json({ comment: 'Must not be empty.' })
//   const newComment = {
//     body: req.body.body,
//     createdAt: new Date().toISOString(),
//     customerId: req.params.customerId,
//     userHandle: req.user.handle,
//     userImage: req.user.imageUrl
//   }
//   db.doc(`/customers/${req.params.customerId}`)
//     .get()
//     .then(doc => {
//       if (!doc.exists) {
//         return res.status(404).json({ error: 'customer not found.' })
//       }
//       return doc.ref.update({ commentCount: doc.data().commentCount + 1 })
//     })
//     .then(() => {
//       return db.collection('comments').add(newComment)
//     })
//     .then(() => {
//       res.json(newComment)
//     })
//     .catch(err => {
//       console.error(err)
//       res.status(500).json({ error: err.code })
//     })
// }

// //Like customer
// exports.likecustomer = (req, res) => {
//   const likeDocument = db
//     .collection('likes')
//     .where('userHandle', '==', req.user.handle)
//     .where('customerId', '==', req.params.customerId)
//     .limit(1)

//   const customerDocument = db.doc(`/customers/${req.params.customerId}`)

//   let customerData
//   customerDocument
//     .get()
//     .then(doc => {
//       if (doc.exists) {
//         customerData = doc.data()
//         customerData.customerId = doc.id
//         return likeDocument.get()
//       } else {
//         return res.status(404).json({ error: 'customer not found' })
//       }
//     })
//     .then(data => {
//       if (data.empty) {
//         return db
//           .collection('likes')
//           .add({
//             customerId: req.params.customerId,
//             userHandle: req.user.handle
//           })
//           .then(() => {
//             customerData.likeCount++
//             return customerDocument.update({ likeCount: customerData.likeCount })
//           })
//           .then(() => {
//             return res.json(customerData)
//           })
//       } else {
//         return res.status(400).json({ error: 'customer already liked' })
//       }
//     })
//     .catch(err => {
//       console.error(err)
//       res.status(500).json({ error: err.code })
//     })
// }

// //Unlike customer
// exports.unlikecustomer = (req, res) => {
//   const likeDocument = db
//     .collection('likes')
//     .where('userHandle', '==', req.user.handle)
//     .where('customerId', '==', req.params.customerId)
//     .limit(1)

//   const customerDocument = db.doc(`/customers/${req.params.customerId}`)

//   let customerData

//   customerDocument
//     .get()
//     .then(doc => {
//       if (doc.exists) {
//         customerData = doc.data()
//         customerData.customerId = doc.id
//         return likeDocument.get()
//       } else {
//         return res.status(404).json({ error: 'customer not found' })
//       }
//     })
//     .then(data => {
//       if (data.empty) {
//         return res.status(400).json({ error: 'customer not liked' })
//       } else {
//         return db
//           .doc(`/likes/${data.docs[0].id}`)
//           .delete()
//           .then(() => {
//             customerData.likeCount--
//             return customerDocument.update({ likeCount: customerData.likeCount })
//           })
//           .then(() => {
//             res.json(customerData)
//           })
//       }
//     })
//     .catch(err => {
//       console.error(err)
//       res.status(500).json({ error: err.code })
//     })
// }

//Delete customer
exports.deleteCustomer = (req, res) => {
  const document = db.doc(`/customers/${req.params.customerId}`)
  document
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: 'Customer not found' })
      }
      if (doc.data().userHandle !== req.user.handle) {
        return res.status(403).json({ error: 'Unauthorized' })
      } else {
        return document.delete()
      }
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
    console.log('Busboy')
    admin
      .storage()
      .bucket()
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
        const customerImage_1 = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`
        return db.doc(`/customers/${req.customer.customerId}`).update({ customerImage_1 })
        // To be checked if req.customer.customerId das richtige ist... siehe Database!
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
    console.log('Busboy')
    admin
      .storage()
      .bucket()
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
        return db.doc(`/customers/${req.customer.customerId}`).update({ customerImage_2 })
        // To be checked if req.customer.customerId das richtige ist... siehe Database!
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
