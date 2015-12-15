'use strict';

// Setting up route
angular.module('automata').config(['$stateProvider',
  function ($stateProvider) {
    // Articles state routing
    $stateProvider
      .state('automata', {
        abstract: true,
        url: '/automata',
        template: '<ui-view/>'
      })
      .state('automata.list', {
        url: '',
        templateUrl: 'modules/automata/client/views/list-automata.client.view.html'
      })
      .state('automata.create-tm', {
        url: '/create-tm',
        templateUrl: 'modules/automata/client/views/create-automaton.client.view.html',
        data: {
          roles: ['user', 'admin'],
          type: 'tm'
        }
      })
      .state('automata.create-fsa', {
        url: '/create-fsa',
        templateUrl: 'modules/automata/client/views/create-automaton.client.view.html',
        data: {
          roles: ['user', 'admin'],
          type: 'fsa'
        }
      })
      .state('automata.create-pda', {
        url: '/create-pda',
        templateUrl: 'modules/automata/client/views/create-automaton.client.view.html',
        data: {
          roles: ['user', 'admin'],
          type: 'pda'
        }
      })
      .state('automata.view', {
        url: '/:automatonId',
        templateUrl: 'modules/automata/client/views/view-automaton.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      });
  }
]);
