'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Automaton = mongoose.model('Automaton'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create an automaton
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
  // convert mongoose document to JSON
  var automaton = req.automaton ? req.automaton.toJSON() : {};

  // Add a custom field to the Automaton, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Automaton model.
  automaton.isCurrentUserOwner = !!(req.user && automaton.user && automaton.user._id.toString() === req.user._id.toString());

  res.json(automaton);
};

/**
 * Update an automaton
 */
exports.update = function (req, res) {
  var automaton = req.automaton;
  automaton.title = req.body.title;
  automaton.eles = req.body.eles;
  automaton.tape = req.body.tape;
  automaton.tapes = req.body.tapes;
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
  req.automaton.remove(function (err) {

    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage('deleted ' + err)
      });
    } else {
      res.json(req.automaton);
    }
  });
};

/**
 * List of Automata
 */
exports.list = function (req, res) {
  Automaton.find().where('user').eq(req.user._id).sort('-created').populate('user', 'displayName').exec(function (err, automata) {
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
 * List of Demos
 */
exports.demos = function (req, res) {
  Automaton.find().where('demo').eq(true).sort('-created').populate('user', 'displayName').exec(function (err, automata) {
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
