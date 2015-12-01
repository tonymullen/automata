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
    required: 'Title cannot be blank'
  },
  machine: {
    type: String,
    enum: ['tm','fsa','pda']
  },
  deterministic: { type: Boolean, default: true },
  states: [{
    stateName: { type: String, default: 's' },
    stateID: Number,
    position: { x: Number, y: Number },
    start: Boolean,
    accept: Boolean
  }],
  edges: [{
    source: Number,
    target: Number,
    read: { type: String, default: '_' },
    action: { type: String, default: '' },
    label: String
  }],
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Automaton', AutomatonSchema);
