(function () {
  'use strict';

  angular
    .module('automata')
    .controller('AutomataListController', AutomataListController);

  AutomataListController.$inject = ['AutomataService', 'DemoService', 'Authentication'];

  function AutomataListController(AutomataService, DemoService, Authentication) {
    var vm = this;
    vm.authentication = Authentication;
    vm.automata = AutomataService.query();
    vm.demos = DemoService.query();
  }

}());
