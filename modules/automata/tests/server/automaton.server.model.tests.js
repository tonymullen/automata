'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Automaton = mongoose.model('Automaton');

/**
 * Globals
 */
var user;
var automaton;

/**
 * Unit tests
 */
describe('Automaton Model Unit Tests:', function () {
  this.timeout(10000);

  beforeEach(function (done) {
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    });

    user.save(function () {
      automaton = new Automaton({
        title: 'Automaton Title',
        content: 'Automaton Content',
        user: user
      });

      done();
    });
  });

  describe('Method Save', function () {
    it('should be able to save without problems', function (done) {
      this.timeout(10000);
      automaton.save(function (err) {
        should.not.exist(err);
        return done();
      });
    });
    it('should be able to show an error when try to save without title', function (done) {
      automaton.title = '';

      automaton.save(function (err) {
        should.exist(err);
        return done();
      });
    });
  });

  afterEach(function (done) {
    Automaton.remove().exec(function () {
      User.remove().exec(done);
    });
  });
});
