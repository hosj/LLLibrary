angular.module('LLLibrary')
  .controller(
    'BookController',[
      '$http',
      'ngDialog',
      'SweetAlert',
      'sharedProperties',
      '$routeParams',
      function($http,ngDialog,SweetAlert,sharedProperties,$routeParams){
        var bc = this;
        bc.book = [];
        sharedProperties.set('book',{});
        bc.id = $routeParams.id

        bc.changeStatus = function () {
          sharedProperties.set('book',bc.book);
          switch ( bc.book.status ) {
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
            bc.getBook();
          });
        };
        bc.checkinBook = function(){
          ngDialog.open({
            template: '/pages/modals/checkin',
            controller: 'CheckInController',
            controllerAs: 'cibc'
          }).closePromise.then(function (data) {
            // update books
            bc.getBook();
          });
        };
        bc.showNotes = function(){
          sharedProperties.set('book',bc.book);
          ngDialog.open({
            template: '/pages/modals/notes',
            controller: 'ShowNotesController',
            className: 'ngdialog-theme-default custom-width',
            controllerAs: 'snc'
          }).closePromise.then(function (data) {
            // update books
            bc.getBook();
          });
        };

        bc.getBook = function(){
          $http.get('/api/book/' + bc.id).then(function(response){bc.book = response.data});
        };

        // Get people
        bc.getBook();
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
          book: sharedProperties.get('book')
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
          book: sharedProperties.get('book')
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
          book: snc.book
        };
        $http.post('/api/addnotes',x).then(function(response){
          $scope.closeThisDialog();
        });
      }
    }
  ]);
