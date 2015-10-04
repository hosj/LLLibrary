var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BookSchema = new Schema({
  isbn: String,         // ISBN number
  authors: Array,       // Name of the Authors
  title: String,        // Title of the book
  publisher: String,    // who published
  published: String,    // what year
  format: String,       // Hardback, Softback, unbound
  notes: Array,        // Make notes like if there was a rip, water damage etc..
  status: String,        // Checked in, Checked out, Destroyed, Lost
  cover: Object,
  description: String,
  lent: {
    type: Number,
    default: 0 },    // How many times the book has been lent
  checkedOut: [{
    when: Date,
    returned: Date,
    who: {
      type: Schema.Types.ObjectId,
      ref: 'Person'
    }

  }]
});

//  0452285801
//  9780071598583
module.exports = mongoose.model('Book', BookSchema,'Book');
