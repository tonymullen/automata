(function () {
  'use strict';

  angular
    .module('classrooms')
    .controller('ClassroomsListController', ClassroomsListController);

  ClassroomsListController.$inject = ['ClassroomsService'];

  function ClassroomsListController(ClassroomsService) {
    var vm = this;

    vm.classrooms = ClassroomsService.query();
  }
}());
