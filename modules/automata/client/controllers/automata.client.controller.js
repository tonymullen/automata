(function () {
  'use strict';

  angular
    .module('automata')
    .controller('AutomataController', AutomataController);

  AutomataController.$inject =
            ['$scope', '$state', '$window',
            '$timeout', '$location', '$stateParams',
            'Authentication', 'automatonResolve',
            'automatonGraph', 'AutomataService'];

  function AutomataController($scope, $state, $window,
          $timeout, $location, $stateParams,
          Authentication, automaton,
          automatonGraph, AutomataService) {
    var vm = this;
    vm.automaton = automaton;
    vm.authentication = Authentication;
    vm.error = null;
    // vm.form = {};
    vm.remove = remove;
    vm.save = save;


    vm.automaton.machine = vm.automaton.machine || $state.current.data.type;
    vm.automaton.title = vm.automaton.title || (function() {
      if ($state.current.data.type === 'fsa') return 'Untitled Finite-State Automaton';
      else if ($state.current.data.type === 'pda') return 'Untitled Pushdown Automaton';
      else return 'Untitled Turing Machine';
    }());
    console.log(vm.automaton.title);

    // Copied from previous controller
    var cy; // ref to cy

    vm.labels = { read: '', act: '' };

    // Remove existing Automaton
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.automaton.$remove($state.go('automata.list'));
      }
    }

    // Save Automaton
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.automataForm');
        return false;
      }

      vm.automaton.eles.nodes = cy.nodes().jsons();
      vm.automaton.eles.edges = cy.edges().jsons();

      // TODO: move create/update logic to service
      if (vm.automaton._id) {
        vm.automaton.$update(successCallback, errorCallback);
      } else {
        vm.automaton.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        // vm.automaton = AutomataService.get({

        vm.automaton._id = res._id;
        // vm.automaton = AutomataService.get({
        //  automatonId: res._id
        // }).$promise;

        /*
        $state.go('automata.view', {
          automatonId: res._id
        });
        */
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }

    // Copied over from previous version
    $scope.focusNext = function(event, index) {
      // changes focus to the next tape cell when a key is pressed
      var nextInd;
      if (event.keyCode === 8) {
        vm.automaton.tape.contents[index] = String.fromCharCode(event.keyCode);
        // backspace key
        if (index > 0) {
          nextInd = index - 1;
        } else {
          nextInd = index;
        }
      } else if (event.keyCode === 37) {
        // leftarrow
        if (index > 0) {
          nextInd = index - 1;
        } else {
          vm.automaton.tape.contents.unshift(' ');
          nextInd = 0;
          angular.element(document.querySelector('.cell-' + nextInd))[0].blur();
        }
      } else {
        vm.automaton.tape.contents[index] = String.fromCharCode(event.keyCode);
        nextInd = index + 1;
        if (vm.automaton.tape.contents.length === nextInd) {
          vm.automaton.tape.contents.push(' ');
        }
      }
      $timeout(function() {
        angular.element(document.querySelector('.cell-' + nextInd))[0].focus();
      }, 0);
    };

    // setUpGraph();

    (function setUpGraph() {
      /* CYTOSCAPE */
      automatonGraph(vm.automaton.eles).then(function(automatonCy) {
        cy = automatonCy;
        vm.cyLoaded = true;
      });
    }());
  }
}());
