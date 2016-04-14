/* global cytoscape */
(function () {
  'use strict';

  angular
    .module('automata.services')
    .factory('automatonGraph', automatonGraph);

  automatonGraph.$inject = ['$q'];

  function automatonGraph($q) {

    /*  use a factory instead of a directive,
    *   because cy.js is not just for visualisation;
    *   you need access to the graph model and
    *   events etc
    */
    var cy;

    var automatonGraph = function(eles, machine) {
      var deferred = $q.defer();

      $(function() { // on dom ready
        cy = cytoscape({
          container: $('#cy')[0],
          boxSelectionEnabled: true,
          autounselectify: true,
          layout: {
            // name: 'cose',
            name: 'preset',
            // fit: true,
            // boundingBox: { x1:50, y1:0, x2:250, y2:300 },
            avoidOverlap: true // prevents node overlap, may overflow boundingBox if not enough space
            // avoidOverlapPadding: 10, // extra spacing around nodes when avoidOverlap: true
            // condense: true,
          },
          style: cytoscape.stylesheet()
            .selector('node')
              .css({
                'content': 'data(label)',
                'text-valign': 'center',
                'color': 'black',
                'background-color': 'white',
                'border-style': 'solid',
                'border-width': '2px'
              })
            .selector('.accept')
              .css({
                'border-style': 'double',
                'border-width': '6px'
              })
            .selector('.toDelete')
              .css({
                'overlay-color': 'red'
              })
            .selector('edge')
              .css({
                'label': 'data(label)',
                'edge-text-rotation': 'autorotate',
                'curve-style': 'bezier',
                'control-point-step-size': '70px',
                'target-arrow-shape': 'triangle',
                'line-color': 'black',
                'target-arrow-color': 'black',
                'color': 'white',
                'text-outline-width': 2,
                'text-outline-color': '#555'
              })
            .selector(':selected')
              .css({
                'background-color': 'black',
                'line-color': 'black',
                'target-arrow-color': 'black',
                'source-arrow-color': 'black'
              })
              .selector('.autorotate')
                .css({
                  'edge-text-rotation': 'autorotate'
                })
              .selector('.startparent')
                .css({
                  'border-width': '0',
                  'background-opacity': '0',
                  'content': ''
                })
              .selector('.startmarker')
                .css({
                  'border-style': 'solid',
                  'border-width': '2px',
                  'content': '',
                  'shape': 'polygon',
                  'shape-polygon-points': '1 0 0.5 -0.4 0.5 0.4'
                })
                .selector('node.active')
                  .css({
                    'color': 'white',
                    'background-color': 'DarkGray',
                    'border-color': 'Gray'
                  })
                .selector('node.rejected')
                  .css({
                    'border-color': 'red'
                  })
                .selector('node.accepting')
                  .css({
                    'border-color': 'LimeGreen'
                  })
                .selector('edge.active')
                  .css({
                    'line-color': 'Gray',
                    'target-arrow-color': 'Gray'
                  })
                .selector('edge.accepting.active')
                  .css({
                    'line-color': 'LimeGreen',
                    'target-arrow-color': 'LimeGreen'
                  }),
          elements: eles,
          ready: function() {
            deferred.resolve(this);
            var clickstart;
            var clickstop = 0;
            var del = false;

            this.on('vmousedown', function(e) {
              // var node = e.cyTarget;
              clickstart = e.timeStamp;
            });

            function doMouseUp(e) {
              var element = e.cyTarget;
              clickstop = e.timeStamp - clickstart;
              if (clickstop >= 750) {
                cy.remove('.toDelete');
                var deleted = element.data('label');
                if (del && element.isNode()) {
                  cy.nodes().forEach(function(n) {
                    if (n.data('label') && n.data('label') > deleted) {
                      var newLabel = n.data('label') - 1;
                      n.data('label', newLabel);
                    }
                  });
                }
              }
              element.removeClass('toDelete');
              clickstart = 0;
              del = false;
            }

            this.on('vmouseup', 'node', function(e) {
              doMouseUp(e);
            });

            this.on('vmouseup', 'edge', function(e) {
              doMouseUp(e);
            });

            function doTapHold(e) {
              var element = e.cyTarget;
              if (!(element.id() === 'start' || element.id() === '0')) {
                element.addClass('toDelete');
                del = true;
              }
            }

            this.on('taphold', 'node', function(e) {
              doTapHold(e);
            });

            this.on('taphold', 'edge', function(e) {
              doTapHold(e);
            });

            var tappedBefore;
            var tappedTimeout;
            this.on('tap', 'node', function(e) {
              var node = e.cyTarget;
              if (tappedTimeout && tappedBefore) {
                clearTimeout(tappedTimeout);
              }
              if (tappedBefore === node) {
                node.trigger('doubleTap');
                tappedBefore = null;
              } else {
                tappedTimeout = setTimeout(function() {
                  tappedBefore = null;
                }, 300);
                tappedBefore = node;
              }
            });

            if (machine !== 'tm') { // accept states only for FSAs and PDAs
              this.on('click', 'node', function(e) {
                var node = e.cyTarget;
                if (!node.data().accept) {
                  node.data().accept = true;
                  node.addClass('accept');
                  if (node.data().start) {
                    cy.$('#start').position({
                      x: cy.$('#start').position('x') - 2
                    });
                  }
                } else {
                  node.data().accept = false;
                  node.removeClass('accept');
                  if (node.data().start) {
                    cy.$('#start').position({
                      x: cy.$('#start').position('x') + 2
                    });
                  }
                }
              });

              this.on('doubleTap', function(e) {
                var node = e.cyTarget;
                if (!node.data().accept) {
                  node.data().accept = true;
                  node.addClass('accept');
                  if (node.data().start) {
                    cy.$('#start').position({
                      x: cy.$('#start').position('x') - 2
                    });
                  }
                } else {
                  node.data().accept = false;
                  node.removeClass('accept');
                  if (node.data().start) {
                    cy.$('#start').position({
                      x: cy.$('#start').position('x') + 2
                    });
                  }
                }
              });
            }

            this.on('tap', function(e) {
              if (e.cyTarget === cy) {
                var ind = cy.nodes().length - 1;
                cy.add({
                  group: 'nodes',
                  data: { label: ind,
                          weight: 75 },
                  classes: 'enode',
                  position: { x: e.cyPosition.x, y: e.cyPosition.y }
                });
              //  cy.elements().removeClass('faded');
              }
            });

            this.on('cxttap', 'node', function(e) {
              var node = e.cyTarget;
              node.removeClass('toDelete');
              del = false;
            });

            this.on('drag', '#0', function(e) {
              cy.$('#start').position({
                x: cy.$('#0').position('x') - (e.cyTarget.data().accept ? 34 : 32),
                y: cy.$('#0').position('y')
              });
            });

            this.$('#start').ungrabify();
            this.$('#start').unselectify();
            this.$('#start').position({
              x: this.$('#0').position('x') - 32,
              y: this.$('#0').position('y')
            });

            this.on('mouseout', 'node', function() {
              // ugly hack to force edghandles to
              // disappear through re-rendering
              cy.panBy({ x: 0, y: 0 });
            });

            var defaults = {
              preview: true, // whether to show added edges preview before releasing selection
              stackOrder: 4, // Controls stack order of edgehandles canvas element by setting it's z-index
              handleSize: 15, // the size of the edge handle put on nodes
              handleColor: '#b395bb', // the colour of the handle and the line drawn from it
              handleLineType: 'ghost', // can be 'ghost' for real edge, 'straight' for a straight line, or 'draw' for a draw-as-you-go line
              handleLineWidth: 1, // width of handle line in pixels
              handleNodes: '.enode', // selector/filter function for whether edges can be made from a given node
              hoverDelay: 150, // time spend over a target node before it is considered a target selection
              cxt: true, // whether cxt events trigger edgehandles (useful on touch)
              enabled: true, // whether to start the plugin in the enabled state
              toggleOffOnLeave: true, // whether an edge is cancelled by leaving a node (true), or whether you need to go over again to cancel (false; allows multiple edges in one pass)
              edgeType: function(sourceNode, targetNode) {
                // can return 'flat' for flat edges between nodes or 'node' for intermediate node between them
                // returning null/undefined means an edge can't be added between the two nodes
                return 'flat';
              },
              loopAllowed: function(node) {
                // for the specified node, return whether edges from itself to itself are allowed
                return true;
              },
              nodeLoopOffset: -50, // offset for edgeType: 'node' loops
              nodeParams: function(sourceNode, targetNode) {
                // for edges between the specified source and target
                // return element object to be passed to cy.add() for intermediary node
                return {};
              },
              edgeParams: function(sourceNode, targetNode, i) {
                // for edges between the specified source and target
                // return element object to be passed to cy.add() for edge
                // NB: i indicates edge index in case of edgeType: 'node'
                return {};
              },
              start: function(sourceNode) {
                // fired when edgehandles interaction starts (drag on handle)
              },
              complete: function(sourceNode, targetNodes, addedEntities) {
                angular.element('[ng-controller=AddEdgeModalController]').scope().open('sm', addedEntities);

              },
              stop: function(sourceNode) {
                // fired when edgehandles interaction is stopped
                // (either complete with added edges or incomplete)
              }
            };
            this.edgehandles(defaults);
          }
        });
      });

      return deferred.promise;
    };
    return automatonGraph;
  }
}());
