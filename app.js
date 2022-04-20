const express = require('express');
const app = express();
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const username = process.env.MONGODB_USERNAME;
const password = process.env.MONGODB_PASSWORD;
const database = process.env.MONGODB_DATABASE_NAME;
const collection = process.env.MONGODB_COLLECTION_NAME;


//needed to read the json in the body of the post request.  
app.use(express.json());

let db;
//make sure we are connected to the mongoDB database before we listen
MongoClient.connect(`mongodb+srv://${username}:${password}@cluster0.t7dop.mongodb.net/${database}?retryWrites=true&w=majority`)
    .then(client => {
        //if the connection is a success, we can start listening for requests and assign the database 'myFirstDatabase' to db.   
        app.listen(3000, () => {
            console.log('listening on port 3000');
            db = client.db();
        })
    })
    .catch(err => {
        console.log(err);
    })

//get all documents 
app.get(`/${collection}`, (req, res) => {
    let books = [];

    db.collection('books')
        .find()
        .sort({author: 1}) //sort by author
        .forEach(book => books.push(book))
        .then(() => {
            res.json(books);
        })
        .catch(() => {
            res.status(500).json({error: 'Could not fetch the documents'})
        })
})

//get 1 document
app.get(`/${collection}/:id`, (req, res) => {
    if(ObjectId.isValid(req.params.id)){
        db.collection('books')
            .findOne({_id: ObjectId(req.params.id)})
            .then(book => {
                res.status(200).json(book);
            })
            .catch(err => {
                res.status(500).json({error: 'Could not get the requested document'})
            })
    }else{
        res.status(500).json({error: 'This is not a valid id'})
    }
})

//add a document
app.post(`/${collection}`, (req, res) => {
    db.collection('books')
        .insertOne(req.body)
        .then(result => {
            //201 means we were successful in adding a resource
            res.status(201).json(result)
        })
        .catch(() => {
            res.status(500).json({error: 'could not add the document'})
        })
})

//delete a dcocument
app.delete(`/${collection}/:id`, (req, res) => {
    if(ObjectId.isValid(req.params.id)){
        db.collection('books')
            .deleteOne({_id: ObjectId(req.params.id)})
            .then(result => {
                res.status(200).json(result);
            })
            .catch(() => {
                res.status(500).json({error: 'could not delete document'})
            })
    }else{
        res.status(500).json({error: 'This is not a valid id'})
    }
})

//update a document
app.patch(`/${collection}/:id`, (req, res) => {
    if(ObjectId.isValid(req.params.id)){
        db.collection('books')
            .updateOne({_id: ObjectId(req.params.id)}, {$set: req.body})
            .then(result => {
                res.status(200).json(result);
            })
            .catch(() => {
                res.status(500).json({error: 'could not update document'})
            })
    }else{
        res.status(500).json({error: 'This is not a valid id'})
    }
})