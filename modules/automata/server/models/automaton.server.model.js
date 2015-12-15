'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/*
*Node Schema

var StateNodeSchema = new Schema({
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
});
*/
/*
*Edge Schema

var EdgeSchema = new Schema({
  data: {
    source: {
      type: Schema.ObjectId,
      ref: 'Node'
    },
    target: {
      type: Schema.ObjectId,
      ref: 'Node'
    },
    read: String,
    action: String,
    label: String
  },
  classes: String
});
*/
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
  eles: {
    nodes: [
    /*  {
        type: Schema.ObjectId,
        ref: 'StateNode'
      }*/
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
      /*
      {
        type: Schema.ObjectId,
        ref: 'Edge'
      }
      */
      { data:
        { source: String,
          target: String,
          read: String,
          action: String,
          label: String
        }
      }
    ]
  }/*,
  nodes: [{
    //stateName: { type: String, default: 's' },
    id: String,
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
  }]*/
});

//mongoose.model('StateNode', StateNodeSchema);
//mongoose.model('Edge', EdgeSchema);
mongoose.model('Automaton', AutomatonSchema);
