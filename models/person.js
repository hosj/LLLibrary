var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PersonSchema = new Schema({
  firstname: String,
  lastname: String,
  fullname: String,
  email: String,
  phone: String,
  bookcount: Number,  // How many books currently checked out
  books: [
    {
      when:Date,
      returned: Date,
      book:{
        type: Schema.Types.ObjectId,
        ref: 'Book'
      }
    }
  ]
});

PersonSchema.pre('save', function(next) {
  this.fullname = this.firstname + ' ' + this.lastname;
  next();
});


module.exports = mongoose.model('Person', PersonSchema,'Person');
