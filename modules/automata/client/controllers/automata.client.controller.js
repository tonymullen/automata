'use strict';

// Automata controller

angular.module('automata').controller('AutomataController', ['$scope', '$state', '$stateParams', '$location', 'Authentication', 'Automata', 'automatonGraph',
  function ($scope, $state, $stateParams, $location, Authentication, Automata, automatonGraph) {
    $scope.authentication = Authentication;

    if($state.current.data && $state.current.data.type){
      console.log($state.current.data.type);
    }

    /* CYTOSCAPE */
    var cy; // maybe you want a ref to cy

    $scope.eles = {
      nodes: [
      //  { data: { id: 'startparent' }, position: { x: -500, y: -50 }, classes: 'startparent' },
        { data: { id: 'start' }, classes: 'startmarker' },
        { data: { id: '0', name: 's0', start: true }, position: { x: 0, y: 0 } }
    /*  { data: { id: '0', name: 's0', start: true }, position: { x: -120, y: -10 } },
        { data: { id: '1', name: 's1' }, position: { x: -100, y: 100 } },
        { data: { id: '2', name: 's2', accept: true }, position: { x: 200, y: 100 }, classes: 'accept' },
        { data: { id: '3', name: 's3' }, position: { x: 300, y: -50 } }
        */
      ],
      edges: [
    /*  { data: { source: 'start', target: '0'}, classes: "start-marker-arrow"  },
        { data: { source: '0', target: '1', read: 'A', action: '>', label: 'A : >' } },
        { data: { source: '0', target: '3', read: 'B', action: '_', label: 'B : _' } },
        { data: { source: '0', target: '3', read: '_', action: 'B', label: '_ : B' } },
        { data: { source: '2', target: '3', read: '_', action: 'B', label: '_ : B' } },
        { data: { source: '2', target: '2', read: 'A', action: 'B', label: 'A : B' } },
        { data: { source: '3', target: '0', read: 'A', action: 'B', label: 'A : B' } },
        { data: { source: '3', target: '2', read: 'A', action: 'B', label: 'A : B' } },
        { data: { source: '1', target: '2', read: 'A', action: 'B', label: 'A : B' } },
        { data: { source: '1', target: '0', read: 'A', action: 'B', label: 'A : B' } },
        { data: { source: '0', target: '0', read: 'A', action: 'B', label: 'A : B' } }
        */
      ]
    };

    automatonGraph($scope.eles).then(function(automatonCy){
      cy = automatonCy;
      $scope.cyLoaded = true;
    });

/* END CYTOSCAPE */

    // Create new Automaton
    $scope.create = function (isValid) {

      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'automatonForm');

        return false;
      }

      // Create new Automaton object

      var automaton = new Automata({
        title: this.title,
        machine: $state.current.data.type,
        states: [{
          stateName: 's1',
          stateID: 0,
          position: { x: 100, y: 100 },
          start: true,
          accept: false
        },{
          stateName: 's2',
          stateID: 1,
          position: { x: 100, y: 100 },
          start: false,
          accept: true
        }],
        edges: [{
          source: 0,
          target: 1,
          read: 'A',
          action: 'B',
          label: 'A'+':'+'B'
        }]
      });


      // Redirect after save
      automaton.$save(function (response) {
        $location.path('automata/' + response._id);

        // Clear form fields
        $scope.title = '';
      //  $scope.content = '';
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

      var automaton = $scope.automaton;

      automaton.$update(function () {
        $location.path('automata/' + automaton._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Find a list of Automata
    $scope.find = function () {
      $scope.automata = Automata.query();
    };

    // Find existing Article
    $scope.findOne = function () {
      $scope.automaton = Automata.get({
        automatonId: $stateParams.automatonId
      });
    };
  }
]);
