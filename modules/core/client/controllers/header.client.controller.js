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
]).controller('CreateNewModalInstanceCtrl', function ($scope, $uibModalInstance) {

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
});
