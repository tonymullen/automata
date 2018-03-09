(function () {
  'use strict';

  angular
    .module('classrooms')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('topbar', {
      title: 'Classrooms',
      state: 'classrooms',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'classrooms', {
      title: 'Manage Classrooms',
      state: 'classrooms.list',
      roles: ['instructor']
    });

    // Add the dropdown create item
    menuService.addSubMenuItem('topbar', 'classrooms', {
      title: 'Create Classroom',
      state: 'classrooms.create',
      roles: ['instructor']
    });

    // Add the dropdown create item
    menuService.addSubMenuItem('topbar', 'classrooms', {
      title: 'Join Classroom',
      state: 'classrooms.join',
      roles: ['user']
    });
  }
}());
