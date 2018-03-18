'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Classroom = mongoose.model('Classroom'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a Classroom
 */
exports.create = function (req, res) {
  var classroom = new Classroom(req.body);
  classroom.user = req.user;
  classroom.entryCode = makeEntryCode();

  classroom.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(classroom);
    }
  });
};

function makeEntryCode() {
  var code = "";
  var alphanum= "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 8; i++) {
    code += alphanum.charAt(Math.floor(Math.random() * alphanum.length));
  }
  return code;
}

/**
 * Show the current Classroom
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var classroom = req.classroom ? req.classroom.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  classroom.isCurrentUserOwner = req.user && classroom.user && classroom.user._id.toString() === req.user._id.toString();

  res.json(classroom);
};

/**
 * Update a Classroom
 */
exports.update = function (req, res) {
  var classroom = req.classroom;

  classroom.name = req.body.name;
  classroom.content = req.body.content;

  classroom.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(classroom);
    }
  });
};

/**
 * Delete an Classroom
 */
exports.delete = function (req, res) {
  var classroom = req.classroom;

  classroom.remove(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(classroom);
    }
  });
};

/**
 * List of Classrooms
 */
exports.list = function (req, res) {
  Classroom.find().sort('-created').populate('user', 'displayName').exec(function (err, classrooms) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(classrooms);
    }
  });
};

/**
 * Classroom middleware
 */
exports.classroomByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Classroom is invalid'
    });
  }

  Classroom.findById(id).populate('user', 'displayName').exec(function (err, classroom) {
    if (err) {
      return next(err);
    } else if (!classroom) {
      return res.status(404).send({
        message: 'No Classroom with that identifier has been found'
      });
    }
    req.classroom = classroom;
    next();
  });
};
