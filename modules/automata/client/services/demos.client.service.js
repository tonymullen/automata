(function () {
  'use strict';

  angular
    .module('automata.services')
    .factory('DemoService', DemoService);

  DemoService.$inject = ['$resource'];

  function DemoService($resource) {
    return $resource('api/demos/:automatonId', {
      automatonId: '@_id'
    });
  }
}());
