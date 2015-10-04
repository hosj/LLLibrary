angular.module('LLLibrary')
  .controller(
    'PeopleController',[
      '$http',
      'ngDialog',
      function($http,ngDialog){
        var pc = this;
        pc.people = [];

        pc.addPerson = function(){
          ngDialog.open({
            template: '/pages/modals/addperson',
            controller: 'AddPersonController',
            controllerAs: 'apc'
          }).closePromise.then(function (data) {
            // update people
            pc.getPeople();
          });
        };

        pc.getPeople = function(){
          $http.get('/api/people').then(function(response){pc.people = response.data;});
        };

        // Get people
        pc.getPeople();
      }
  ])
  .controller(
    'AddPersonController',[
    '$http',
    '$scope',
    function($http,$scope){
      var apc = this;
      apc.person = {
        firstname: '',
        lastname: '',
        email: '',
        phone: ''
      };
      apc.submit = function(){
        $http.post('/api/people',apc.person).then(function(response){
            $scope.closeThisDialog();
        });
      }
    }
  ]);
