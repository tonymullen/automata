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
          automatonResolve: newTM
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
          automatonResolve: newFSA
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
          automatonResolve: newPDA
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

  newFSA.$inject = ['$state', 'AutomataService'];
  function newFSA($state, AutomataService) {
    return newAutomaton($state, AutomataService, 'fsa');
  }
  newPDA.$inject = ['$state', 'AutomataService'];
  function newPDA($state, AutomataService) {
    return newAutomaton($state, AutomataService, 'pda');
  }
  newTM.$inject = ['$state', 'AutomataService'];
  function newTM($state, AutomataService) {
    return newAutomaton($state, AutomataService, 'tm');
  }
  // newAutomaton.$inject = ['$state', 'AutomataService'];

  function newAutomaton($state, AutomataService, machine) {
    // return new AutomataService();

    var empty_stack = [];
    // console.log($routeParams);

    if (machine === 'pda') {
      for (var j = 0; j < 20; j++) {
        empty_stack.push(' ');
      }
    }

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
      stack: empty_stack,
      determ: true
    });
  }
}());
