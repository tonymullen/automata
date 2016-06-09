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
        machine: function () {
          return $scope.$parent.vm.automaton.machine;
        },
        alphabet: function () {
          return $scope.$parent.vm.automaton.alphabet;
        },
        addedEntities: function () {
          return addedEntities;
        },
        determ: function () {
          return $scope.$parent.vm.automaton.determ;
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
['$scope', '$uibModalInstance', 'machine', 'determ', 'addedEntities', 'alphabet',
function ($scope, $uibModalInstance, machine, determ, addedEntities, alphabet) {
  $scope.alphabet = alphabet;
  $scope.read_alph = $scope.alphabet.slice();
  $scope.read_stack_alph = $scope.alphabet.slice();
  $scope.stack_act_alph = alphabet.concat(['^']);
  $scope.machine = machine;
  $scope.addedEntities = addedEntities;
  $scope.act_alph = alphabet.concat(['<', '>']);

  if (determ) { // ensures only available out symbols
    if (machine !== 'pda') {
      var fromNode = $scope.addedEntities.source();
      fromNode.outgoers().forEach(function(el) {
        if (el.isEdge() && el.data().read) {
          for (var i = 0; i < $scope.read_alph.length; i++) {
            if (el.data().read === $scope.read_alph[i]) {
              $scope.read_alph.splice(i, 1);
            }
          }
        }
      });
    } else {
      // TODO: deal with deterministic selections for
      // the PDA case
    }
  }
  $scope.ok = function () {
    var read = $scope.labels.read;
    addedEntities.data('read', read);
    if (machine === 'tm') {
      var act = $scope.labels.act;
      addedEntities.data('action', act);
      addedEntities.data('label', read + ':' + act);
    } else if (machine === 'pda') {
      var read_stack = $scope.labels.read_stack;
      var stack_action = $scope.labels.stack_action;
      addedEntities.data('read_stack', read_stack);
      addedEntities.data('label', read + ':' + read_stack + ':' + stack_action);
    } else {
      addedEntities.data('label', read);
    }
    $uibModalInstance.close();
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
    $scope.addedEntities.remove();
  };

}]);
