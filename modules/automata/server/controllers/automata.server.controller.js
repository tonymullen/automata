'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Automaton = mongoose.model('Automaton'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create an article
 */
exports.create = function (req, res) {
  var automaton = new Automaton(req.body);
  automaton.user = req.user;

  automaton.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(automaton);
    }
  });
};

/**
 * Show the current automaton
 */
exports.read = function (req, res) {
  res.json(req.automaton);
};

/**
 * Update an automaton
 */
exports.update = function (req, res) {
  var automaton = req.automaton;
  automaton.eles = req.body.eles;
  automaton.tape = req.body.tape;
  automaton.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(automaton);
    }
  });
};

/**
 * Delete an automaton
 */
exports.delete = function (req, res) {
  var automaton = req.automaton;

  automaton.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(automaton);
    }
  });
};

/**
 * List of Automata
 */
exports.list = function (req, res) {
  Automaton.find().sort('-created').populate('user', 'displayName').exec(function (err, automata) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(automata);
    }
  });
};

/**
 * Automaton middleware
 */
exports.automatonByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Automaton is invalid'
    });
  }

  Automaton.findById(id).populate('user', 'displayName').exec(function (err, automaton) {
    if (err) {
      return next(err);
    } else if (!automaton) {
      return res.status(404).send({
        message: 'No automaton with that identifier has been found'
      });
    }
    req.automaton = automaton;
    next();
  });
};
