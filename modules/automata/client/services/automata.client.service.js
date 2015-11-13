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
    });

    return deferred.promise;
  };
  return automatonGraph;
}]);
