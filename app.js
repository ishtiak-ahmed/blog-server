const express = require('express')
const cors = require('cors')
require('dotenv').config()
const MongoClient = require('mongodb').MongoClient;
const app = express()
app.use(cors())
app.use(express.json())
const port = 2555;





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.xzynl.mongodb.net/${process.env.DATABASE}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
    console.log(err);
    const userCollection = client.db(`${process.env.DATABASE}`).collection("users");

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

})

app.listen(process.env.PORT || port, () => {
    console.log('server running ..')
})