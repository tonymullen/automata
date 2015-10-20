'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Automaton Schema
 */
var AutomatonSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  title: {
    type: String,
    default: 'Untitled automaton',
    trim: true,
//    required: 'Title cannot be blank'
  },
//  content: {
//    type: String,
//    default: '',
//    trim: true
//  },
  states: [{
    statename: { type: String, default: 's' },
    start: Boolean,
    end: Boolean
  }],
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Automaton', AutomatonSchema);
