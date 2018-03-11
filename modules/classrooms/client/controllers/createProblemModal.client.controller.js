'use strict';

angular
  .module('automata')
  .controller('createProblemModalCtrl', createProblemModalCtrl);

createProblemModalCtrl.$inject = ['$scope', '$uibModalInstance'];


function createProblemModalCtrl($scope, $uibModalInstance) {
  console.log('Create Problem Model Ctrl');
}

