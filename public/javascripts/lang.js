var lang = 'English';



// Book
var BOOK = {
  STATUS: {
    AVAILABLE: 'Available',
    LOANED: 'On Loan',
    LOST: 'Lost',
    DESTROYED: 'Destroyed'

  }

};



if ( (typeof module) == "object" ){
  module.exports.BOOK = BOOK;
}
