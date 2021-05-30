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
        userCollection.findOne({ _id: userName }, (err, doc) => {
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

    // Add Comment Reply reference
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
    // Add Comment Reply reference to blog
    app.patch('/updateBlogParent/:id', (req, res) => {
        const reply = req.body.reply
        blogCollection.updateOne({ _id: ObjectID(req.params.id) },
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

    //  Blog Up Vote
    app.patch('/updateVote/:id', (req, res) => {
        blogCollection.updateOne({ _id: ObjectID(req.params.id) }, {
            $set: req.body
        }).then(result => {
            res.send(result.modifiedCount > 0)
        })
    })



    // Update
    app.patch('/updateBlog/:id', (req, res) => {
        const title = req.body.title;
        const tag = req.body.tag;
        const content = req.body.content;
        blogCollection.updateOne({ _id: ObjectID(req.params.id) }, {
            $set: { title: title, tag: tag, content: content }
        }).then(result => {
            res.send(result.modifiedCount > 0)
        })
    })
    // Update

    // Delete Blog
    app.delete('/deleteBlog/:id', (req, res) => {
        blogCollection.deleteOne({ _id: ObjectID(req.params.id) })
            .then(result => {
                res.send(result.deletedCount > 0);
            })
    })
    // Delete Blog

    // Update Blog Reply Status
    app.patch('/updateReplyStatus/:id', (req, res) => {
        blogCollection.updateOne({ _id: ObjectID(req.params.id) }, {
            $set: { replyStatus: req.body.replyStatus }
        }).then(result => {
            res.send(result.modifiedCount > 0)
        })
    })
    // Update Blog Reply Status

    // Delete Comment
    app.delete('/deleteComment/:id', (req, res) => {
        commentCollection.deleteOne({ _id: req.params.id })
            .then(result => {
                res.send(result.deletedCount > 0)
            })
    })

    // Update Comment
    app.patch('/updateComment/:id', (req, res) => {
        commentCollection.updateOne({ _id: req.params.id }, {
            $set: { comment: req.body.comment }
        })
            .then(result => {
                res.send(result.modifiedCount > 0)
                console.log(result.modifiedCount)
            })
    })

    // toggle Feature Comment 
    app.patch('/toggleFeatureComment/:id', (req, res) => {
        commentCollection.updateOne({ _id: req.params.id }, {
            $set: req.body
        })
            .then(result => {
                res.send(result.modifiedCount > 0)
                console.log(result.modifiedCount)
            })
    })

    // Update Spam Count
    app.patch(`/spamCount/:id`, (req, res) => {
        userCollection.findOne({ _id: req.params.id }, (err, doc) => {
            if (doc) {
                if (req.body.count) {
                    const newCount = { spamcount: doc.spamcount + 1 }
                    userCollection.updateOne({ _id: req.params.id }, {
                        $set: newCount
                    }).then(result => {
                        res.send(result.modifiedCount > 0)
                    })
                }
                if (!req.body.count) {
                    const newCount = { spamcount: doc.spamcount - 1 }
                    userCollection.updateOne({ _id: req.params.id }, {
                        $set: newCount
                    }).then(result => {
                        res.send(result.modifiedCount > 0)
                    })
                }
            } else {
                console.log(err)
            }
        })
    })

})

app.listen(process.env.PORT || port, () => {
    console.log('server running ..')
})