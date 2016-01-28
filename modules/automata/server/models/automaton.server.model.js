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
  determ: { type: Boolean, default: true },
  tape: {
    position: Number,
    contents: [String]
  },
  eles: {
    nodes: [
      {
        data: {
          id: String,
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
      { data:
        { source: String,
          target: String,
          read: String,
          action: String,
          label: String
        }
      }
    ]
  }
});

mongoose.model('Automaton', AutomatonSchema);
