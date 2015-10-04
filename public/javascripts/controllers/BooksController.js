angular.module('LLLibrary')
  .controller(
    'BooksController',[
      '$http',
      'ngDialog',
      'SweetAlert',
      'sharedProperties',
      function($http,ngDialog,SweetAlert,sharedProperties){
        var bc = this;
        bc.books = [];
        sharedProperties.set('book',{});
        bc.addBook = function () {
          ngDialog.open({
            template: '/pages/modals/addbook',
            controller: 'AddBookController',
            controllerAs: 'abc'
          }).closePromise.then(function (data) {
            // update books
            bc.getBooks();
          });
        };

        bc.changeStatus = function (bk) {
          sharedProperties.set('book',bk);
          switch ( bk.status ) {
            case BOOK.STATUS.AVAILABLE:
              bc.checkoutBook();
              break;
            case BOOK.STATUS.LOANED:
              bc.checkinBook();
              break;
            case BOOK.STATUS.DESTROYED:
              break;
            case BOOK.STATUS.LOST:
              break;
          };
        };
        bc.checkoutBook = function(){
          ngDialog.open({
            template: '/pages/modals/checkout',
            controller: 'CheckOutController',
            controllerAs: 'cobc'
          }).closePromise.then(function (data) {
            // update books
            bc.getBooks();
          });
        };
        bc.checkinBook = function(){
          ngDialog.open({
            template: '/pages/modals/checkin',
            controller: 'CheckInController',
            controllerAs: 'cibc'
          }).closePromise.then(function (data) {
            // update books
            bc.getBooks();
          });
        };
        bc.showNotes = function(bk){
          sharedProperties.set('book',bk);
          ngDialog.open({
            template: '/pages/modals/notes',
            controller: 'ShowNotesController',
            className: 'ngdialog-theme-default custom-width',
            controllerAs: 'snc'
          }).closePromise.then(function (data) {
            // update books
            bc.getBooks();
          });
        };

        bc.getBooks = function(){
          $http.get('/api/books').then(function(response){bc.books = response.data});
        };

        // Get people
        bc.getBooks();
      }
  ])
  .controller(
    'AddBookController',[
    '$http',
    '$scope',
    'SweetAlert',
    function($http,$scope,SweetAlert){
      var abc = this;
      abc.manual = true;
      abc.book = {
        isbn: '',
        authors: [{name:''},{name:''}],
        publisher: '',
        published: '',
        title: '',
        notes: '',
        description: '',
        status: BOOK.STATUS.AVAILABLE,
        cover: {}
      };
      abc.submit = function(){
        $http.post('/api/books',abc.book).then(function(response){
            $scope.closeThisDialog();
        });
      }
      abc.addAuthor = function(){
        abc.book.authors.push({name:''});
      };
      abc.isbnlookup = function(){
        $http.get('/api/books/isbnlookup/' + abc.book.isbn).then(function(response){
          if (response.data.title != ''){
            abc.book.title = response.data.title;
            abc.book.publisher = response.data.publisher;
            abc.book.published = response.data.published;
            abc.book.authors = response.data.authors;
            abc.book.description = response.data.description;
            abc.book.format = response.data.format;
            abc.book.cover = response.data.cover;
            abc.manual = false;
          }else{
            SweetAlert.swal("No Book Found", "You will have to manually input the info", "error");
          }
        });
      }
    }
  ])
  .controller(
    'CheckOutController',[
    '$http',
    '$scope',
    'SweetAlert',
    'sharedProperties',
    function($http,$scope,SweetAlert,sharedProperties){
      var cobc = this;
      cobc.book = '';
      cobc.people = [];
      cobc.selected = {};
      cobc.submit = function(){
        var x = {
          person: cobc.selected,
          book: sharedProperties.get('book')._id
        };
        $http.post('/api/checkout',x).then(function(response){
            $scope.closeThisDialog();
        });
      }
      cobc.getPeople = function(){
        $http.get('/api/people').then(function(response){cobc.people = response.data;});
      }
      cobc.getPeople();
    }
  ])
  .controller(
    'CheckInController',[
    '$http',
    '$scope',
    'sharedProperties',
    function($http,$scope,sharedProperties){
      var cibc = this;
      cibc.notes = '';
      cibc.submit = function(){
        var x = {
          notes: cibc.notes,
          book: sharedProperties.get('book')._id
        };
        $http.post('/api/checkin',x).then(function(response){
            $scope.closeThisDialog();
        });
      }
    }
  ])
  .controller(
    'ShowNotesController',[
    '$http',
    '$scope',
    'sharedProperties',
    function($http,$scope,sharedProperties){
      var snc = this;
      snc.notes = '';
      snc.book = sharedProperties.get('book');
      snc.submit = function(){
        var x = {
          notes: snc.notes,
          book: sharedProperties.get('book')
        };
        $http.post('/api/addnotes',x).then(function(response){
          $http.get('/api/books/' + snc.book._id).then(function(response){
              snc.book = response.data
          });
        });
      }
    }
  ]);
