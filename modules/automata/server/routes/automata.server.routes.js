
'use strict';

/**
 * Module dependencies.
 */
var automataPolicy = require('../policies/automata.server.policy'),
  automata = require('../controllers/automata.server.controller');
  // node = require('../controllers/node.server.controller');

module.exports = function (app) {
  // Automata collection routes
  app.route('/api/automata').all(automataPolicy.isAllowed)
    .get(automata.list)
    .post(automata.create);

  // Demos
  app.route('/api/demos').all(automataPolicy.isAllowed)
    .get(automata.demos);

  // Single automaton routes
  app.route('/api/automata/:automatonId').all(automataPolicy.isAllowed)
    .get(automata.read)
    .put(automata.update)
    .delete(automata.delete);

  // Finish by binding the automaton middleware
  app.param('automatonId', automata.automatonByID);
};
