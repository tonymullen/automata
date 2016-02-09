'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function () {
  // Init module configuration options
  var applicationModuleName = 'mean';
  var applicationModuleVendorDependencies = ['ngResource', 'ngAnimate', 'ngMessages', 'ui.router', 'ui.bootstrap', 'ui.utils', 'angularFileUpload'];

  // Add a new vertical module
  var registerModule = function (moduleName, dependencies) {
    // Create angular module
    angular.module(moduleName, dependencies || []);

    // Add the module to the AngularJS configuration file
    angular.module(applicationModuleName).requires.push(moduleName);
  };

  return {
    applicationModuleName: applicationModuleName,
    applicationModuleVendorDependencies: applicationModuleVendorDependencies,
    registerModule: registerModule
  };
})();

'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider', '$httpProvider',
  function ($locationProvider, $httpProvider) {
    $locationProvider.html5Mode(true).hashPrefix('!');

    $httpProvider.interceptors.push('authInterceptor');
  }
]);

angular.module(ApplicationConfiguration.applicationModuleName).run(["$rootScope", "$state", "Authentication", function ($rootScope, $state, Authentication) {

  // Check authentication before changing state
  $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
    if (toState.data && toState.data.roles && toState.data.roles.length > 0) {
      var allowed = false;
      toState.data.roles.forEach(function (role) {
        if ((role === 'guest') || (Authentication.user && Authentication.user.roles !== undefined && Authentication.user.roles.indexOf(role) !== -1)) {
          allowed = true;
          return true;
        }
      });

      if (!allowed) {
        event.preventDefault();
        if (Authentication.user !== undefined && typeof Authentication.user === 'object') {
          $state.go('forbidden');
        } else {
          $state.go('authentication.signin').then(function () {
            storePreviousState(toState, toParams);
          });
        }
      }
    }
  });

  // Record previous state
  $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
    storePreviousState(fromState, fromParams);
  });

  // Store previous state
  function storePreviousState(state, params) {
    // only store this state if it shouldn't be ignored
    if (!state.data || !state.data.ignoreState) {
      $state.previous = {
        state: state,
        params: params,
        href: $state.href(state, params)
      };
    }
  }
}]);

//Then define the init function for starting up the application
angular.element(document).ready(function () {
  //Fixing facebook bug with redirect
  if (window.location.hash && window.location.hash === '#_=_') {
    if (window.history && history.pushState) {
      window.history.pushState('', document.title, window.location.pathname);
    } else {
      // Prevent scrolling by storing the page's current scroll offset
      var scroll = {
        top: document.body.scrollTop,
        left: document.body.scrollLeft
      };
      window.location.hash = '';
      // Restore the scroll offset, should be flicker free
      document.body.scrollTop = scroll.top;
      document.body.scrollLeft = scroll.left;
    }
  }

  //Then init the app
  angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('automata',['windows','ui.bootstrap']);

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('itsADrag');
ApplicationConfiguration.registerModule('resizeIt');
ApplicationConfiguration.registerModule('windows',['itsADrag','resizeIt']);

'use strict';

// Use Application configuration module to register a new module
ApplicationConfiguration.registerModule('core');
ApplicationConfiguration.registerModule('core.admin', ['core']);
ApplicationConfiguration.registerModule('core.admin.routes', ['ui.router']);

'use strict';

// Use Application configuration module to register a new module
ApplicationConfiguration.registerModule('users', ['core']);
ApplicationConfiguration.registerModule('users.admin', ['core.admin']);
ApplicationConfiguration.registerModule('users.admin.routes', ['core.admin.routes']);

'use strict';

// Configuring the Automata module
angular.module('automata').run(['Menus',
  function (Menus) {
    // Add the automata dropdown item
    Menus.addMenuItem('topbar', {
      title: 'Automata',
      state: 'automata',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'automata', {
      title: 'List Automata',
      state: 'automata.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'automata', {
      title: 'Create New Turing Machine',
      state: 'automata.create-tm',
      roles: ['user']
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'automata', {
      title: 'Create New Finite State Automaton',
      state: 'automata.create-fsa',
      roles: ['user']
    });

      // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'automata', {
      title: 'Create New Pushdown Automaton',
      state: 'automata.create-pda',
      roles: ['user']
    });
  }
]);

'use strict';

// Setting up route
angular.module('automata').config(['$stateProvider',
  function ($stateProvider) {
    // Articles state routing
    $stateProvider
      .state('automata', {
        abstract: true,
        url: '/automata',
        template: '<ui-view/>'
      })
      .state('automata.list', {
        url: '',
        templateUrl: 'modules/automata/client/views/list-automata.client.view.html'
      })
      .state('automata.create-tm', {
        url: '/create-tm',
        templateUrl: 'modules/automata/client/views/create-automaton.client.view.html',
        data: {
          roles: ['user', 'admin'],
          type: 'tm'
        }
      })
      .state('automata.create-fsa', {
        url: '/create-fsa',
        templateUrl: 'modules/automata/client/views/create-automaton.client.view.html',
        data: {
          roles: ['user', 'admin'],
          type: 'fsa'
        }
      })
      .state('automata.create-pda', {
        url: '/create-pda',
        templateUrl: 'modules/automata/client/views/create-automaton.client.view.html',
        data: {
          roles: ['user', 'admin'],
          type: 'pda'
        }
      })
      .state('automata.view', {
        url: '/:automatonId',
        templateUrl: 'modules/automata/client/views/view-automaton.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      });
  }
]);

'use strict';

angular.module('automata').controller('AddEdgeModalController', ['$scope', '$uibModal', '$log',
function ($scope, $uibModal, $log) {

  $scope.open = function (size, addedEntities) {
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'addEdgeModalContent.html',
      controller: 'AddEdgeModalInstanceCtrl',
      backdrop: 'static',
      size: size,
      resolve: {
        addedEntities: function () {
          return addedEntities;
        }
      }
    });
    modalInstance.result.then(function () {

    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };

}]);

// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $uibModal service used above.

angular.module('automata').controller('AddEdgeModalInstanceCtrl',
['$scope', '$uibModalInstance', 'addedEntities',
function ($scope, $uibModalInstance, addedEntities) {
  $scope.addedEntities = addedEntities;

  $scope.ok = function () {
    var read = $scope.labels.read.toUpperCase();
    var act = $scope.labels.act.toUpperCase();
    addedEntities.data('read', read);
    addedEntities.data('action', act);
    addedEntities.data('label', read +':'+ act);
    $uibModalInstance.close();
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };

}]);

'use strict';

// Automata controller

angular.module('automata').controller('AutomataController', ['$scope', '$state', '$stateParams', '$location', '$timeout', '$window', 'Authentication', 'Automata', 'automatonGraph',
function ($scope, $state, $stateParams, $location, $timeout, $window, Authentication, Automata, automatonGraph) {
  var cy; //ref to cy

  var empty_tape = [];
  for(var i = 0; i < 50; i++){
    empty_tape.push(' ');
  }

  $scope.authentication = Authentication;

  $scope.labels = { read: '', act: '' };

  $scope.createOrUpdate = function(isValid){
    if ($scope.automaton._id){
      $scope.update(isValid);
    } else {
      $scope.create(isValid);
    }
  };

  // Create new Automaton in the database
  $scope.create = function (isValid) {
    //var automaton;
    $scope.error = null;
    if (!isValid) {
      $scope.$broadcast('show-errors-check-validity', 'automatonForm');
      return false;
    }

    $scope.automaton.eles.nodes = cy.nodes().jsons();
    $scope.automaton.eles.edges = cy.edges().jsons();

    var automaton = $scope.automaton;

    automaton.$save(function (response) {
        // Clear form fields
        //$scope.title = '';
      $scope.automaton = Automata.get({
        automatonId: response._id
      },function(){});
    }, function (errorResponse) {
      $scope.error = errorResponse.data.message;
    });
  };

  // Remove existing Automaton
  $scope.remove = function (automaton) {
    if (automaton) {
      automaton.$remove();
      for (var i in $scope.automata) {
        if ($scope.automata[i] === automaton) {
          $scope.automata.splice(i, 1);
        }
      }
    } else {
      $scope.automaton.$remove(function () {
        $location.path('automata');
      });
    }
  };

  // Update existing Automaton
  $scope.update = function (isValid) {
    $scope.error = null;
    if (!isValid) {
      $scope.$broadcast('show-errors-check-validity', 'automatonForm');
      return false;
    }

    $scope.automaton.eles.nodes = cy.nodes().jsons();
    $scope.automaton.eles.edges = cy.edges().jsons();

    var automaton = $scope.automaton;
    automaton.$update(function () {

    }, function (errorResponse) {
      $scope.error = errorResponse.data.message;
    });

  };

  // Find a list of Automata
  $scope.find = function () {
    $scope.automata = Automata.query();
  };

  // Find existing Automata
  $scope.findOne = function () {
    $scope.automaton = Automata.get({
      automatonId: $stateParams.automatonId
    },function(){
      setUpGraph();
    });
  };

  $scope.onTextClick = function ($event) {
    $event.target.blur();
    $event.target.focus();
  };

  $scope.focusNext = function(event, index){
    //changes focus to the next tape cell when a key is pressed
    var nextInd;
    if(event.keyCode === 8){
      $scope.automaton.tape.contents[index] = String.fromCharCode(event.keyCode);
      //backspace key
      if(index > 0){
        nextInd = index - 1;
      }else{
        nextInd = index;
      }
    }else if(event.keyCode === 37){
      //leftarrow
      if(index > 0){
        nextInd = index - 1;
      }else{
        $scope.automaton.tape.contents.unshift(' ');
        nextInd = 0;
        angular.element(document.querySelector('.cell-'+nextInd))[0].blur();
      }
    }else{
      $scope.automaton.tape.contents[index] = String.fromCharCode(event.keyCode);
      nextInd = index + 1;
      if($scope.automaton.tape.contents.length === nextInd){
        $scope.automaton.tape.contents.push(' ');
      }
    }
    $timeout(function(){
    //  angular.element(document.querySelector('.cell-'+index))[0].blur();
      angular.element(document.querySelector('.cell-'+nextInd))[0].focus();
    }, 0);
  };

  if($state.current.data && $state.current.data.type){
    $scope.automaton = new Automata({
      title: 'untitled automaton',
      machine: $state.current.data.type,
      eles: {
        nodes: [
          { data: { id: 'start' }, classes: 'startmarker' },
          { data: { id: '0', start: true }, classes: 'enode', position: { x: 0, y: 0 } }],
        edges: []
      },
      tape: {
        position: 0,
        contents: empty_tape
      }
    });
    setUpGraph();
  }

  function setUpGraph(){
    /* CYTOSCAPE */
    automatonGraph($scope.automaton.eles).then(function(automatonCy){
      cy = automatonCy;
      $scope.cyLoaded = true;
    });
  }
}]);

'use strict';

/***** Draggable Library *****/

angular.module('itsADrag',[])

/**
  Possible element attributes:
    1.  template
    2.  id
    3.  options - json of jquery ui draggable options
    4.  group
    5.  placeholder
**/
.directive('draggable',[function(){
  return {
    restrict : 'AE',
    link : function(scope,el,attrs){
      scope.minimized = false;
      // draggable object properties
      scope.obj = {
        id : null,
        content : '',
        group : null
      };
      scope.placeholder = false;

      /*** Setup ***/

      scope.obj.content = el.html(); // store object's content

      if(angular.isDefined(attrs.id))
        scope.obj.id = attrs.id;

      if(angular.isDefined(attrs.placeholder))
        scope.placeholder = scope.$eval(attrs.placeholder);

      // options for jQuery UI's draggable method
      var opts = (angular.isDefined(attrs.draggable)) ? scope.$eval(attrs.draggable) : {};

      if(angular.isDefined(attrs.group)){
        scope.obj.group = attrs.group;
        opts.stack = '.' + attrs.group;
      }

      // event handlers
      var evts = {
        start : function(evt,ui){
          if(scope.placeholder) // ui.helper is jQuery object
            ui.helper.wrap('<div class="dragging"></div>');

          scope.$apply(function(){ // emit event in angular context
            scope.$emit('draggable.started',{ obj: scope.obj });
          }); // end $apply
        }, // end start

        drag : function(evt){
          scope.$apply(function(){ // emit event in angular context
            scope.$emit('draggable.dragging');
          }); // end $apply
        }, // end drag

        stop : function(evt,ui){
          if(scope.placeholder)
            ui.helper.unwrap();

          scope.$apply(function(){ // emit event in angular context
            scope.$emit('draggable.stopped');
          }); // end $apply
        } // end stop
      }; // end evts

      // combine options and events
      var options = angular.extend({},opts,evts);
      el.draggable(options); // make element draggable
    } // end link
  }; // end return
}]) // end draggable

.run(['$templateCache',function($templateCache){
  $templateCache.put('/tmpls/draggable/default','<div ng-transclude></div>');
}]); // end itsADrag.run

angular.module('resizeIt',[])
/**
  jQuery UI resizable adds exact pixel width and heights to the element via a style tag.
**/
.directive('resizeable',['$timeout', function($timeout){
  return {
    restrict : 'A',
    link : function(scope,el,attrs,ctrlr){
      scope.obj = {
        el : null,
        id : null,
        size : null // {width,height}
      };

      /*** Setup ***/

      scope.obj.el = el; // save handle to element

      if(angular.isDefined(attrs.id))
        scope.obj.id = attrs.id;

      var opts = (angular.isDefined(attrs.resizeable)) ? scope.$eval(attrs.resizeable) : {};

      var evts = {
        create : function(evt,ui){
          $timeout(function(){
            scope.$emit('resizeable.create',{ obj: scope.obj });
          });
        },// end create

        start : function(evt,ui){
          scope.$apply(function(){
            scope.$emit('resizeable.start',{ obj: scope.obj });
          });
        }, // end start

        stop : function(evt,ui){
          scope.$apply(function(){
            scope.$emit('resizeable.stop',{ 'ui': ui });
            scope.obj.size = angular.copy(ui.size);
            //console.log(scope.obj.size);
          });
        }, // end stop

        resize : function(evt,ui){
          scope.$apply(function(){
            scope.$emit('resizeable.resizing');
          });
        } // end resize
      }; // end evts

      var options = angular.extend({},opts,evts);
      el.resizable(options);

      /*** Listeners ***/

      scope.$on('resizeable.set.width',function(evt,params){
        if(angular.isDefined(params.width))
          el.css('width',parseInt(params.width) + 'px');
      }); // end on(resizeable.set.width

      scope.$on('resizeable.reset.width',function(evt){
        if(angular.isDefined(scope.obj.size))
          el.css('width',scope.obj.size.width + 'px');
      }); // end on(resizeable.reset.width)
    } // end link
  }; // end return
}]); // end resizeable

angular.module('windows',['ngAnimate','itsADrag','resizeIt'])

.directive('window',['$animate',function($animate){
  return {
    restrict : 'E',
    transclude : true,
    replace : true,
    templateUrl : 'modules/automata/client/partials/tape.html',
    scope : {
      id : '@id',
      title : '@title'
    },
    link : function(scope,el,attr){
      scope.minimized = false;

      /** Methods **/
      scope.minimize = function(){
        scope.minimized = !scope.minimized;

        if(angular.equals(scope.minimized,true)){
          $animate.addClass(el,'minimize');
        }else{
          $animate.removeClass(el,'minimize');
        }
      }; // end minimize

    } // end link
  }; // end return
}]) // end window


.run(['$templateCache', '$http', function($templateCache, $http){
  $http.get('modules/automata/client/partials/tape.html', { cache:$templateCache });
}]); // end windows

'use strict';

//Automata service used for communicating with the automata REST endpoints

angular.module('automata').factory('Automata', ['$resource',
  function ($resource) {
    return $resource('api/automata/:automatonId', {
      automatonId: '@_id'
    }, {
      update: {
        method: 'PUT',
      }
    });
  }
])
.factory('automatonGraph', [ '$document','$q',
  function($document, $q){
  // use a factory instead of a directive, because cy.js is not just for visualisation; you need access to the graph model and events etc
  //angular.module('automata')
    var cy;

    var automatonGraph = function(eles){

      var deferred = $q.defer();

      $document.ready(function(){
      //$(function(){ // on dom ready
        cy = cytoscape({
          container: $('#cy')[0],
          boxSelectionEnabled: false,
          autounselectify: true,
          layout: {
            //name: 'cose',
            name: 'preset',
  //          fit: true,
  //          boundingBox: { x1:50, y1:0, x2:250, y2:300 },
            avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
  //          avoidOverlapPadding: 10, // extra spacing around nodes when avoidOverlap: true
  //          condense: true,
          },
          style: cytoscape.stylesheet()
            .selector('node')
              .css({
                'content': 'data(id)',
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
            .selector('edge')
              .css({
                'label': 'data(label)',
                'edge-text-rotation': 'autorotate',
                'curve-style': 'bezier',
                'control-point-step-size' : '70px',
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
                  'content' : ''
                })
              .selector('.startmarker')
                .css({
                  'border-style': 'solid',
                  'border-width': '2px',
                  'content': '',
                  'shape': 'polygon',
                  'shape-polygon-points': '1 0 0.5 -0.4 0.5 0.4'
                }),
          elements: eles,
          ready: function(){
            deferred.resolve(this);
            cy.on('tap', 'node', function(e){
              var node = e.cyTarget;
              if (!node.data().accept){
                node.data().accept = true;
                node.addClass('accept');
                if (node.data().start){
                  cy.$('#start').position({
                    x: cy.$('#start').position('x') - 2,
                  });
                }
              }else{
                node.data().accept = false;
                node.removeClass('accept');
                if (node.data().start){
                  cy.$('#start').position({
                    x: cy.$('#start').position('x') + 2,
                  });
                }
              }
            });

            cy.on('tap', function(e){
              if(e.cyTarget === cy){
                var ind = cy.nodes().length - 1;
                cy.add({
                  group: 'nodes',
                  data: { id: ind,
                          weight: 75 },
                  classes: 'enode',
                  position: { x: e.cyPosition.x, y: e.cyPosition.y }
                });
              //  cy.elements().removeClass('faded');
              }
            });

            cy.on('cxttap', 'node', function(e){
              var node = e.cyTarget;
              console.log('right tapped node '+node.id());
            });

            cy.on('drag', '#0', function(e){
              cy.$('#start').position({
                x: cy.$('#0').position('x') - (e.cyTarget.data().accept ? 34 : 32),
                y: cy.$('#0').position('y')
              });
            });

            cy.$('#start').ungrabify();
            cy.$('#start').unselectify();
            cy.$('#start').position({
              x: cy.$('#0').position('x') - 32,
              y: cy.$('#0').position('y')
            });

              // the default values of each option are outlined below:
            var defaults = {
              preview: true, // whether to show added edges preview before releasing selection
              stackOrder: 4, // Controls stack order of edgehandles canvas element by setting it's z-index
              handleSize: 10, // the size of the edge handle put on nodes
              handleColor: '#777777', // the colour of the handle and the line drawn from it
              handleLineType: 'ghost', // can be 'ghost' for real edge, 'straight' for a straight line, or 'draw' for a draw-as-you-go line
              handleLineWidth: 1, // width of handle line in pixels
              handleNodes: '.enode', // selector/filter function for whether edges can be made from a given node
              hoverDelay: 150, // time spend over a target node before it is considered a target selection
              cxt: true, // whether cxt events trigger edgehandles (useful on touch)
              enabled: true, // whether to start the plugin in the enabled state
              toggleOffOnLeave: false, // whether an edge is cancelled by leaving a node (true), or whether you need to go over again to cancel (false; allows multiple edges in one pass)
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
                // fired when edgehandles is done and entities are added
                //var read = 'read';
                //var act = 'act';
                //addedEntities.data('read', read);
                //addedEntities.data('action', act);
                //addedEntities.data('label', read +':'+ act);
                //openModal('sm');
                angular.element('[ng-controller=AddEdgeModalController]').scope().open('sm', addedEntities);

              },
              stop: function(sourceNode) {
                // fired when edgehandles interaction is stopped (either complete with added edges or incomplete)
              }
            };
            //console.log(cy);
            cy.edgehandles(defaults);
          }
        });
      });
      return deferred.promise;
    };
    return automatonGraph;
  }]);

'use strict';

angular.module('core.admin').run(['Menus',
  function (Menus) {
    Menus.addMenuItem('topbar', {
      title: 'Admin',
      state: 'admin',
      type: 'dropdown',
      roles: ['admin']
    });
  }
]);

'use strict';

// Setting up route
angular.module('core.admin.routes').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin', {
        abstract: true,
        url: '/admin',
        template: '<ui-view/>',
        data: {
          roles: ['admin']
        }
      });
  }
]);

'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {

    // Redirect to 404 when route not found
    $urlRouterProvider.otherwise(function ($injector, $location) {
      $injector.get('$state').transitionTo('not-found', null, {
        location: false
      });
    });

    // Home state routing
    $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'modules/core/client/views/home.client.view.html'
    })
    .state('not-found', {
      url: '/not-found',
      templateUrl: 'modules/core/client/views/404.client.view.html',
      data: {
        ignoreState: true
      }
    })
    .state('bad-request', {
      url: '/bad-request',
      templateUrl: 'modules/core/client/views/400.client.view.html',
      data: {
        ignoreState: true
      }
    })
    .state('forbidden', {
      url: '/forbidden',
      templateUrl: 'modules/core/client/views/403.client.view.html',
      data: {
        ignoreState: true
      }
    });
  }
]);

'use strict';

angular.module('core').controller('HeaderController', ['$scope', '$state', 'Authentication', 'Menus', '$uibModal', '$log',
  function ($scope, $state, Authentication, Menus, $uibModal, $log) {
    // Expose view variables
    $scope.$state = $state;
    $scope.authentication = Authentication;

    // Get the topbar menu
    $scope.menu = Menus.getMenu('topbar');

    // Toggle the menu items
    $scope.isCollapsed = false;
    $scope.toggleCollapsibleMenu = function () {
      $scope.isCollapsed = !$scope.isCollapsed;
    };

    // Collapsing the menu after navigation
    $scope.$on('$stateChangeSuccess', function () {
      $scope.isCollapsed = false;
    });

  //  $scope.items = ['item1', 'item2', 'item3'];
    $scope.animationsEnabled = true;

    $scope.example = {
      text: 'word',
      word: /^\s*\w*\s*$/
    };

    $scope.createNewAutomaton = function(){
      var modalInstance = $uibModal.open({
        animation: $scope.animationsEnabled,
        templateUrl: 'createNewModal.html',
        controller: 'CreateNewModalInstanceCtrl',
        size: 'sm' //,
      //  resolve: {
      //    items: function () {
      //      return $scope.items;
      //    }
      //  }
      });


      //modalInstance.result.then(function (selectedItem) {
      modalInstance.result.then(function () {
        console.log('result no selection 11');
        //$scope.selected = selectedItem;
      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });
      console.log('create new');
    };
  }
//]).controller('ModalInstanceCtrl', function ($scope, $uibModalInstance, items) {
]).controller('CreateNewModalInstanceCtrl', ["$scope", "$uibModalInstance", function ($scope, $uibModalInstance) {

//  $scope.items = items;
//  $scope.selected = {
//    item: $scope.items[0]
//  };

  $scope.ok = function () {
    //$uibModalInstance.close($scope.selected.item);
    $uibModalInstance.close();
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}]);

'use strict';

angular.module('core').controller('HomeController', ['$scope', 'Authentication',
  function ($scope, Authentication) {
    // This provides Authentication context.
    $scope.authentication = Authentication;
  }
]);

'use strict';

/**
 * Edits by Ryan Hutchison
 * Credit: https://github.com/paulyoder/angular-bootstrap-show-errors */

angular.module('core')
  .directive('showErrors', ['$timeout', '$interpolate', function ($timeout, $interpolate) {
    var linkFn = function (scope, el, attrs, formCtrl) {
      var inputEl, inputName, inputNgEl, options, showSuccess, toggleClasses,
        initCheck = false,
        showValidationMessages = false,
        blurred = false;

      options = scope.$eval(attrs.showErrors) || {};
      showSuccess = options.showSuccess || false;
      inputEl = el[0].querySelector('.form-control[name]') || el[0].querySelector('[name]');
      inputNgEl = angular.element(inputEl);
      inputName = $interpolate(inputNgEl.attr('name') || '')(scope);

      if (!inputName) {
        throw 'show-errors element has no child input elements with a \'name\' attribute class';
      }

      var reset = function () {
        return $timeout(function () {
          el.removeClass('has-error');
          el.removeClass('has-success');
          showValidationMessages = false;
        }, 0, false);
      };

      scope.$watch(function () {
        return formCtrl[inputName] && formCtrl[inputName].$invalid;
      }, function (invalid) {
        return toggleClasses(invalid);
      });

      scope.$on('show-errors-check-validity', function (event, name) {
        if (angular.isUndefined(name) || formCtrl.$name === name) {
          initCheck = true;
          showValidationMessages = true;

          return toggleClasses(formCtrl[inputName].$invalid);
        }
      });

      scope.$on('show-errors-reset', function (event, name) {
        if (angular.isUndefined(name) || formCtrl.$name === name) {
          return reset();
        }
      });

      toggleClasses = function (invalid) {
        el.toggleClass('has-error', showValidationMessages && invalid);
        if (showSuccess) {
          return el.toggleClass('has-success', showValidationMessages && !invalid);
        }
      };
    };

    return {
      restrict: 'A',
      require: '^form',
      compile: function (elem, attrs) {
        if (attrs.showErrors.indexOf('skipFormGroupCheck') === -1) {
          if (!(elem.hasClass('form-group') || elem.hasClass('input-group'))) {
            throw 'show-errors element does not have the \'form-group\' or \'input-group\' class';
          }
        }
        return linkFn;
      }
    };
  }]);

'use strict';

angular.module('core').factory('authInterceptor', ['$q', '$injector', 'Authentication',
  function ($q, $injector, Authentication) {
    return {
      responseError: function(rejection) {
        if (!rejection.config.ignoreAuthModule) {
          switch (rejection.status) {
            case 401:
              // Deauthenticate the global user
              Authentication.user = null;
              $injector.get('$state').transitionTo('authentication.signin');
              break;
            case 403:
              $injector.get('$state').transitionTo('forbidden');
              break;
          }
        }
        // otherwise, default behaviour
        return $q.reject(rejection);
      }
    };
  }
]);

'use strict';

//Menu service used for managing  menus
angular.module('core').service('Menus', [
  function () {
    // Define a set of default roles
    this.defaultRoles = ['user', 'admin'];

    // Define the menus object
    this.menus = {};

    // A private function for rendering decision
    var shouldRender = function (user) {
      if (!!~this.roles.indexOf('*')) {
        return true;
      } else {
        if(!user) {
          return false;
        }
        for (var userRoleIndex in user.roles) {
          for (var roleIndex in this.roles) {
            if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
              return true;
            }
          }
        }
      }

      return false;
    };

    // Validate menu existance
    this.validateMenuExistance = function (menuId) {
      if (menuId && menuId.length) {
        if (this.menus[menuId]) {
          return true;
        } else {
          throw new Error('Menu does not exist');
        }
      } else {
        throw new Error('MenuId was not provided');
      }

      return false;
    };

    // Get the menu object by menu id
    this.getMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Return the menu object
      return this.menus[menuId];
    };

    // Add new menu object by menu id
    this.addMenu = function (menuId, options) {
      options = options || {};

      // Create the new menu
      this.menus[menuId] = {
        roles: options.roles || this.defaultRoles,
        items: options.items || [],
        shouldRender: shouldRender
      };

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Return the menu object
      delete this.menus[menuId];
    };

    // Add menu item object
    this.addMenuItem = function (menuId, options) {
      options = options || {};

      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Push new menu item
      this.menus[menuId].items.push({
        title: options.title || '',
        state: options.state || '',
        type: options.type || 'item',
        class: options.class,
        roles: ((options.roles === null || typeof options.roles === 'undefined') ? this.defaultRoles : options.roles),
        position: options.position || 0,
        items: [],
        shouldRender: shouldRender
      });

      // Add submenu items
      if (options.items) {
        for (var i in options.items) {
          this.addSubMenuItem(menuId, options.state, options.items[i]);
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    // Add submenu item object
    this.addSubMenuItem = function (menuId, parentItemState, options) {
      options = options || {};

      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].state === parentItemState) {
          // Push new submenu item
          this.menus[menuId].items[itemIndex].items.push({
            title: options.title || '',
            state: options.state || '',
            roles: ((options.roles === null || typeof options.roles === 'undefined') ? this.menus[menuId].items[itemIndex].roles : options.roles),
            position: options.position || 0,
            shouldRender: shouldRender
          });
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeMenuItem = function (menuId, menuItemState) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].state === menuItemState) {
          this.menus[menuId].items.splice(itemIndex, 1);
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeSubMenuItem = function (menuId, submenuItemState) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
          if (this.menus[menuId].items[itemIndex].items[subitemIndex].state === submenuItemState) {
            this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
          }
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    //Adding the topbar menu
    this.addMenu('topbar', {
      roles: ['*']
    });
  }
]);

'use strict';

// Create the Socket.io wrapper service
angular.module('core').service('Socket', ['Authentication', '$state', '$timeout',
  function (Authentication, $state, $timeout) {
    // Connect to Socket.io server
    this.connect = function () {
      // Connect only when authenticated
      if (Authentication.user) {
        this.socket = io();
      }
    };
    this.connect();

    // Wrap the Socket.io 'on' method
    this.on = function (eventName, callback) {
      if (this.socket) {
        this.socket.on(eventName, function (data) {
          $timeout(function () {
            callback(data);
          });
        });
      }
    };

    // Wrap the Socket.io 'emit' method
    this.emit = function (eventName, data) {
      if (this.socket) {
        this.socket.emit(eventName, data);
      }
    };

    // Wrap the Socket.io 'removeListener' method
    this.removeListener = function (eventName) {
      if (this.socket) {
        this.socket.removeListener(eventName);
      }
    };
  }
]);

'use strict';

// Configuring the Users module
angular.module('users.admin').run(['Menus',
  function (Menus) {
    Menus.addSubMenuItem('topbar', 'admin', {
      title: 'Manage Users',
      state: 'admin.users'
    });
  }
]);

'use strict';

// Setting up route
angular.module('users.admin.routes').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin.users', {
        url: '/users',
        templateUrl: 'modules/users/client/views/admin/list-users.client.view.html',
        controller: 'UserListController'
      })
      .state('admin.user', {
        url: '/users/:userId',
        templateUrl: 'modules/users/client/views/admin/view-user.client.view.html',
        controller: 'UserController',
        resolve: {
          userResolve: ['$stateParams', 'Admin', function ($stateParams, Admin) {
            return Admin.get({
              userId: $stateParams.userId
            });
          }]
        }
      })
      .state('admin.user-edit', {
        url: '/users/:userId/edit',
        templateUrl: 'modules/users/client/views/admin/edit-user.client.view.html',
        controller: 'UserController',
        resolve: {
          userResolve: ['$stateParams', 'Admin', function ($stateParams, Admin) {
            return Admin.get({
              userId: $stateParams.userId
            });
          }]
        }
      });
  }
]);

'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
  function ($stateProvider) {
    // Users state routing
    $stateProvider
      .state('settings', {
        abstract: true,
        url: '/settings',
        templateUrl: 'modules/users/client/views/settings/settings.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('settings.profile', {
        url: '/profile',
        templateUrl: 'modules/users/client/views/settings/edit-profile.client.view.html'
      })
      .state('settings.password', {
        url: '/password',
        templateUrl: 'modules/users/client/views/settings/change-password.client.view.html'
      })
      .state('settings.accounts', {
        url: '/accounts',
        templateUrl: 'modules/users/client/views/settings/manage-social-accounts.client.view.html'
      })
      .state('settings.picture', {
        url: '/picture',
        templateUrl: 'modules/users/client/views/settings/change-profile-picture.client.view.html'
      })
      .state('authentication', {
        abstract: true,
        url: '/authentication',
        templateUrl: 'modules/users/client/views/authentication/authentication.client.view.html'
      })
      .state('authentication.signup', {
        url: '/signup',
        templateUrl: 'modules/users/client/views/authentication/signup.client.view.html'
      })
      .state('authentication.signin', {
        url: '/signin?err',
        templateUrl: 'modules/users/client/views/authentication/signin.client.view.html'
      })
      .state('password', {
        abstract: true,
        url: '/password',
        template: '<ui-view/>'
      })
      .state('password.forgot', {
        url: '/forgot',
        templateUrl: 'modules/users/client/views/password/forgot-password.client.view.html'
      })
      .state('password.reset', {
        abstract: true,
        url: '/reset',
        template: '<ui-view/>'
      })
      .state('password.reset.invalid', {
        url: '/invalid',
        templateUrl: 'modules/users/client/views/password/reset-password-invalid.client.view.html'
      })
      .state('password.reset.success', {
        url: '/success',
        templateUrl: 'modules/users/client/views/password/reset-password-success.client.view.html'
      })
      .state('password.reset.form', {
        url: '/:token',
        templateUrl: 'modules/users/client/views/password/reset-password.client.view.html'
      });
  }
]);

'use strict';

angular.module('users.admin').controller('UserListController', ['$scope', '$filter', 'Admin',
  function ($scope, $filter, Admin) {
    Admin.query(function (data) {
      $scope.users = data;
      $scope.buildPager();
    });

    $scope.buildPager = function () {
      $scope.pagedItems = [];
      $scope.itemsPerPage = 15;
      $scope.currentPage = 1;
      $scope.figureOutItemsToDisplay();
    };

    $scope.figureOutItemsToDisplay = function () {
      $scope.filteredItems = $filter('filter')($scope.users, {
        $: $scope.search
      });
      $scope.filterLength = $scope.filteredItems.length;
      var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
      var end = begin + $scope.itemsPerPage;
      $scope.pagedItems = $scope.filteredItems.slice(begin, end);
    };

    $scope.pageChanged = function () {
      $scope.figureOutItemsToDisplay();
    };
  }
]);

'use strict';

angular.module('users.admin').controller('UserController', ['$scope', '$state', 'Authentication', 'userResolve',
  function ($scope, $state, Authentication, userResolve) {
    $scope.authentication = Authentication;
    $scope.user = userResolve;

    $scope.remove = function (user) {
      if (confirm('Are you sure you want to delete this user?')) {
        if (user) {
          user.$remove();

          $scope.users.splice($scope.users.indexOf(user), 1);
        } else {
          $scope.user.$remove(function () {
            $state.go('admin.users');
          });
        }
      }
    };

    $scope.update = function (isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      var user = $scope.user;

      user.$update(function () {
        $state.go('admin.user', {
          userId: user._id
        });
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$state', '$http', '$location', '$window', 'Authentication', 'PasswordValidator',
  function ($scope, $state, $http, $location, $window, Authentication, PasswordValidator) {
    $scope.authentication = Authentication;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();

    // Get an eventual error defined in the URL query string:
    $scope.error = $location.search().err;

    // If user is signed in then redirect back home
    if ($scope.authentication.user) {
      $location.path('/');
    }

    $scope.signup = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      $http.post('/api/auth/signup', $scope.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;

        // And redirect to the previous or home page
        $state.go($state.previous.state.name || 'home', $state.previous.params);
      }).error(function (response) {
        $scope.error = response.message;
      });
    };

    $scope.signin = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      $http.post('/api/auth/signin', $scope.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;

        // And redirect to the previous or home page
        $state.go($state.previous.state.name || 'home', $state.previous.params);
      }).error(function (response) {
        $scope.error = response.message;
      });
    };

    // OAuth provider request
    $scope.callOauthProvider = function (url) {
      if ($state.previous && $state.previous.href) {
        url += '?redirect_to=' + encodeURIComponent($state.previous.href);
      }

      // Effectively call OAuth authentication route:
      $window.location.href = url;
    };
  }
]);

'use strict';

angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication', 'PasswordValidator',
  function ($scope, $stateParams, $http, $location, Authentication, PasswordValidator) {
    $scope.authentication = Authentication;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();

    // If user is signed in then redirect back home
    if ($scope.authentication.user) {
      $location.path('/');
    }

    // Submit forgotten password account id
    $scope.askForPasswordReset = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'forgotPasswordForm');

        return false;
      }

      $http.post('/api/auth/forgot', $scope.credentials).success(function (response) {
        // Show user success message and clear form
        $scope.credentials = null;
        $scope.success = response.message;

      }).error(function (response) {
        // Show user error message and clear form
        $scope.credentials = null;
        $scope.error = response.message;
      });
    };

    // Change user password
    $scope.resetUserPassword = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'resetPasswordForm');

        return false;
      }

      $http.post('/api/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.passwordDetails = null;

        // Attach user profile
        Authentication.user = response;

        // And redirect to the index page
        $location.path('/password/reset/success');
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('ChangePasswordController', ['$scope', '$http', 'Authentication', 'PasswordValidator',
  function ($scope, $http, Authentication, PasswordValidator) {
    $scope.user = Authentication.user;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();

    // Change user password
    $scope.changeUserPassword = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'passwordForm');

        return false;
      }

      $http.post('/api/users/password', $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.$broadcast('show-errors-reset', 'passwordForm');
        $scope.success = true;
        $scope.passwordDetails = null;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('ChangeProfilePictureController', ['$scope', '$timeout', '$window', 'Authentication', 'FileUploader',
  function ($scope, $timeout, $window, Authentication, FileUploader) {
    $scope.user = Authentication.user;
    $scope.imageURL = $scope.user.profileImageURL;

    // Create file uploader instance
    $scope.uploader = new FileUploader({
      url: 'api/users/picture',
      alias: 'newProfilePicture'
    });

    // Set file uploader image filter
    $scope.uploader.filters.push({
      name: 'imageFilter',
      fn: function (item, options) {
        var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
        return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
      }
    });

    // Called after the user selected a new picture file
    $scope.uploader.onAfterAddingFile = function (fileItem) {
      if ($window.FileReader) {
        var fileReader = new FileReader();
        fileReader.readAsDataURL(fileItem._file);

        fileReader.onload = function (fileReaderEvent) {
          $timeout(function () {
            $scope.imageURL = fileReaderEvent.target.result;
          }, 0);
        };
      }
    };

    // Called after the user has successfully uploaded a new picture
    $scope.uploader.onSuccessItem = function (fileItem, response, status, headers) {
      // Show success message
      $scope.success = true;

      // Populate user object
      $scope.user = Authentication.user = response;

      // Clear upload buttons
      $scope.cancelUpload();
    };

    // Called after the user has failed to uploaded a new picture
    $scope.uploader.onErrorItem = function (fileItem, response, status, headers) {
      // Clear upload buttons
      $scope.cancelUpload();

      // Show error message
      $scope.error = response.message;
    };

    // Change user profile picture
    $scope.uploadProfilePicture = function () {
      // Clear messages
      $scope.success = $scope.error = null;

      // Start upload
      $scope.uploader.uploadAll();
    };

    // Cancel the upload process
    $scope.cancelUpload = function () {
      $scope.uploader.clearQueue();
      $scope.imageURL = $scope.user.profileImageURL;
    };
  }
]);

'use strict';

angular.module('users').controller('EditProfileController', ['$scope', '$http', '$location', 'Users', 'Authentication',
  function ($scope, $http, $location, Users, Authentication) {
    $scope.user = Authentication.user;

    // Update a user profile
    $scope.updateUserProfile = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      var user = new Users($scope.user);

      user.$update(function (response) {
        $scope.$broadcast('show-errors-reset', 'userForm');

        $scope.success = true;
        Authentication.user = response;
      }, function (response) {
        $scope.error = response.data.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('SocialAccountsController', ['$scope', '$http', 'Authentication',
  function ($scope, $http, Authentication) {
    $scope.user = Authentication.user;

    // Check if there are additional accounts
    $scope.hasConnectedAdditionalSocialAccounts = function (provider) {
      for (var i in $scope.user.additionalProvidersData) {
        return true;
      }

      return false;
    };

    // Check if provider is already in use with current user
    $scope.isConnectedSocialAccount = function (provider) {
      return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
    };

    // Remove a user social account
    $scope.removeUserSocialAccount = function (provider) {
      $scope.success = $scope.error = null;

      $http.delete('/api/users/accounts', {
        params: {
          provider: provider
        }
      }).success(function (response) {
        // If successful show success message and clear form
        $scope.success = true;
        $scope.user = Authentication.user = response;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('SettingsController', ['$scope', 'Authentication',
  function ($scope, Authentication) {
    $scope.user = Authentication.user;
  }
]);

'use strict';

angular.module('users')
  .directive('passwordValidator', ['PasswordValidator', function(PasswordValidator) {
    return {
      require: 'ngModel',
      link: function(scope, element, attrs, ngModel) {
        ngModel.$validators.requirements = function (password) {
          var status = true;
          if (password) {
            var result = PasswordValidator.getResult(password);
            var requirementsIdx = 0;

            // Requirements Meter - visual indicator for users
            var requirementsMeter = [
              { color: 'danger', progress: '20' },
              { color: 'warning', progress: '40' },
              { color: 'info', progress: '60' },
              { color: 'primary', progress: '80' },
              { color: 'success', progress: '100' }
            ];

            if (result.errors.length < requirementsMeter.length) {
              requirementsIdx = requirementsMeter.length - result.errors.length - 1;
            }

            scope.requirementsColor = requirementsMeter[requirementsIdx].color;
            scope.requirementsProgress = requirementsMeter[requirementsIdx].progress;

            if (result.errors.length) {
              scope.popoverMsg = PasswordValidator.getPopoverMsg();
              scope.passwordErrors = result.errors;
              status = false;
            } else {
              scope.popoverMsg = '';
              scope.passwordErrors = [];
              status = true;
            }
          }
          return status;
        };
      }
    };
  }]);

'use strict';

angular.module('users')
  .directive('passwordVerify', [function() {
    return {
      require: 'ngModel',
      scope: {
        passwordVerify: '='
      },
      link: function(scope, element, attrs, ngModel) {
        var status = true;
        scope.$watch(function() {
          var combined;
          if (scope.passwordVerify || ngModel) {
            combined = scope.passwordVerify + '_' + ngModel;
          }
          return combined;
        }, function(value) {
          if (value) {
            ngModel.$validators.passwordVerify = function (password) {
              var origin = scope.passwordVerify;
              return (origin !== password) ? false : true;
            };
          }
        });
      }
    };
  }]);

'use strict';

// Users directive used to force lowercase input
angular.module('users').directive('lowercase', function () {
  return {
    require: 'ngModel',
    link: function (scope, element, attrs, modelCtrl) {
      modelCtrl.$parsers.push(function (input) {
        return input ? input.toLowerCase() : '';
      });
      element.css('text-transform', 'lowercase');
    }
  };
});

'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', ['$window',
  function ($window) {
    var auth = {
      user: $window.user
    };

    return auth;
  }
]);

'use strict';

// PasswordValidator service used for testing the password strength
angular.module('users').factory('PasswordValidator', ['$window',
  function ($window) {
    var owaspPasswordStrengthTest = $window.owaspPasswordStrengthTest;

    return {
      getResult: function (password) {
        var result = owaspPasswordStrengthTest.test(password);
        return result;
      },
      getPopoverMsg: function () {
        var popoverMsg = 'Please enter a passphrase or password with greater than 10 characters, numbers, lowercase, upppercase, and special characters.';
        return popoverMsg;
      }
    };
  }
]);

'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
  function ($resource) {
    return $resource('api/users', {}, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

//TODO this should be Users service
angular.module('users.admin').factory('Admin', ['$resource',
  function ($resource) {
    return $resource('api/users/:userId', {
      userId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
