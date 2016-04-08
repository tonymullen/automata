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
['$scope', '$uibModalInstance', 'machine', 'addedEntities', 'alphabet',
function ($scope, $uibModalInstance, machine, addedEntities, alphabet) {
  $scope.alphabet = alphabet;
  $scope.machine = machine;
  $scope.act_alph = alphabet.concat(['<', '>']);
  $scope.addedEntities = addedEntities;
  $scope.ok = function () {
    var read = $scope.labels.read.toUpperCase();
    addedEntities.data('read', read);
    if (machine === 'tm') {
      var act = $scope.labels.act.toUpperCase();
      addedEntities.data('action', act);
      addedEntities.data('label', read + ':' + act);
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
