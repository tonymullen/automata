'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
* Problem Schema
*/

var TestSchema = new Schema({
  machine: {
    type: [{
      type: String,
      enum: ['automaton', 'turingMachine']
    }],
    default: ['automaton'],
    required: 'What sort of machine is this test for?'
  },
  string: {
    type: String,
    required: 'Please give an input string'
  },
  output: {
    type: String
  },
  accepts: Boolean
});

var ProblemSchema = new Schema({
  name: {
    type: String,
    required: 'Please give a name for the problem'
  },
  description: {
    type: String,
    required: 'Please give a description for the problem'
  },
  created: {
    type: Date,
    default: Date.now
  },
  tests: [{
    type: Schema.ObjectId,
    ref: 'Test'
  }],
  solution: {
    type: Schema.ObjectId,
    ref: 'Automaton'
  },
  submissions: [{
    type: Schema.ObjectId,
    ref: 'Automaton'
  }]
});

/**
 * Classroom Schema
 */
var ClassroomSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Classroom name',
    trim: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  students: [{
    type: Schema.ObjectId,
    ref: 'User'
  }],
  problems: [{
    type: Schema.ObjectId,
    ref: 'Problem'
  }]
});

mongoose.model('Test', TestSchema);
mongoose.model('Problem', ProblemSchema);
mongoose.model('Classroom', ClassroomSchema);
