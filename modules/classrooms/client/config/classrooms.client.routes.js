(function () {
  'use strict';

  angular
    .module('classrooms')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('classrooms', {
        abstract: true,
        url: '/classrooms',
        template: '<ui-view/>'
      })
      .state('classrooms.list', {
        url: '',
        templateUrl: '/modules/classrooms/client/views/list-classrooms.client.view.html',
        controller: 'ClassroomsListController',
        controllerAs: 'vm',
        data: {
          roles: ['instructor'],
          pageTitle: 'Classrooms List'
        }
      })
      .state('classrooms.create', {
        url: '/create',
        templateUrl: '/modules/classrooms/client/views/form-classroom.client.view.html',
        controller: 'ClassroomsController',
        controllerAs: 'vm',
        resolve: {
          classroomResolve: newClassroom
        },
        data: {
          roles: ['instructor'],
          pageTitle: 'Classrooms Create'
        }
      })
      .state('classrooms.edit', {
        url: '/:classroomId/edit',
        templateUrl: '/modules/classrooms/client/views/form-classroom.client.view.html',
        controller: 'ClassroomsController',
        controllerAs: 'vm',
        resolve: {
          classroomResolve: getClassroom
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Classroom {{ classroomResolve.name }}'
        }
      })
      .state('classrooms.view', {
        url: '/:classroomId',
        templateUrl: '/modules/classrooms/client/views/view-classroom.client.view.html',
        controller: 'ClassroomsController',
        controllerAs: 'vm',
        resolve: {
          classroomResolve: getClassroom
        },
        data: {
          pageTitle: 'Classroom {{ classroomResolve.name }}'
        }
      });
  }

  getClassroom.$inject = ['$stateParams', 'ClassroomsService'];

  function getClassroom($stateParams, ClassroomsService) {
    return ClassroomsService.get({
      classroomId: $stateParams.classroomId
    }).$promise;
  }

  newClassroom.$inject = ['ClassroomsService'];

  function newClassroom(ClassroomsService) {
    return new ClassroomsService();
  }
}());
