(function () {
  'use strict';

  angular
    .module('automata')
    .controller('AutomataListController', AutomataListController);

  AutomataListController.$inject = ['AutomataService', 'Authentication'];

  function AutomataListController(AutomataService, Authentication) {
    var vm = this;
    vm.authentication = Authentication;
    vm.all_automata = AutomataService.query(() => {
      vm.demos = vm.all_automata.filter(x => x.demo);
      vm.automata = vm.all_automata.filter(x => !x.demo);
    });
  }
}());
