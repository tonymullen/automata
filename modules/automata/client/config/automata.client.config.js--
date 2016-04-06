'use strict';

// Configuring the Automata module
angular.module('automata').run(['Menus',
  function (Menus) {
    // Add the automata dropdown item
    Menus.addMenuItem('topbar', {
      title: 'Automata',
      state: 'automata',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'automata', {
      title: 'List Automata',
      state: 'automata.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'automata', {
      title: 'Create New Turing Machine',
      state: 'automata.create-tm',
      roles: ['user']
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'automata', {
      title: 'Create New Finite State Automaton',
      state: 'automata.create-fsa',
      roles: ['user']
    });

      // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'automata', {
      title: 'Create New Pushdown Automaton',
      state: 'automata.create-pda',
      roles: ['user']
    });
  }
]);
