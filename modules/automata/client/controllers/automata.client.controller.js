(function () {
  'use strict';

  angular
    .module('automata')
    .controller('AutomataController', AutomataController);

  AutomataController.$inject =
  ['$scope', '$state', '$window', '$timeout',
    '$location', '$stateParams', 'Authentication',
    'automatonResolve', 'automatonGraph', 'tape', 'Notification'];
  // TODO: crashes when page is refreshed.
  // TODO: default view of the graph should be the entire graph (as opposed to the 0 node) I think. This could be switchable.
  function AutomataController($scope, $state, $window,
          $timeout, $location, $stateParams,
          Authentication, automaton,
          automatonGraph, tape, Notification) {
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
    var pauses = {
      'default': 500,
      'fast': 1
    };

    var stopPlay = true;

    vm.play = function (speed) {
      vm.playAutomaton(cy, vm.automaton, speed);
    };

    function resetStack() {
      if (vm.automaton.machine === 'pda') {
        vm.automaton.stack = [];
        for (var j = 0; j < 20; j++) {
          vm.automaton.stack.push(' ');
        }
      }
    }

    vm.resetAutomaton = function() {
      vm.reset(cy,automaton);
    }

    vm.playAutomaton = function(cy, automaton, speed) {
      if (stopPlay) {
        vm.reset(cy, automaton);
        stopPlay = false;
        resetStack();
        cy.$('node').addClass('running');
        cy.$('edge').addClass('running');
        var startNode = cy.getElementById('0');
        startNode.addClass('active');
        var pause = pauses[speed];
        if (vm.automaton.machine === 'fsa') {
          vm.doNextStepFSA(startNode, 0, cy, null, pause, tape);
        } else if (vm.automaton.machine === 'pda') {
          vm.doNextStepPDA(startNode, 0, cy, null, pause, tape);
        } else if (vm.automaton.machine === 'tm') {
          vm.doNextStepTM(startNode, 0, cy, null, pause, tape);
        }
      }
    };

    vm.labels = { read: '', act: '' };

    vm.remove = function() {
      if ($window.confirm('Are you sure you want to delete ' + vm.automaton.title + '?')) {
        vm.automaton.$remove($state.go('automata.list'));
        Notification.info({ message: 'Deleted ' + vm.automaton.title });
      }
    };

    vm.fileExport = function(isValid) {
      vm.resetElementColors();
      var image = document.createElement('img');

      image.addEventListener('load', function() {
        var doc = new jsPDF(); // eslint-disable-line

        doc.setFontSize(18);
        doc.text(25, 25, vm.automaton.title);

        doc.setFontSize(12);
        if (vm.automaton.demo) {
          doc.text(25, 33, 'Demo');
        } else if (vm.authentication.user) {
          doc.text(25, 33, vm.authentication.user.firstName + ' '
                          + vm.authentication.user.lastName);
        }

        doc.addImage(image.src, 'PNG', 15, 50, image.width / 10, image.height / 10);

        var filename = vm.automaton.title.replace(/\/|\\|\?|\%|\*|\:|\||\"|\<|\>|\.| /gi, '_');
        doc.save(filename + '.pdf');
      });
      image.src = cy.png({ full: true, maxWidth: 1800 });
    };
    var tapes = vm.automaton.tapes;
    //
    vm.saveTape = function() {
      var index = tapes.indexOf(tape);
      // if current tape not in tapes we push it, otherwise we update the contents
      if (index === -1) {
        var tapeName = prompt('Name of your tape, please', '');
        tapes.push({
          name: tapeName,
    //      dateCreated: Date.now(), // TODO: use proper way of saving this in the database
          contents: vm.automaton.tape.contents
        });
      } else {
        tapes[index].contents = vm.automaton.tape.contents;
      }
      vm.save(true); // TODO: may not want to save entire automata (just the tape)
      Notification.info({message: 'Saved tape'});
    }

    // load the selected tape into the deck
    vm.loadTape = function() {
      // TODO: set current tape to selectTape
  //    vm.automaton.tape = vm.selectTape;
  //    vm.reset();
      console.log(vm.selectTape)
      // TODO: move selectTape to tape
      // var temp = vm.automaton.tapes[0];
      // var index = vm.automaton.tapes.indexOf(vm.selectTape)
      // vm.automaton.tapes[0] = vm.selectTape;
      // vm.automaton.tapes[index] = temp
    }

    // tape select model
    vm.selectTape = {
      tape : vm.automaton.tape
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
        vm.automaton._id = res._id;
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }

    vm.focusNext = tape.focusNext;
    // play is currently stopped. prevents play when
    // play is already in progress

    vm.resetElementColors = function() {
      resetStack();
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

    vm.doNextStepFSA = function(node, pos, cy, prevEdge, pause, t) {
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
                  vm.doNextStepFSA(nextNode, pos + 1, cy, edge, pause, t);
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

    vm.doNextStepPDA = function(node, pos, cy, prevEdge, pause, t) {
      if (!stopPlay) {
        if ((!!vm.automaton.tape.contents[pos])
          && (vm.automaton.tape.contents[pos] !== ' ')
          && (vm.automaton.tape.contents[pos].length > 0)) { // if we're reading a character
          setTimeout(function() {
            var action = null;
            var read = null;
            var read_stack = null;
            var noOutgoing = true;
            node.outgoers().forEach(function(edge) {
              if (edge.data().read === '_') {
                read = ' ';
              } else {
                read = edge.data().read;
              }
              if (edge.data().read_stack === '_') {
                read_stack = ' ';
              } else {
                read_stack = edge.data().read_stack;
              }
              if (edge.data().action === '_') {
                action = ' ';
              } else {
                action = edge.data().read;
              }
              if (read === vm.automaton.tape.contents[pos]
                  && (read_stack === vm.automaton.stack[0] // read the stack
                      || read_stack === '-')) { // or ignore the stack
                noOutgoing = false;
                edge.addClass('active');
                var nextNode = edge.target();
                node.removeClass('active');
                nextNode.addClass('active');
                if (edge.data().action !== '-') { // '-' is no action on stack
                  if (edge.data().action === '^') {
                    vm.automaton.stack.shift();
                  } else {
                    console.log(action);
                    vm.automaton.stack.unshift(action);
                  }
                }
                if (prevEdge && prevEdge !== edge) {
                  prevEdge.removeClass('active');
                }
                if (!stopPlay) {
                  $scope.$apply(
                    t.movePosition(1, vm.automaton)
                  );
                  vm.doNextStepPDA(nextNode, pos + 1, cy, edge, pause, t);
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
          stopPlay = true;
          setTimeout(function() {
            prevEdge.removeClass('active');
            cy.$('node').removeClass('running');
            cy.$('edge').removeClass('running');
            if (node.hasClass('accept') && vm.automaton.stack[0] === ' ') {
              angular.element(document.querySelector('.tape-content')).addClass('accepted');
              node.removeClass('active');
              node.addClass('accepting');
            } else {
              angular.element(document.querySelector('.tape-content')).addClass('rejected');
              node.removeClass('active');
              node.addClass('rejected');
              if (vm.automaton.stack[0] !== ' ') {
                angular.element(document.querySelector('.stack-table')).addClass('rejected');
              }
            }
          }, pause);
        }
      } // if (!stopPlay) {
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
            if (read === vm.automaton.tape.contents[pos] ||
                read === vm.automaton.tape.contents[pos] + ' ') {
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

    (function setUpGraph() {
      /* Set up Cytoscape graph */
      automatonGraph(vm.automaton.eles, vm.automaton.machine).then(function(automatonCy) {
        cy = automatonCy;

        vm.cyLoaded = true;

      });
    }());
  }
}());
