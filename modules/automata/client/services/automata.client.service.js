'use strict';

//Automata service used for communicating with the automata REST endpoints

angular.module('automata').factory('Automata', ['$resource',
  function ($resource) {
    return $resource('api/automata/:automatonId', {
      articleId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]).factory('peopleGraph', [ '$q', function( $q ){
// use a factory instead of a directive, because cy.js is not just for visualisation; you need access to the graph model and events etc
//angular.module('automata')
  var cy;

  var peopleGraph = function(people){
    var deferred = $q.defer();

    // put people model in cy.js
    var eles = [];

    for( var i = 0; i < people.length; i++ ){
      eles.push({
        group: 'nodes',
        data: {
          id: people[i].id,
          weight: people[i].weight,
          name: people[i].name
        }
      });
    }

    $(function(){ // on dom ready


      cy = cytoscape({
        container: $('#cy')[0],

        style: cytoscape.stylesheet()
          .selector('node')
            .css({
              'content': 'data(name)',
              'height': 80,
              'width': 'mapData(weight, 1, 200, 1, 200)',
               'text-valign': 'center',
                'color': 'white',
                'text-outline-width': 2,
                'text-outline-color': '#888'
             })
          .selector('edge')
            .css({
              'target-arrow-shape': 'triangle'
            })
          .selector(':selected')
            .css({
              'background-color': 'black',
              'line-color': 'black',
              'target-arrow-color': 'black',
              'source-arrow-color': 'black',
              'text-outline-color': 'black'
          }),

        layout: {
          name: 'cose',
          padding: 10
        },

        elements: eles,

        ready: function(){
          deferred.resolve( this );

          cy.on('cxtdrag', 'node', function(e){
            var node = this;
            var dy = Math.abs( e.cyPosition.x - node.position().x );
            var weight = Math.round( dy*2 );

            node.data('weight', weight);

            fire('onWeightChange', [ node.id(), node.data('weight') ]);
          });
        }
      });

    }); // on dom ready

    return deferred.promise;
  };

  peopleGraph.listeners = {};

  function fire(e, args){
    var listeners = peopleGraph.listeners[e];

    for( var i = 0; listeners && i < listeners.length; i++ ){
      var fn = listeners[i];

      fn.apply( fn, args );
    }
  }

  function listen(e, fn){
    var listeners = peopleGraph.listeners[e] = peopleGraph.listeners[e] || [];

    listeners.push(fn);
  }

  peopleGraph.setPersonWeight = function(id, weight){
    cy.$('#' + id).data('weight', weight);
  };

  peopleGraph.onWeightChange = function(fn){
    listen('onWeightChange', fn);
  };

  return peopleGraph;


} ])
.factory('automatonGraph', [ '$q', function( $q ){
  var cy;

  var automatonGraph = function( eles ){

    var deferred = $q.defer();

    $(function(){ // on dom ready
      cy = cytoscape({
        container: $('#cy')[0],
        boxSelectionEnabled: false,
        autounselectify: true,
        layout: {
          //name: 'cose',
          name: 'circle',
//          fit: true,
//          boundingBox: { x1:50, y1:0, x2:250, y2:300 },
//          avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
//          avoidOverlapPadding: 10, // extra spacing around nodes when avoidOverlap: true
//          condense: true,
        },
        style: cytoscape.stylesheet()
          .selector('node')
            .css({
              'content': 'data(name)',
              'text-valign': 'center',
              'color': 'white',
              'text-outline-width': 2,
              'text-outline-color': '#888'
            })
          .selector('edge')
            .css({
              'target-arrow-shape': 'triangle'
            })
          .selector(':selected')
            .css({
              'background-color': 'black',
              'line-color': 'black',
              'target-arrow-color': 'black',
              'source-arrow-color': 'black'
            })
          .selector('.faded')
            .css({
              'opacity': 0.25,
              'text-opacity': 0
            }),
          elements: eles
        }); //cy =
        cy.on('tap', 'node', function(e){
        var node = e.cyTarget;
        var neighborhood = node.neighborhood().add(node);

        cy.elements().addClass('faded');
        neighborhood.removeClass('faded');
        });

        cy.on('tap', function(e){
          cy.add({
              group: "nodes",
              data: { weight: 75 },
              position: { x: e.cyPosition.x, y: e.cyPosition.y }
          });
          console.log(e);
          if( e.cyTarget === cy ){
            cy.elements().removeClass('faded');
          }
        });

        cy.on('cxttap', function(e){
          console.log('rightclick');
          console.log(e);
        });

        // the default values of each option are outlined below:
      var defaults = {
        preview: true, // whether to show added edges preview before releasing selection
        stackOrder: 4, // Controls stack order of edgehandles canvas element by setting it's z-index
        handleSize: 10, // the size of the edge handle put on nodes
        handleColor: '#ff0000', // the colour of the handle and the line drawn from it
        handleLineType: 'ghost', // can be 'ghost' for real edge, 'straight' for a straight line, or 'draw' for a draw-as-you-go line
        handleLineWidth: 1, // width of handle line in pixels
        handleNodes: 'node', // selector/filter function for whether edges can be made from a given node
        hoverDelay: 150, // time spend over a target node before it is considered a target selection
        cxt: false, // whether cxt events trigger edgehandles (useful on touch)
        enabled: true, // whether to start the plugin in the enabled state
        toggleOffOnLeave: false, // whether an edge is cancelled by leaving a node (true), or whether you need to go over again to cancel (false; allows multiple edges in one pass)
        edgeType: function( sourceNode, targetNode ) {
          // can return 'flat' for flat edges between nodes or 'node' for intermediate node between them
          // returning null/undefined means an edge can't be added between the two nodes
          return 'flat';
        },
        loopAllowed: function( node ) {
          // for the specified node, return whether edges from itself to itself are allowed
          return false;
        },
        nodeLoopOffset: -50, // offset for edgeType: 'node' loops
        nodeParams: function( sourceNode, targetNode ) {
          // for edges between the specified source and target
          // return element object to be passed to cy.add() for intermediary node
          return {};
        },
        edgeParams: function( sourceNode, targetNode, i ) {
          // for edges between the specified source and target
          // return element object to be passed to cy.add() for edge
          // NB: i indicates edge index in case of edgeType: 'node'
          return {};
        },
        start: function( sourceNode ) {
          // fired when edgehandles interaction starts (drag on handle)
        },
        complete: function( sourceNode, targetNodes, addedEntities ) {
          // fired when edgehandles is done and entities are added
        },
        stop: function( sourceNode ) {
          // fired when edgehandles interaction is stopped (either complete with added edges or incomplete)
        }
      };

      cy.edgehandles( defaults );

    });

    return deferred.promise;
  };
  return automatonGraph;
}]);
