/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *
 */

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
  /*
   * ----[EXAMPLE TEST]----
   * Each test should completely test the response of the API end-point including response status code!
   */
  test('#example Test GET /api/books', function (done) {
    chai
      .request(server)
      .get('/api/books')
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        assert.property(
          res.body[0],
          'commentcount',
          'Books in array should contain commentcount'
        );
        assert.property(
          res.body[0],
          'title',
          'Books in array should contain title'
        );
        assert.property(
          res.body[0],
          '_id',
          'Books in array should contain _id'
        );
        done();
      });
  });
  /*
   * ----[END of EXAMPLE TEST]----
   */
  let id1;

  suite('Routing tests', function () {
    suite(
      'POST /api/books with title => create book object/expect book object',
      function () {
        test('Test POST /api/books with title', function (done) {
          chai
            .request(server)
            .post('/api/books')
            .send({ title: 'test1' })
            .end((err, res) => {
              id1 = res._id;
              assert.equal(res.status, 200);
              assert.property(res.body, 'title', 'Book should contain a title');
              assert.property(res.body, '_id', 'Book should contain an _id');
              assert.strictEqual(res.body.title, 'test1');
              done();
            });
        });

        test('Test POST /api/books with no title given', function (done) {
          chai
            .request(server)
            .post('/api/books')
            .end((err, res) => {
              assert.equal(res.text, 'missing title');
              done();
            });
        });

        test('Existing title in request body', function (done) {
          chai
            .request(server)
            .post('/api/books')
            .send({ title: 'test1' })
            .end((err, res) => {
              assert.equal(res.text, 'title already exists');
              done();
            });
        });
      }
    );

    suite('GET /api/books => array of books', function () {
      test('Test GET /api/books', function (done) {
        chai
          .request(server)
          .get('/api/books')
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isArray(res.body, 'Response should be an array');
            // Books contain title, _id, and commentcount

            const firstBook = resBody[0];
            if (firstBook) {
              assert.property(
                firstBook,
                'title',
                'Book should contain a title'
              );
              assert.property(firstBook, '_id', 'Book should contain an _id');
              assert.property(
                firstBook,
                'commentcount',
                'Book should contain a commentcount'
              );
              assert.isNumber(
                firstBook.commentcount,
                'commentcount should be a number'
              );
            }
            done();
          });
      });
    });

    suite('GET /api/books/[id] => book object with [id]', function () {
      test('Test GET /api/books/[id] with id not in db', function (done) {
        chai
          .request(server)
          .get(`/api/books/id_not_int_db`)
          .end((err, res) => {
            assert.equal(res.text, 'no book exists');
            done();
          });
      });

      test('Test GET /api/books/[id] with valid id in db', function (done) {
        chai
          .request(server)
          .get(`/api/books/${id1}`)
          .end((err, res) => {
            const book = res.body;
            assert.property(book, 'title', 'Book should contain a title');
            assert.property(book, '_id', 'Book should contain an _id');
            assert.equal(
              book._id,
              id1,
              '_id from returned book not matching the queried id'
            );
            assert.property(book, 'comments', 'Book should contain comments');
            assert.isArray(book.comments, 'Comments should be an array');
            done();
          });
      });
    });

    suite(
      'POST /api/books/[id] => add comment/expect book object with id',
      function () {
        test('Test POST /api/books/[id] with comment', function (done) {
          chai
            .request(server)
            .post(`/api/books/${id1}`)
            .send({ comment: 'test comment' })
            .end((err, res) => {
              const book = res.body;
              assert.property(book, 'title', 'Book should contain a title');
              assert.property(book, '_id', 'Book should contain an _id');
              assert.equal(
                book._id,
                id1,
                '_id from returned book not matching the queried id'
              );
              assert.property(book, 'comments', 'Book should contain comments');
              assert.isArray(book.comments, 'Comments should be an array');
              assert.equal(
                book.comments[0],
                'test comment',
                'Comments should include test comment submitted'
              );
              done();
            });
        });
      }
    );
  });
});
