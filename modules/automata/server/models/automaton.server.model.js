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
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  demo: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    trim: true,
    required: 'Title cannot be blank'
  },
  machine: {
    type: String,
    enum: ['tm', 'fsa', 'pda']
  },
  determ: { type: Boolean, default: true },
  tape: {
    position: Number,
    contents: [String]
  },
  stack: [String],
  eles: {
    nodes: [
      {
        data: {
          id: String,
          label: String,
          start: Boolean,
          accept: Boolean
        },
        position: {
          x: Number,
          y: Number
        },
        classes: String
      }
    ],
    edges: [
      {
        data: {
          id: String,
          source: String,
          target: String,
          read: String,
          read_stack: String,
          action: String,
          label: String,
          direction: {
            type: Number,
            default: -90
          },
          sweep: {
            type: Number,
            default: 60
          }
        }
      }
    ]
  },
  alphabet: [String]
});

mongoose.model('Automaton', AutomatonSchema);
