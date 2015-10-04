var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var request = require('request');
var LANG = require('../public/javascripts/lang.js');
var Person = require('../models/person');
var Book = require('../models/book');



function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated())
    return next();
  else
    // Return error content: res.jsonp(...) or redirect: res.redirect('/login')
    res.json({'Error':'You are not Authorized'})
}




/* Welcome GET. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});



var error = {message: 'Error'};
var success = {message: ''};






/*------------------------------------------------------------------------------

  Requires Authentication

*/

/*------------------------------------------------------------------------------
  People
*/
router.get('/people', ensureAuthenticated, function(req, res, next) {
  Person.find({}).then(function(persons){res.json(persons);});
});

router.post('/people', ensureAuthenticated, function(req, res, next) {
    /**/
  var person = new Person({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    phone: req.body.phone,
    email: req.body.email,
    bookcount: 0
  })
  person.save(function(err){
    if ( err ){
      return res.json(error);
    }
    res.json(success);
  });
  /**/
});

/*------------------------------------------------------------------------------
  Books
*/
// Lookup book details by isbn number
router.get('/books/isbnlookup/:isbn', ensureAuthenticated, function(req, res, next) {
  var book = {
    title: '',
    authors: [],
    publisher: '',
    published: '',
    format: '',
    cover: {}
  };
  // Get most of the book details
  //https://www.googleapis.com/books/v1/volumes?q=isbn:0452285801
  request('https://www.googleapis.com/books/v1/volumes?q=isbn:'+req.params.isbn, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var json = JSON.parse(response.body);
      if(json.totalItems > 0){
        var found = json.items[0];
        var volumeInfo = getProperty('volumeInfo',found);
        book.title = getProperty('title',volumeInfo);
        var authors = getProperty('authors',volumeInfo);
        console.log(authors);
        for ( i in authors ){
          book.authors.push({
            name: authors[i]
          });
        }
        console.log(book.authors);
        book.publisher = getProperty('publisher',volumeInfo);
        book.published = getProperty('publishedDate',volumeInfo);
        book.cover = getProperty('imageLinks',volumeInfo);
        res.json(book);
      }else{
        // No books, send empty
        book.publisher = response.statusCode
        res.json(book);
      }
    }else{
      res.json(error);
    }
  });
});

// Get all books
router.get('/books', ensureAuthenticated, function(req, res, next) {
  Book.find({}).then(function(books){res.json(books);});
});
// Get all books that are borrowed
router.get('/books/borrowed', ensureAuthenticated, function(req, res, next) {
  Book.find({status: LANG.BOOK.STATUS.LOANED})
    .populate('checkedOut.who')
    .exec(function(error, book) {
        res.json(book);
    })
});
// Get how many books we have
router.get('/books/count', ensureAuthenticated, function(req, res, next) {
  Book.count({}).then(function(books){res.json(books);});
});


// Add a book
router.post('/books', ensureAuthenticated, function(req, res, next) {
    /**/
  var book = new Book({
    isbn: req.body.isbn,
    authors: req.body.authors,
    title: req.body.title,
    publisher: req.body.publisher,
    published: req.body.published,
    format: req.body.format,
    notes: [],
    description: req.body.description,
    status: req.body.status,
    cover: req.body.cover
  })
  if ( req.body.notes != ''){
    book.notes.push(req.body.notes);
  }
  book.save(function(err){
    if ( err ){
      return res.json(error);
    }
    res.json(success);
  });
  /**/
});

// get a specific book
router.get('/book/:id', ensureAuthenticated, function(req, res, next) {
  Book.findById(req.params.id)
    .populate('checkedOut.who')
    .exec(function(error, book) {
        res.json(book);
    })
  //Book.findById(req.params.id).then(function(book){
  //  res.json(book);
  //});
});


// Add notes to a book
router.post('/addnotes', ensureAuthenticated, function(req, res, next) {
  Book.findById(req.body.book._id).then(function(book){
    if (req.body.notes != ''){
      book.notes.push({
        text: req.body.notes,
        date: Date.now()
      });
      book.save(function(err){
        return res.json(success);
      });
    }else{
      res.json(success);
    }
  });
});

// Check a book out
router.post('/checkout', ensureAuthenticated, function(req, res, next) {
  var now = Date.now();
  Book.findById(req.body.book).then(function(book){
    book.status = LANG.BOOK.STATUS.LOANED;
    // add Person to book
    book.checkedOut.push({
      who:req.body.person._id,
      when: now
    });

    // increment checkout CheckOut
    book.lent += 1;
    // Save
    book.save(function(err){
      // add book to person
      Person.findById(req.body.person._id).then(function(person){
        // increment book count
        person.bookcount += 1;

        // Add book
        person.books.push({
          when: now,
          book: req.body.book
        });
        person.save(function(err){
          res.json(success);
        })
      });

    });
  });
});


// Check a book in
router.post('/checkin', ensureAuthenticated, function(req, res, next) {
  var now = Date.now();
  Book.findById(req.body.book).then(function(book){
    book.status = LANG.BOOK.STATUS.AVAILABLE;
    book.checkedOut[book.checkedOut.length-1].returned = Date.now();


    if ( req.body.notes != ''){
      book.notes.push({
        text:req.body.notes,
        date: now
      });
    }
    book.save(function(err){
      Person.findById(book.checkedOut[book.checkedOut.length-1].who).then(function(person){
        // increment book count
        person.bookcount -= 1;

        // look for book and add return date
        for ( i in person.books ){
          if (person.books[i].book == book._id ){
            person.books[i].returned = now;
          }
        }

        person.save(function(err){
          res.json(success);
        })
      });
    });
  });
});










function getProperty(prop,obj){
  if ( prop in obj ){
    return obj[prop];
  } else {
    return '';
  }
};








module.exports = router;
