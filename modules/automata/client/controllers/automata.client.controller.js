'use strict';

// Automata controller

angular.module('automata').controller('AutomataController', ['$scope', '$stateParams', '$location', 'Authentication', 'Automata', 'automatonGraph',
  function ($scope, $stateParams, $location, Authentication, Automata, automatonGraph) {
    $scope.authentication = Authentication;

/* CYTOSCAPE */
    var cy; // maybe you want a ref to cy
    /*
    $scope.people = [
      { id: 'l', name: 'Laurel', weight: 65 },
      { id: 'h', name: 'Hardy', weight: 110 }
    ];
*/
    $scope.eles = {
      nodes: [
        { data: { id: '1' } },
        { data: { id: '2' } },
        { data: { id: '3' } },
        { data: { id: '4' } }
      ],
      edges: [
        { data: { source: '1', target: '2' } },
        { data: { source: '1', target: '3' } },
        { data: { source: '1', target: '4' } },
        { data: { source: '3', target: '4' } },
        { data: { source: '3', target: '3' } },
        { data: { source: '4', target: '1' } },
        { data: { source: '4', target: '3' } },
        { data: { source: '2', target: '3' } },
        { data: { source: '2', target: '1' } }
      ]
    };

/*
    var peopleById = {};
    for( var i = 0; i < $scope.people.length; i++ ){
      var p = $scope.people[i];

      peopleById[ p.id ] = p;
    }

    peopleGraph( $scope.people ).then(function( peopleCy ){
      cy = peopleCy;

      // use this variable to hide ui until cy loaded if you want
      $scope.cyLoaded = true;
    });
*/
    automatonGraph($scope.eles).then(function(automatonCy){
      cy = automatonCy;
      $scope.cyLoaded = true;
    });
/*
    $scope.onWeightChange = function(person){
       peopleGraph.setPersonWeight( person.id, person.weight );
    };

    peopleGraph.onWeightChange(function(id, weight){
      peopleById[id].weight = weight;

      $scope.$apply();
    });
*/

/* END CYTOSCAPE */


    // Create new Automaton
    $scope.create = function (isValid) {

      console.log('creating');
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'automatonForm');

        return false;
      }

      // Create new Automaton object
      var automaton = new Automata({
        title: this.title,
        states: [{
          statename: 's1',
          start: true,
          end: false
        },{
          statename: 's2',
          start: false,
          end: true
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

    // Remove existing Article
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

    // Update existing Article
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
