(function () {
  'use strict';

  angular
    .module('automata')
    .controller('AutomataListController', AutomataListController);

  AutomataListController.$inject = ['AutomataService'];

  function AutomataListController(AutomataService) {
    var vm = this;

    vm.automata = AutomataService.query();
  }
}());
