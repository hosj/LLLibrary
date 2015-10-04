angular.module('LLLibrary',[
    'ngRoute',
    'ngDialog',
    'oitozero.ngSweetAlert',
    'flow',
    'angularUtils.directives.dirPagination',
    'angularMoment'
  ])
  .config(function($routeProvider){
    $routeProvider
      .when('/',{
        templateUrl: '/pages/main/index',
        controller: 'MainController',
        controllerAs: 'mc'
      })
      .when('/people',{
        templateUrl: '/pages/people/index',
        controller: 'PeopleController',
        controllerAs: 'pc'
      })
      .when('/books',{
        templateUrl: '/pages/books/index',
        controller: 'BooksController',
        controllerAs: 'bc'
      })
      .when('/book/:id',{
        templateUrl: '/pages/book/index',
        controller: 'BookController',
        controllerAs: 'bc'
      })
      .otherwise({
        redirectTo: '/'
      });
  }).filter('tel', function () {
    return function (tel) {
        if (!tel) { return ''; }

        var value = tel.toString().trim().replace(/^\+/, '');

        if (value.match(/[^0-9]/)) {
            return tel;
        }

        var country, city, number;

        switch (value.length) {
            case 10: // +1PPP####### -> C (PPP) ###-####
                country = 1;
                city = value.slice(0, 3);
                number = value.slice(3);
                break;

            case 11: // +CPPP####### -> CCC (PP) ###-####
                country = value[0];
                city = value.slice(1, 4);
                number = value.slice(4);
                break;

            case 12: // +CCCPP####### -> CCC (PP) ###-####
                country = value.slice(0, 3);
                city = value.slice(3, 5);
                number = value.slice(5);
                break;

            default:
                return tel;
        }

        if (country == 1) {
            country = "";
        }

        number = number.slice(0, 3) + '-' + number.slice(3);

        return (country + " (" + city + ") " + number).trim();
    };
}).directive('phoneInput', function($filter, $browser) {
    return {
        require: 'ngModel',
        link: function($scope, $element, $attrs, ngModelCtrl) {
            var listener = function() {
                var value = $element.val().replace(/[^0-9]/g, '');
                $element.val($filter('tel')(value, false));
            };

            // This runs when we update the text field
            ngModelCtrl.$parsers.push(function(viewValue) {
                return viewValue.replace(/[^0-9]/g, '').slice(0,10);
            });

            // This runs when the model gets updated on the scope directly and keeps our view in sync
            ngModelCtrl.$render = function() {
                $element.val($filter('tel')(ngModelCtrl.$viewValue, false));
            };

            $element.bind('change', listener);
            $element.bind('keydown', function(event) {
                var key = event.keyCode;
                // If the keys include the CTRL, SHIFT, ALT, or META keys, or the arrow keys, do nothing.
                // This lets us support copy and paste too
                if (key == 91 || (15 < key && key < 19) || (37 <= key && key <= 40)){
                    return;
                }
                $browser.defer(listener); // Have to do this or changes don't get picked up properly
            });

            $element.bind('paste cut', function() {
                $browser.defer(listener);
            });
        }

    };
})
.config(['flowFactoryProvider', function (flowFactoryProvider) {
    flowFactoryProvider.defaults = {
        target: '/upload',
        permanentErrors:[404, 500, 501]
    };
    // You can also set default events:
    flowFactoryProvider.on('catchAll', function (event) {

    });
    // Can be used with different implementations of Flow.js
    // flowFactoryProvider.factory = fustyFlowFactory;
}])
.service('sharedProperties', function () {
    var properties = {};

    return {
        get: function (prop) {
            return properties[prop];
        },
        set: function(prop, value) {
            properties[prop] = value;
        }
    };
});
