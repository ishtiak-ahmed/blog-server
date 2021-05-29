const express = require('express')
const cors = require('cors')
require('dotenv').config()
const fs = require('fs')
const fileupload = require('express-fileupload')
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID


const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static('serviceimg'))
app.use(fileupload())
const port = 2555;





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.xzynl.mongodb.net/${process.env.DATABASE}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
    console.log(err);
    const userCollection = client.db(`${process.env.DATABASE}`).collection("users");
    const blogCollection = client.db(`${process.env.DATABASE}`).collection("blogs");
    const commentCollection = client.db(`${process.env.DATABASE}`).collection("comments");

    app.get('/', (req, res) => {
        res.send('Hello World!')
    })

    // Check Existing User
    app.post('/users', (req, res) => {
        const email = req.body.email;
        userCollection.findOne({ email: email }, (err, doc) => {
            if (doc) {
                res.send(doc)
            } else {
                res.send(false)
            }
        })
    })

    // Create New User
    app.post('/createUser', (req, res) => {
        userCollection.insertOne(req.body)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    // Get Public Profile Info
    app.get('/profile/:userName', (req, res) => {
        const userName = req.params.userName;
        userCollection.findOne({ userName: userName }, (err, doc) => {
            if (doc) {
                const publicProfile = {
                    fullName: doc.fullName,
                    photo: doc.photo,
                    role: doc.role
                }
                res.send(publicProfile)
            } else {
                res.send(false)
            }
        })
    })

    // Add Blog Post
    app.post('/addBlog', (req, res) => {
        const blog = req.body
        blogCollection.insertOne(blog)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    // Get Blog Post
    app.get('/getBlogs', (req, res) => {
        blogCollection.find()
            .toArray((err, docs) => res.send(docs))
    })
    // Get Blog Post
    app.get('/blog/:id', (req, res) => {
        blogCollection.findOne({ _id: ObjectID(req.params.id) }, (err, doc) => {
            if (doc) {
                res.send(doc)
            } else {
                res.send(false)
            }
        })
    })
    // Get Comment
    app.get('/getComment/:id', (req, res) => {
        commentCollection.findOne(({ _id: req.params.id }), (err, doc) => {
            if (doc) {
                res.send(doc)
            } else {
                res.send(false)
            }
        })
    })

    // Update Comment Reply reference
    app.patch('/updateParent/:id', (req, res) => {
        const reply = req.body.reply
        commentCollection.updateOne({ _id: req.params.id },
            {
                $set: { 'reply': reply }
            }
        ).then(result => {
            res.send(result.modifiedCount > 0)
        })
    })

    // Add Comment Reply
    app.post('/addComment', (req, res) => {
        const comment = req.body
        commentCollection.insertOne(comment)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
        res.send(true)
    })

})

app.listen(process.env.PORT || port, () => {
    console.log('server running ..')
})