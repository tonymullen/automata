(function () {
  'use strict';

  angular
    .module('automata')
    .controller('AutomataController', AutomataController);

  AutomataController.$inject =
            ['$scope', '$state', '$window',
            '$timeout', '$location', '$stateParams',
            'Authentication', 'automatonResolve',
            'automatonGraph', 'tape'];

  function AutomataController($scope, $state, $window,
          $timeout, $location, $stateParams,
          Authentication, automaton,
          automatonGraph, tape) {
    var vm = this;
    vm.automaton = automaton;
    vm.authentication = Authentication;
    vm.error = null;
    // vm.remove = remove;
    vm.save = save;


    vm.automaton.machine = vm.automaton.machine || $state.current.data.type;
    vm.automaton.title = vm.automaton.title || (function() {
      if ($state.current.data.type === 'fsa') return 'Untitled Finite-State Automaton';
      else if ($state.current.data.type === 'pda') return 'Untitled Pushdown Automaton';
      else return 'Untitled Turing Machine';
    }());

    var cy; // ref to cy


    vm.play = function () {
      vm.playAutomaton(cy, vm.automaton);
    };

    vm.labels = { read: '', act: '' };

    // TODO: Remove existing Automaton
    /*
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.automaton.$remove($state.go('automata.list'));
      }
    }
    */

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
        vm.automaton._id = res._id;
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }

    vm.focusNext = tape.focusNext;

    vm.setTapePosition = function(pos) {
      vm.automaton.tape.position = pos;
      cy.$('node').removeClass('active');
      angular.element(document.querySelector('.tape-content')).removeClass('accepted');
      angular.element(document.querySelector('.tape-content')).removeClass('rejected');
    }

    vm.reset = function(cy, automaton) {
      vm.automaton.tape.position = 0;
      cy.$('node').removeClass('active');
      angular.element(document.querySelector('.tape-content')).removeClass('accepted');
      angular.element(document.querySelector('.tape-content')).removeClass('rejected');
    };

    vm.doNextStep = function(node, pos, cy, prevEdge, pause, t) {
      if (vm.automaton.tape.contents[pos] && (vm.automaton.tape.contents[pos] !== ' ')) {
        setTimeout(function() {
          node.outgoers().forEach(function(edge) {
            if (edge.data().read === vm.automaton.tape.contents[pos]) {
              edge.addClass('active');
              var nextNode = edge.target();
              if (nextNode.hasClass('accept')) {
                cy.elements().addClass('accepting');
                angular.element(document.querySelector('.tape-content')).addClass('accepted');
              } else {
                cy.elements().removeClass('accepting');
                angular.element(document.querySelector('.tape-content')).removeClass('accepted');
              }
              nextNode.addClass('active');
              node.removeClass('active');
              if (prevEdge) {
                prevEdge.removeClass('active');
              }
              $scope.$apply(
                t.movePosition(1, vm.automaton)
              );
              vm.doNextStep(nextNode, pos + 1, cy, edge, pause, t);
            }
          });
        }, pause);
      } else if (prevEdge) {
        setTimeout(function() {
          prevEdge.removeClass('active');
          if (!node.hasClass('accept')){
            angular.element(document.querySelector('.tape-content')).addClass('rejected');
            node.addClass('rejected');
          }
        }, pause);
      }
    };

    vm.playAutomaton = function(cy, automaton) {
      vm.reset(cy, automaton);
      var startNode = cy.getElementById('0');
      startNode.addClass('active');
      var pause = 500;
      vm.doNextStep(startNode, 0, cy, null, pause, tape);
    };

    (function setUpGraph() {
      /* Set up Cytoscape graph */
      automatonGraph(vm.automaton.eles, vm.automaton.machine).then(function(automatonCy) {
        cy = automatonCy;
        vm.cyLoaded = true;
      });
    }());
  }
}());
