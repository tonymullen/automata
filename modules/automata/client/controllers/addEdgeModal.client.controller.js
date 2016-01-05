'use strict';

angular.module('automata').controller('AddEdgeModalController', ['$scope', '$uibModal', '$log',
function ($scope, $uibModal, $log) {
  //$scope.items = ['item1', 'item2', 'item3'];
  //$scope.labels = {'read':'','act':''};


  $scope.open = function (size, addedEntities) {
    console.log('open modal');
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

//    modalInstance.result.then(function (selectedItem) {
//      $scope.selected = selectedItem;
    modalInstance.result.then(function () {
//      console.log('OK Clicked');
//      console.log(result);
//      console.log(labels.act);
  //    $scope.selected = selectedItem;
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

  //$scope.selected = {
    //item: $scope.items[0]
  //};

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
