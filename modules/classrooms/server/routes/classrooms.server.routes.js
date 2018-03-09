'use strict';

/**
 * Module dependencies
 */
var classroomsPolicy = require('../policies/classrooms.server.policy'),
  classrooms = require('../controllers/classrooms.server.controller');

module.exports = function (app) {
  // Classrooms Routes
  app.route('/api/classrooms').all(classroomsPolicy.isAllowed)
    .get(classrooms.list)
    .post(classrooms.create);

  app.route('/api/classrooms/:classroomId').all(classroomsPolicy.isAllowed)
    .get(classrooms.read)
    .put(classrooms.update)
    .delete(classrooms.delete);

  // Finish by binding the Classroom middleware
  app.param('classroomId', classrooms.classroomByID);
};
