
(function () {
  'use strict';

  angular
    .module('automata.services')
    .factory('automatonPlay', automatonPlay);

  automatonPlay.$inject = ['tape'];
  function reset(cy, automaton) {
    cy.$('node').removeClass('active');
  }

  function automatonPlay (tape) {
    // pass the value of cy and automaton as a
    var automatonPlay = function(cy, automaton) {
      reset(cy, automaton);
      var startNode = cy.getElementById('0');
      startNode.addClass('active');
      var pause = 500;
      doNextStep(startNode, automaton, 0, cy, null, pause, tape);
    };
    return automatonPlay;
  }

  function doNextStep(node, automaton, pos, cy, prevEdge, pause, t) {
    if (automaton.tape.contents[pos] && (automaton.tape.contents[pos] !== ' ')) {
      setTimeout(function() {
        node.outgoers().forEach(function(edge) {
          if (edge.data().read === automaton.tape.contents[pos]) {
            edge.addClass('active');
            var nextNode = edge.target();
            if (nextNode.hasClass('accept')) {
              cy.elements().addClass('accepting');
            } else {
              cy.elements().removeClass('accepting');
            }
            nextNode.addClass('active');
            node.removeClass('active');
            if (prevEdge) {
              prevEdge.removeClass('active');
            }
            // (function(n, t, p, c, e, pause) {
            // tape.position++;
            t.movePosition(1, automaton);
            doNextStep(nextNode, automaton, pos + 1, cy, edge, pause, t);
            // }(nextNode, tape, pos + 1, cy, edge, pause));
          }
        });
      }, pause);
    } else if (prevEdge) {
      setTimeout(function() {
        prevEdge.removeClass('active');
      }, pause);
    }
  }
}());
