'use strict';

// Automata controller

angular.module('automata').controller('AutomataController', ['$scope', '$state', '$stateParams', '$location', '$timeout', '$window', '$uibModal', 'Authentication', 'Automata', 'automatonGraph',
  function ($scope, $state, $stateParams, $location, $timeout, $window, $uibModal, Authentication, Automata, automatonGraph) {
    var cy; //ref to cy
    var empty_tape = [];
    for(var i = 0; i < 50; i++){
      empty_tape.push({ content: ' ' });
    }

    $scope.authentication = Authentication;
    $scope.tape = {
      position: 3,
      contents: []
    };
    $scope.tape.contents = [{ content: 'A' },
                            { content: 'B' },
                            { content: 'C' },
                            { content: 'D' },].concat(empty_tape);
    //console.log($scope.tape.contents);

    // Create new Automaton in the database
    $scope.create = function (isValid) {
      //var automaton;
      $scope.error = null;
      if (!isValid) {
        console.log('not valid');
        $scope.$broadcast('show-errors-check-validity', 'automatonForm');
        return false;
      }

      $scope.automaton.eles.nodes = cy.nodes().jsons();
      $scope.automaton.eles.edges = cy.edges().jsons();
      var automaton = $scope.automaton;

      automaton.$save(function (response) {
        console.log('saved');
        $location.path('automata/' + response._id);
        // Clear form fields
        $scope.title = '';
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
        $location.path('automata/' + automaton._id);
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
        if(index > 0){
          nextInd = index - 1;
        }else{
          nextInd = index;
        }
      }else if(event.keyCode === 37){
        if(index > 0){
          nextInd = index - 1;
        }else{
          $scope.tape.contents.unshift({ content: ' ' });
          nextInd = 0;
          angular.element(document.querySelector('.cell-'+nextInd))[0].blur();
        }
      }else{
        nextInd = index + 1;
        if($scope.tape.contents.length === nextInd){
          $scope.tape.contents.push({ content: ' ' });
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
  }
]);
