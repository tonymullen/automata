'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Automaton = mongoose.model('Automaton'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, automaton;

/**
 * Automaton routes tests
 */
describe('Automaton CRUD tests', function () {
  this.timeout(10000);

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

    // Save a user to the test db and create new automaton
    user.save(function () {
      automaton = {
        title: 'Automaton Title',
        content: 'Automaton Content'
      };

      done();
    });
  });

  it('should be able to save an automaton if logged in', function (done) {
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

        // Save a new automaton
        agent.post('/api/automata')
          .send(automaton)
          .expect(200)
          .end(function (automataSaveErr, automataSaveRes) {
            // Handle automaton save error
            if (automataSaveErr) {
              return done(automataSaveErr);
            }

            // Get a list of automata
            agent.get('/api/automata')
              .end(function (automataGetErr, automataGetRes) {
                // Handle automaton save error
                if (automataGetErr) {
                  return done(automataGetErr);
                }

                // Get automata list
                var automata = automataGetRes.body;

                // Set assertions
                (automata[0].user._id).should.equal(userId);
                (automata[0].title).should.match('Automaton Title');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an automaton if not logged in', function (done) {
    agent.post('/api/automata')
      .send(automaton)
      .expect(403)
      .end(function (automataSaveErr, automataSaveRes) {
        // Call the assertion callback
        done(automataSaveErr);
      });
  });

  it('should not be able to save an automaton if no title is provided', function (done) {
    // Invalidate title field
    automaton.title = '';

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

        // Save a new automaton
        agent.post('/api/automata')
          .send(automaton)
          .expect(400)
          .end(function (automataSaveErr, automataSaveRes) {
            // Set message assertion
            (automataSaveRes.body.message).should.match('Title cannot be blank');

            // Handle automaton save error
            done(automataSaveErr);
          });
      });
  });

  it('should be able to update an automaton if signed in', function (done) {
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

        // Save a new automaton
        agent.post('/api/automata')
          .send(automaton)
          .expect(200)
          .end(function (automataSaveErr, automataSaveRes) {
            // Handle automaton save error
            if (automataSaveErr) {
              return done(automataSaveErr);
            }

            // Update automaton title
            automaton.title = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing automaton
            agent.put('/api/automata/' + automataSaveRes.body._id)
              .send(automaton)
              .expect(200)
              .end(function (automatonUpdateErr, automatonUpdateRes) {
                // Handle automaton update error
                if (automatonUpdateErr) {
                  return done(automatonUpdateErr);
                }

                // Set assertions
                (automatonUpdateRes.body._id).should.equal(automataSaveRes.body._id);
                (automatonUpdateRes.body.title).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of automata if not signed in', function (done) {
    // Create new automaton model instance
    var automatonObj = new Automaton(automaton);

    // Save the automaton
    automatonObj.save(function () {
      // Request automata
      request(app).get('/api/automata')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single automaton if not signed in', function (done) {
    // Create new automaton model instance
    var automatonObj = new Automaton(automaton);

    // Save the automaton
    automatonObj.save(function () {
      request(app).get('/api/automata/' + automatonObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('title', automaton.title);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single automaton with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/automata/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Automaton is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single automaton which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent automaton
    request(app).get('/api/automata/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No automaton with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an automaton if signed in', function (done) {
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

        // Save a new automaton
        agent.post('/api/automata')
          .send(automaton)
          .expect(200)
          .end(function (automataSaveErr, automataSaveRes) {
            // Handle automaton save error
            if (automataSaveErr) {
              return done(automataSaveErr);
            }

            // Delete an existing automaton
            agent.delete('/api/automata/' + automataSaveRes.body._id)
              .send(automaton)
              .expect(200)
              .end(function (automatonDeleteErr, automatonDeleteRes) {
                // Handle automaton error error
                if (automatonDeleteErr) {
                  return done(automatonDeleteErr);
                }

                // Set assertions
                (automatonDeleteRes.body._id).should.equal(automataSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an automaton if not signed in', function (done) {
    // Set automaton user
    automaton.user = user;

    // Create new automaton model instance
    var automatonObj = new Automaton(automaton);

    // Save the automaton
    automatonObj.save(function () {
      // Try deleting automaton
      request(app).delete('/api/automata/' + automatonObj._id)
        .expect(403)
        .end(function (automatonDeleteErr, automatonDeleteRes) {
          // Set message assertion
          (automatonDeleteRes.body.message).should.match('User is not authorized');

          // Handle automaton error error
          done(automatonDeleteErr);
        });

    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Automaton.remove().exec(done);
    });
  });
});
