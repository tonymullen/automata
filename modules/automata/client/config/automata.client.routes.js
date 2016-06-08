(function () {
  'use strict';

  angular
    .module('automata.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('automata', {
        abstract: true,
        url: '/automata',
        template: '<ui-view/>'
      })
      .state('automata.list', {
        url: '',
        templateUrl: 'modules/automata/client/views/list-automata.client.view.html',
        controller: 'AutomataListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Automata List'
        }
      })
      .state('automata.create-tm', {
        url: '/create-tm',
        templateUrl: 'modules/automata/client/views/view-automaton.client.view.html',
        controller: 'AutomataController',
        controllerAs: 'vm',
        resolve: {
          automatonResolve: newAutomaton
        },
        data: {
//          roles: ['user', 'admin'],
          type: 'tm',
          pageTitle: 'Create TM'
        }
      })
      .state('automata.create-fsa', {
        url: '/create-fsa',
        templateUrl: 'modules/automata/client/views/view-automaton.client.view.html',
        controller: 'AutomataController',
        controllerAs: 'vm',
        resolve: {
          automatonResolve: newAutomaton
        },
        data: {
//          roles: ['user', 'admin'],
          type: 'fsa',
          pageTitle: 'Create FSA'
        }
      })
      .state('automata.create-pda', {
        url: '/create-pda',
        templateUrl: 'modules/automata/client/views/view-automaton.client.view.html',
        controller: 'AutomataController',
        controllerAs: 'vm',
        resolve: {
          automatonResolve: newAutomaton
        },
        data: {
//          roles: ['user', 'admin'],
          type: 'pda',
          pageTitle: 'Create PDA'
        }
      })
      .state('automata.view', {
        url: '/:automatonId',
        templateUrl: 'modules/automata/client/views/view-automaton.client.view.html',
        controller: 'AutomataController',
        controllerAs: 'vm',
        resolve: {
          automatonResolve: getAutomaton
        },
        data: {
//          roles: ['user', 'admin'],
          pageTitle: 'View Automaton'
        }
      });
  }

  getAutomaton.$inject = ['$stateParams', 'AutomataService'];

  function getAutomaton($stateParams, AutomataService) {
    return AutomataService.get({
      automatonId: $stateParams.automatonId
    }).$promise;
  }

  newAutomaton.$inject = ['$state', 'AutomataService'];

  function newAutomaton($state, AutomataService) {
    // return new AutomataService();
    var empty_tape = [];
    for (var i = 0; i < 50; i++) {
      empty_tape.push(' ');
    }
    return new AutomataService({
      alphabet: ['0', '1', 'A', 'B', 'C', '_'],
      eles: {
        nodes: [
          { data: { id: 'start' }, classes: 'startmarker' },
          { data: { id: '0', label: '0', start: true }, classes: 'enode', position: { x: 0, y: 0 } }],
        edges: []
      },
      tape: {
        position: 0,
        contents: empty_tape
      },
      determ: true
    });
  }
}());
