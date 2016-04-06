(function () {
  'use strict';

  angular
    .module('automata')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    menuService.addMenuItem('topbar', {
      title: 'Automata',
      state: 'automata',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'automata', {
      title: 'List Automata',
      state: 'automata.list'
    });

    // Add the dropdown create item
    menuService.addSubMenuItem('topbar', 'automata', {
      title: 'Create New Turing Machine',
      state: 'automata.create-tm',
      roles: ['user']
    });
    menuService.addSubMenuItem('topbar', 'automata', {
      title: 'Create New Finite State Automaton',
      state: 'automata.create-fsa',
      roles: ['user']
    });
    menuService.addSubMenuItem('topbar', 'automata', {
      title: 'Create New Pushdown Automaton',
      state: 'automata.create-pda',
      roles: ['user']
    });
  }
}());
