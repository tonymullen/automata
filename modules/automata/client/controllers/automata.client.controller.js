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
      if (vm.automaton.machine === 'fsa') {
        vm.playFSM(cy, vm.automaton);
      } else if (vm.automaton.machine === 'tm') {
        vm.playTM(cy, vm.automaton);
      }
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
    var stopPlay = true;

    vm.resetElementColors = function() {
      cy.$('node').removeClass('running');
      cy.$('edge').removeClass('running');
      cy.$('node').removeClass('active');
      cy.$('edge').removeClass('active');
      cy.$('node').removeClass('rejected');
      cy.$('node').removeClass('accepting');
      angular.element(document.querySelector('.tape-content')).removeClass('accepted');
      angular.element(document.querySelector('.tape-content')).removeClass('rejected');
      // angular.element(document.querySelector('.node')).removeClass('rejected');
    };

    vm.setTapePosition = function(pos) {
      stopPlay = true;
      vm.automaton.tape.position = pos;
      vm.resetElementColors();
    };

    vm.reset = function(cy, automaton) {
      stopPlay = true;
      vm.automaton.tape.position = 0;
      vm.resetElementColors();
    };

    vm.doNextStepFSM = function(node, pos, cy, prevEdge, pause, t) {
      if (!stopPlay) {
        if ((!!vm.automaton.tape.contents[pos])
          && (vm.automaton.tape.contents[pos] !== ' ')
          && (vm.automaton.tape.contents[pos].length > 0)) {
          setTimeout(function() {
            var noOutgoing = true;
            node.outgoers().forEach(function(edge) {
              if (edge.data().read === vm.automaton.tape.contents[pos]) {
                noOutgoing = false;
                edge.addClass('active');
                var nextNode = edge.target();
                node.removeClass('active');
                nextNode.addClass('active');
                if (prevEdge && prevEdge !== edge) {
                  prevEdge.removeClass('active');
                }
                if (!stopPlay) {
                  $scope.$apply(
                    t.movePosition(1, vm.automaton)
                  );
                  vm.doNextStepFSM(nextNode, pos + 1, cy, edge, pause, t);
                } else {
                  vm.resetElementColors();
                }
              }
            });
            if (noOutgoing) {
              stopPlay = true;
              if (prevEdge) prevEdge.removeClass('active');
              cy.$('node').removeClass('running');
              cy.$('edge').removeClass('running');
              angular.element(document.querySelector('.tape-content')).addClass('rejected');
              node.removeClass('active');
              node.addClass('rejected');
            }
          }, pause);
        } else if (prevEdge) {
          setTimeout(function() {
            stopPlay = true;
            prevEdge.removeClass('active');
            cy.$('node').removeClass('running');
            cy.$('edge').removeClass('running');
            if (node.hasClass('accept')) {
              angular.element(document.querySelector('.tape-content')).addClass('accepted');
              node.removeClass('active');
              node.addClass('accepting');
            } else {
              angular.element(document.querySelector('.tape-content')).addClass('rejected');
              node.removeClass('active');
              node.addClass('rejected');
            }
          }, pause);
        }
      }
    };

    vm.playFSM = function(cy, automaton) {
      if (stopPlay) {
        vm.reset(cy, automaton);
        stopPlay = false;
        cy.$('node').addClass('running');
        cy.$('edge').addClass('running');
        var startNode = cy.getElementById('0');
        startNode.addClass('active');
        var pause = 500;
        vm.doNextStepFSM(startNode, 0, cy, null, pause, tape);
      }
    };

    vm.doNextStepTM = function(node, pos, cy, prevEdge, pause, t) {
      if (!stopPlay) {
        $timeout(function() {
          var noOutgoing = true;
          var action = null;
          var read = null;
          node.outgoers().forEach(function(edge) {
            if (edge.data().read === '_') {
              read = ' ';
            } else {
              read = edge.data().read;
            }
            if (read === vm.automaton.tape.contents[pos]) {
              action = edge.data().action;
              noOutgoing = false;
              edge.addClass('active');
              var nextNode = edge.target();
              node.removeClass('active');
              nextNode.addClass('active');
              if (prevEdge && prevEdge !== edge) {
                prevEdge.removeClass('active');
              }
              if (!stopPlay) {
                if (action === '>') {
                  $scope.$apply(
                    t.movePosition(1, vm.automaton)
                  );
                } else if (action === '<') {
                  $scope.$apply(
                    t.movePosition((-1), vm.automaton)
                  );
                } else if (action === '_') {
                  $scope.$apply(
                    t.setContent(vm.automaton.tape.position, vm.automaton, ' ')
                  );
                } else if (action) {
                  $scope.$apply(
                    t.setContent(vm.automaton.tape.position, vm.automaton, edge.data().action)
                  );
                }
                action = null;
                read = null;
                vm.doNextStepTM(nextNode, vm.automaton.tape.position, cy, edge, pause, t);
              } else {
                vm.resetElementColors();
              }
              // break the foreach loop when a matching edge is found
              // otherwise read values will match newly written
              // tape values. "break" doesn't work for foreach
              return false;
            }
          });
          if (noOutgoing) {
            stopPlay = true;
            if (prevEdge) prevEdge.removeClass('active');
            cy.$('node').removeClass('running');
            cy.$('edge').removeClass('running');
          }
        }, pause);
      }
    };


    vm.playTM = function(cy, automaton) {
      console.log('playing turing machine');
      if (stopPlay) {
        vm.reset(cy, automaton);
        stopPlay = false;
        cy.$('node').addClass('running');
        cy.$('edge').addClass('running');
        var startNode = cy.getElementById('0');
        startNode.addClass('active');
        var pause = 1000;
        vm.doNextStepTM(startNode, 0, cy, null, pause, tape);
      }
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
