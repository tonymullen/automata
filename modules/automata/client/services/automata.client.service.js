(function () {
  'use strict';

  angular
    .module('automata.services')
    .factory('AutomataService', AutomataService);

  AutomataService.$inject = ['$resource'];

  function AutomataService($resource) {
    return $resource('api/automata/:automatonId', {
      automatonId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
