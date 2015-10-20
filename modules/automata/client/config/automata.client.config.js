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
      title: 'Create Automata',
      state: 'automata.create',
      roles: ['user']
    });
  }
]);
