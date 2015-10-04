angular.module('LLLibrary')
  .controller(
    'MainController',[
      '$http',
      'ngDialog',
      function($http,ngDialog){
        var mc = this;
        mc.totalBooks = 0;
        mc.totalPeople = 0;
        mc.totalBooksLoaned = 0;
        mc.totalPeopleBooks = 0;
        mc.borrowedBooks = [];

        mc.getTotalBooks = function(){
          $http.get('/api/books/count').then(function(response){mc.totalBooks = response.data;});
        };
        mc.getTotalPeople = function(){
          $http.get('/api/books/count').then(function(response){mc.totalPeople = response.data;});
        };
        mc.getBorrowedBooks = function(){
          $http.get('/api/books/borrowed').then(function(response){
            // list of books that are borrowed
            mc.borrowedBooks = response.data;
            // how many books were there
            mc.totalBooksLoaned = mc.borrowedBooks.length;
            // Get total people who have books
            var people = [];
            for ( i in mc.borrowedBooks ){
              var person = mc.borrowedBooks[i].checkedOut[mc.borrowedBooks[i].checkedOut.length-1].who.fullname;
              if ( people.indexOf(person) == -1 ){
                people.push(person);
              };
              mc.totalPeopleBooks = people.length;
            }
          });
        };


        // Get people
        mc.getTotalBooks();
        mc.getTotalPeople();
        mc.getBorrowedBooks();
      }
  ]);
