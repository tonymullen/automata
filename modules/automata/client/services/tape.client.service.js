/* global cytoscape */
(function () {
  'use strict';

  angular
    .module('automata.services')
    .factory('tape', tape);

  tape.$inject = ['$timeout'];

  function tape($timeout) {
    var tape = {
      focusNext: function (event, index, automaton) {
      // changes focus to the next tape cell when a key is pressed
        var nextInd;
        if (event.keyCode === 8) {
          // automaton.tape.contents[index] = String.fromCharCode(event.keyCode);
          automaton.tape.contents[index] = '';
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
            automaton.tape.contents.unshift(' ');
            nextInd = 0;
            angular.element(document.querySelector('.cell-' + nextInd))[0].blur();
          }
        } else {
          automaton.tape.contents[index] = String.fromCharCode(event.keyCode);
          nextInd = index + 1;
          if (automaton.tape.contents.length === nextInd) {
            automaton.tape.contents.push(' ');
          }
        }
        $timeout(function() {
          angular.element(document.querySelector('.cell-' + nextInd))[0].focus();
        }, 0);
      },
      movePosition: function(move, automaton) {
        automaton.tape.position = automaton.tape.position + move;
      },
      setContent: function(position, automaton, value) {
        automaton.tape.contents[position] = value;
      }
    };
    return tape;
  }
}());
