(function () {
  'use strict';

  angular
    .module('automata')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    menuService.addMenuItem('topbar', {
      title: 'Create',
      state: 'automata',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    /*
    menuService.addSubMenuItem('topbar', 'automata', {
      title: 'List Automata',
      state: 'automata.list'
    });
    */

    // Add the dropdown create item
    menuService.addSubMenuItem('topbar', 'automata', {
      title: 'New Turing Machine',
      state: 'automata.create-tm',
      roles: ['*']
    });
    menuService.addSubMenuItem('topbar', 'automata', {
      title: 'New Finite State Automaton',
      state: 'automata.create-fsa',
      roles: ['*']
    });
    menuService.addSubMenuItem('topbar', 'automata', {
      title: 'New Pushdown Automaton',
      state: 'automata.create-pda',
      roles: ['*']
    });
  }
}());
