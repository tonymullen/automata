/* global cytoscape */
(function () {
  'use strict';

  angular
    .module('automata.services')
    .factory('automatonGraph', automatonGraph);

  automatonGraph.$inject = ['$q', 'AutomataService'];

  function automatonGraph($q, AutomataService) {

    /*  use a factory instead of a directive,
    *   because cy.js is not just for visualisation;
    *   you need access to the graph model and
    *   events etc
    */
    var cy;

    function resetElementColors() {
      cy.$('node').removeClass('running');
      cy.$('edge').removeClass('running');
      cy.$('node').removeClass('active');
      cy.$('edge').removeClass('active');
      cy.$('node').removeClass('rejected');
      cy.$('node').removeClass('accepting');
      angular.element(document.querySelector('.tape-content')).removeClass('accepted');
      angular.element(document.querySelector('.tape-content')).removeClass('rejected');
    }

    var automatonGraph = function(eles, machine) {
      var deferred = $q.defer();

      $(function() { // on dom ready
        cy = cytoscape({
          container: $('#cy')[0],
          boxSelectionEnabled: false,
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
            .selector('node.submachine')
              .css({
                'content': 'data(label)',
                'text-valign': 'center',
                'color': 'black',
                'background-color': 'white',
                'border-style': 'solid',
                'border-width': '2px',
                'shape': 'rectangle'
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
                'width': 1,
                'label': 'data(label)',
                'edge-text-rotation': 'none',
                'curve-style': 'bezier',
                'control-point-step-size': '70px',
                'target-arrow-shape': 'triangle',
                'line-color': 'black',
                'target-arrow-color': 'black',
                'color': 'white',
                'text-outline-width': 2,
                'text-outline-color': '#555',
                'loop-direction': '-90deg',
                'loop-sweep': '1rad'
              })
            .selector('edge[direction]')
              .css({
                'loop-direction': 'data(direction)'
              })
            .selector('edge[sweep]')
              .css({
                'loop-sweep': 'data(sweep)'
              })
            .selector('.edgehandles-preview')
              .css({
                'loop-direction': '-90deg',
                'loop-sweep': '1rad'
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
                .selector('node.running')
                  .css({
                    'color': 'Gray',
                    'background-color': 'lightGray',
                    'border-color': 'Gray'
                  })
                .selector('node.running.active')
                  .css({
                    'color': 'black',
                    'background-color': 'white',
                    'border-color': 'black'
                  })
                .selector('node.rejected')
                  .css({
                    'border-color': 'red'
                  })
                .selector('node.accepting')
                  .css({
                    'border-color': 'LimeGreen'
                  })
                .selector('edge.running')
                  .css({
                    'line-color': 'Gray',
                    'target-arrow-color': 'Gray'
                  })
                .selector('edge.running.active')
                  .css({
                    'line-color': 'Black',
                    'target-arrow-color': 'Black'
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

            var tapx;
            var tapy;

            this.on('vmousedown', function(e) {
              // for node placment with context menu
              clickstart = e.timeStamp;
              tapx = e.cyPosition.x;
              tapy = e.cyPosition.y;
            });

            function doMouseUp(e) {
              var element = e.cyTarget;
              clickstop = e.timeStamp - clickstart;
              if (clickstop >= 750) {
                resetElementColors();
                cy.remove('.toDelete');
                var deleted = element.data('label');
                if (del && element.isNode() && element.hasClass('nnode')) {
                  cy.nodes('.nnode').forEach(function(n) {
                    if (n.data('label') && n.data('label') > deleted) {
                      var newLabel = n.data('label') - 1;
                      n.data('label', newLabel);
                    }
                  });
                }
                if (del && element.isNode() && element.hasClass('submachine')) {
                  cy.nodes('.submachine').forEach(function(n) {
                    if (n.data('label') &&
                      Number(n.data('label').replace('M', '')) > Number(deleted.replace('M', ''))) {
                      var newLabel = 'M' + String(Number(n.data('label').replace('M', '')) - 1);
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

            var edgedrag = false;
            var draggedEdge;
            this.on('vmousedown', 'edge', function(e) {
              cy.panningEnabled(false);
              draggedEdge = e.cyTarget;
              edgedrag = true;
            });

            this.on('vmousemove', function(e) {
              if (edgedrag) {
                var dx = e.cyPosition.x - draggedEdge.source().position().x;
                var dy = e.cyPosition.y - draggedEdge.source().position().y;
                var angle = Math.atan2(dy, dx);
                if (angle > -Math.PI / 8 || (angle >= 0 && angle <= Math.PI / 8)) {
                  draggedEdge.data({ 'direction': '0' });
                  draggedEdge.css({ 'loop-direction': '0' });
                } else if (angle >= -Math.PI * 3 / 8) {
                  draggedEdge.data({ 'direction': '-45deg' });
                  draggedEdge.css({ 'loop-direction': '-45deg' });
                } else if (angle >= -Math.PI * 5 / 8) {
                  draggedEdge.data({ 'direction': '-90deg' });
                  draggedEdge.css({ 'loop-direction': '-90deg' });
                } else if (angle >= -Math.PI * 7 / 8) {
                  draggedEdge.data({ 'direction': '-135deg' });
                  draggedEdge.css({ 'loop-direction': '-135deg' });
                } else if (angle < -Math.PI * 7 / 8 || angle > Math.PI * 7 / 8) {
                  draggedEdge.data({ 'direction': '-180deg' });
                  draggedEdge.css({ 'loop-direction': '-180deg' });
                }
                if (angle >= Math.PI * 5 / 8) {
                  draggedEdge.data({ 'direction': '135deg' });
                  draggedEdge.css({ 'loop-direction': '135deg' });
                } else if (angle >= Math.PI * 3 / 8) {
                  draggedEdge.data({ 'direction': '90deg' });
                  draggedEdge.css({ 'loop-direction': '90deg' });
                } else if (angle >= Math.PI / 8) {
                  draggedEdge.data({ 'direction': '45deg' });
                  draggedEdge.css({ 'loop-direction': '45deg' });
                }
              }
            });

            this.on('vmouseup', function(e) {
              edgedrag = false;
              cy.panningEnabled(true);
            });

            function doTapHold(e) {
              var element = e.cyTarget;
              if (!(element.id() === 'start' || element.id() === '0')) {
                element.addClass('toDelete');
                del = true;
              }
            }

            this.on('drag', 'node', function(e) {
              var node = e.cyTarget;
              node.removeClass('toDelete');
            });

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

            function toggleAccept(node) {
              if (!node.data().accept) {
                node.data().accept = true;
                node.addClass('accept');
                resetElementColors();
                if (node.data().start) {
                  cy.$('#start').position({
                    x: cy.$('#start').position('x') - 2
                  });
                }
              } else {
                node.data().accept = false;
                node.removeClass('accept');
                resetElementColors();
                if (node.data().start) {
                  cy.$('#start').position({
                    x: cy.$('#start').position('x') + 2
                  });
                }
              }
            }

            function editSubmachine(node) {
              console.log('gonna edit the submachine for ' + node);
            }

            if (machine !== 'tm') { // accept states only for FSAs and PDAs
              this.on('click', 'node', function(e) {
                var node = e.cyTarget;
                if (!node.hasClass('submachine')) {
                  toggleAccept(node);
                } else {
                  editSubmachine(node);
                }
                if (node.hasClass('comment')) {
                  console.log(node.data().content);
                }
              });

              this.on('doubleTap', function(e) {
                var node = e.cyTarget;
                if (!node.hasClass('submachine')) {
                  toggleAccept(node);
                } else {
                  editSubmachine(node);
                }
                node.trigger('mouseout');
              });
            }

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
              handleColor: 'rgba(167, 164, 138, 0.70)', // the colour of the handle and the line drawn from it
              handleLineType: 'ghost', // can be 'ghost' for real edge, 'straight' for a straight line, or 'draw' for a draw-as-you-go line
              handleLineWidth: 1, // width of handle line in pixels
              handleNodes: '.enode', // selector/filter function for whether edges can be made from a given node
              hoverDelay: 150, // time spend over a target node before it is considered a target selection
              cxt: false, // whether cxt events trigger edgehandles (useful on touch)
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
                resetElementColors();
                addedEntities[0].data({ 'direction': '-90deg', 'sweep': '1rad' });
                angular.element('[ng-controller=AddEdgeModalController]').scope().open('sm', addedEntities);
              },
              stop: function(sourceNode) {
                // fired when edgehandles interaction is stopped
                // (either complete with added edges or incomplete)

              }
            };
            this.edgehandles(defaults);

            var menuDefaults = {
              menuRadius: 100, // the radius of the circular menu in pixels
              selector: 'core', // elements matching this Cytoscape.js selector will trigger cxtmenus
              commands: [ // an array of commands to list in the menu or a function that returns the array
                {
                  content: '<span class="cxtmenutext noSelect">Add<br>state</span>', // html/text content to be displayed in the menu
                  select: function(e) { // a function to execute when the command is selected
                    resetElementColors();
                    if (e === cy) {
                      var ind = cy.nodes('.nnode').length;
                      cy.add({
                        group: 'nodes',
                        data: { label: ind,
                          weight: 75 },
                        classes: 'enode nnode',
                        position: { x: tapx, y: tapy }
                      });
                    }// `ele` holds the reference to the active element
                    // necessary hack to ensure that newly created
                    // nodes don't flicker. Toggles accept state on start state
                    toggleAccept(cy.nodes().eq(1));
                    toggleAccept(cy.nodes().eq(1));
                  }
                },
                {
                  content: '<span class="cxtmenutext noSelect">Add<br>comment</span>', // html/text content to be displayed in the menu
                  select: function(e) { // a function to execute when the command is selected
                    // TODO: to add a comment, we get the text from the user (can do this just by browser for now): node can have 1st few words
                    // of text (or none at all) and when the user mouses over it they can see the full text (w/ username, timestamp, etc.)
                    var comment = prompt('Please enter a comment', '');
                    // TODO: determine visibility, shape of comment
                    var partialComment = comment.substring(0, 4);
                    if (comment.length > 5) partialComment += "...";
                    if (e === cy) {
                      cy.add({
                        group: 'nodes',
                        data: {
                          label: partialComment,
                          content: comment,
                          weight: 75
                        },
                        classes: 'comment',
                        position: { x: tapx, y: tapy }
                      });
                    }
                    // necessary hack to ensure that newly created
                    // nodes don't flicker. Toggles accept state on start state
                    toggleAccept(cy.nodes().eq(1));
                    toggleAccept(cy.nodes().eq(1));
                  }
                },
                { // example command
                  // fillColor: 'rgba(100, 100, 100, 0.75)', // optional: custom background color for item
                  content: '<span class="cxtmenutext noSelect">Add<br>submachine</span>', // html/text content to be displayed in the menu
                  select: function(e) { // a function to execute when the command is selected
                    resetElementColors();
                    if (e === cy) {
                      var ind = cy.nodes('.submachine').length;
                      var smlabel = 'M' + ind;
                      cy.add({
                        group: 'nodes',
                        data: { label: smlabel,
                          weight: 75 },
                        classes: 'submachine enode',
                        position: { x: tapx, y: tapy }
                      });
                    }// `ele` holds the reference to the active element
                    // necessary hack to ensure that newly created
                    // nodes don't flicker. Toggles accept state on start state
                    toggleAccept(cy.nodes().eq(1));
                    toggleAccept(cy.nodes().eq(1));
                  }
                }
              ], // function( ele ){ return [  ] }, // example function for commands
              fillColor: 'rgba(0, 0, 0, 0.75)', // the background colour of the menu
              activeFillColor: 'rgba(167, 164, 138, 0.50)', // the colour used to indicate the selected command
              activePadding: 20, // additional size in pixels for the active command
              indicatorSize: 24, // the size in pixels of the pointer to the active command
              separatorWidth: 3, // the empty spacing in pixels between successive commands
              spotlightPadding: 4, // extra spacing in pixels between the element and the spotlight
              minSpotlightRadius: 24, // the minimum radius in pixels of the spotlight
              maxSpotlightRadius: 38, // the maximum radius in pixels of the spotlight
              openMenuEvents: 'cxttapstart taphold', // cytoscape events that will open the menu (space separated)
              itemColor: 'white', // the colour of text in the command's content
              itemTextShadowColor: 'black', // the text shadow colour of the command's content
              zIndex: 9999 // the z-index of the ui div
            };
            var cxtmenuApi = this.cxtmenu(menuDefaults);
          }
        });
      });
      return deferred.promise;
    };
    return automatonGraph;
  }
}());
