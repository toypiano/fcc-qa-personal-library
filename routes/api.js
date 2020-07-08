/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

'use strict';

const expect = require('chai').expect;
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {
  app
    .route('/api/books')
    .get(function (req, res) {
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err, client) => {
        const db = client.db('project');
        const books = db.collection('books');

        books.find().toArray((err, docs) => {
          //response will be array of book objects
          //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]

          const books = docs.map((book) => ({
            ...book,
            commentcount: book.comments.length,
          }));
          return res.json(books);
        });
      });
    })
    .post(function (req, res) {
      const title = req.body.title;
      if (!title) {
        return res.send('missing title');
      }
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err, client) => {
        const db = client.db('project');
        const books = db.collection('books');

        books.findOne({ title }, (err, doc) => {
          if (doc) {
            return res.send('Title already exists');
          }
          // http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#insertOne
          books.insertOne(
            {
              title,
              comments: [],
            },
            (err, result) => {
              //response will contain new book object including at least _id and title
              return res.json(result.ops[0]);
            }
          );
        });
      });
    })

    .delete(function (req, res) {
      //if successful response will be 'complete delete successful'
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err, client) => {
        const db = client.db('project');
        const books = db.collection('books');
        books.deleteMany({}, (err, result) => {
          return res.send('complete delete successful');
        });
      });
    });

  app
    .route('/api/books/:id')
    .get(function (req, res) {
      const bookid = req.params.id;

      MongoClient.connect(MONGODB_CONNECTION_STRING, (err, client) => {
        const db = client.db('project');
        const books = db.collection('books');

        books.findOne({ _id: new ObjectId(bookid) }, (err, result) => {
          //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
          if (!result) {
            return res.send('no book exists');
          }
          return res.json(result);
        });
      });
    })

    .post(function (req, res) {
      const bookid = req.params.id;
      const comment = req.body.comment;
      if (!comment) {
        return res.send('missing comment');
      }

      MongoClient.connect(MONGODB_CONNECTION_STRING, (err, client) => {
        const db = client.db('project');
        const books = db.collection('books');

        books.findOneAndUpdate(
          { _id: new ObjectId(bookid) },
          {
            $push: { comments: comment },
          },
          {
            returnOriginal: false,
          },
          (err, result) => {
            //json res format same as .get
            return res.json(result.value);
          }
        );
      });
    })
    .delete(function (req, res) {
      const bookid = req.params.id;

      MongoClient.connect(MONGODB_CONNECTION_STRING, (err, client) => {
        const db = client.db('project');
        const books = db.collection('books');

        books.findOneAndDelete({ _id: new ObjectId(bookid) }, (err, result) => {
          if (err) {
            return res.send('delete failed');
          }
          //if successful response will be 'delete successful'
          return res.send('delete successful');
        });
      });
    });
};
