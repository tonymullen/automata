'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Classroom = mongoose.model('Classroom'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  classroom;

/**
 * Classroom routes tests
 */
describe('Classroom CRUD tests', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new Classroom
    user.save(function () {
      classroom = {
        name: 'Classroom name'
      };

      done();
    });
  });

  it('should be able to save a Classroom if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Classroom
        agent.post('/api/classrooms')
          .send(classroom)
          .expect(200)
          .end(function (classroomSaveErr, classroomSaveRes) {
            // Handle Classroom save error
            if (classroomSaveErr) {
              return done(classroomSaveErr);
            }

            // Get a list of Classrooms
            agent.get('/api/classrooms')
              .end(function (classroomsGetErr, classroomsGetRes) {
                // Handle Classrooms save error
                if (classroomsGetErr) {
                  return done(classroomsGetErr);
                }

                // Get Classrooms list
                var classrooms = classroomsGetRes.body;

                // Set assertions
                (classrooms[0].user._id).should.equal(userId);
                (classrooms[0].name).should.match('Classroom name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Classroom if not logged in', function (done) {
    agent.post('/api/classrooms')
      .send(classroom)
      .expect(403)
      .end(function (classroomSaveErr, classroomSaveRes) {
        // Call the assertion callback
        done(classroomSaveErr);
      });
  });

  it('should not be able to save an Classroom if no name is provided', function (done) {
    // Invalidate name field
    classroom.name = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Classroom
        agent.post('/api/classrooms')
          .send(classroom)
          .expect(400)
          .end(function (classroomSaveErr, classroomSaveRes) {
            // Set message assertion
            (classroomSaveRes.body.message).should.match('Please fill Classroom name');

            // Handle Classroom save error
            done(classroomSaveErr);
          });
      });
  });

  it('should be able to update an Classroom if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Classroom
        agent.post('/api/classrooms')
          .send(classroom)
          .expect(200)
          .end(function (classroomSaveErr, classroomSaveRes) {
            // Handle Classroom save error
            if (classroomSaveErr) {
              return done(classroomSaveErr);
            }

            // Update Classroom name
            classroom.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Classroom
            agent.put('/api/classrooms/' + classroomSaveRes.body._id)
              .send(classroom)
              .expect(200)
              .end(function (classroomUpdateErr, classroomUpdateRes) {
                // Handle Classroom update error
                if (classroomUpdateErr) {
                  return done(classroomUpdateErr);
                }

                // Set assertions
                (classroomUpdateRes.body._id).should.equal(classroomSaveRes.body._id);
                (classroomUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Classrooms if not signed in', function (done) {
    // Create new Classroom model instance
    var classroomObj = new Classroom(classroom);

    // Save the classroom
    classroomObj.save(function () {
      // Request Classrooms
      request(app).get('/api/classrooms')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Classroom if not signed in', function (done) {
    // Create new Classroom model instance
    var classroomObj = new Classroom(classroom);

    // Save the Classroom
    classroomObj.save(function () {
      request(app).get('/api/classrooms/' + classroomObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', classroom.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Classroom with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/classrooms/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Classroom is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Classroom which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Classroom
    request(app).get('/api/classrooms/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Classroom with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Classroom if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Classroom
        agent.post('/api/classrooms')
          .send(classroom)
          .expect(200)
          .end(function (classroomSaveErr, classroomSaveRes) {
            // Handle Classroom save error
            if (classroomSaveErr) {
              return done(classroomSaveErr);
            }

            // Delete an existing Classroom
            agent.delete('/api/classrooms/' + classroomSaveRes.body._id)
              .send(classroom)
              .expect(200)
              .end(function (classroomDeleteErr, classroomDeleteRes) {
                // Handle classroom error error
                if (classroomDeleteErr) {
                  return done(classroomDeleteErr);
                }

                // Set assertions
                (classroomDeleteRes.body._id).should.equal(classroomSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Classroom if not signed in', function (done) {
    // Set Classroom user
    classroom.user = user;

    // Create new Classroom model instance
    var classroomObj = new Classroom(classroom);

    // Save the Classroom
    classroomObj.save(function () {
      // Try deleting Classroom
      request(app).delete('/api/classrooms/' + classroomObj._id)
        .expect(403)
        .end(function (classroomDeleteErr, classroomDeleteRes) {
          // Set message assertion
          (classroomDeleteRes.body.message).should.match('User is not authorized');

          // Handle Classroom error error
          done(classroomDeleteErr);
        });

    });
  });

  it('should be able to get a single Classroom that has an orphaned user reference', function (done) {
    // Create orphan user creds
    var _creds = {
      username: 'orphan',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create orphan user
    var _orphan = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'orphan@test.com',
      username: _creds.username,
      password: _creds.password,
      provider: 'local'
    });

    _orphan.save(function (err, orphan) {
      // Handle save error
      if (err) {
        return done(err);
      }

      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var orphanId = orphan._id;

          // Save a new Classroom
          agent.post('/api/classrooms')
            .send(classroom)
            .expect(200)
            .end(function (classroomSaveErr, classroomSaveRes) {
              // Handle Classroom save error
              if (classroomSaveErr) {
                return done(classroomSaveErr);
              }

              // Set assertions on new Classroom
              (classroomSaveRes.body.name).should.equal(classroom.name);
              should.exist(classroomSaveRes.body.user);
              should.equal(classroomSaveRes.body.user._id, orphanId);

              // force the Classroom to have an orphaned user reference
              orphan.remove(function () {
                // now signin with valid user
                agent.post('/api/auth/signin')
                  .send(credentials)
                  .expect(200)
                  .end(function (err, res) {
                    // Handle signin error
                    if (err) {
                      return done(err);
                    }

                    // Get the Classroom
                    agent.get('/api/classrooms/' + classroomSaveRes.body._id)
                      .expect(200)
                      .end(function (classroomInfoErr, classroomInfoRes) {
                        // Handle Classroom error
                        if (classroomInfoErr) {
                          return done(classroomInfoErr);
                        }

                        // Set assertions
                        (classroomInfoRes.body._id).should.equal(classroomSaveRes.body._id);
                        (classroomInfoRes.body.name).should.equal(classroom.name);
                        should.equal(classroomInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Classroom.remove().exec(done);
    });
  });
});
