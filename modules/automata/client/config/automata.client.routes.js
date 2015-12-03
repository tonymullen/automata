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
/*
      .state('automata.create', {
        url: '/create',
        templateUrl: 'modules/automata/client/views/create-automaton.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      */
      .state('automata.view', {
        url: '/:automatonId',
        templateUrl: 'modules/automata/client/views/view-automaton.client.view.html'
      })
      /*
      .state('automata.edit', {
        url: '/:automatonId/edit',
        templateUrl: 'modules/automata/client/views/edit-utomaton.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      */
      ;
  }
]);
