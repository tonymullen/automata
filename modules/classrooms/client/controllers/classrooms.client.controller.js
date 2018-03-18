(function () {
  'use strict';

  // Classrooms controller
  angular
    .module('classrooms')
    .controller('ClassroomsController', ClassroomsController);

  ClassroomsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'classroomResolve', 'Notification', '$uibModal'];

  function ClassroomsController($scope, $state, $window, Authentication, classroom, Notification, $uibModal) {
    var vm = this;

    vm.authentication = Authentication;
    vm.classroom = classroom;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;
    vm.createProblem = createProblem;


    // Remove existing Classroom
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.classroom.$remove(function () {
          $state.go('classrooms.list');
          Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Classroom deleted successfully!' });
        });
      }
    }

    // Save Classroom
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.classroomForm');
        return false;
      }

      vm.classroom.createOrUpdate()
        .then(successCallback)
        .catch(errorCallback);

      function successCallback(res) {
        $state.go('classrooms.view', {
          classroomId: res._id
        });
        Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Classroom saved successfully!' });
      }

      function errorCallback(res) {
        Notification.error({ message: res.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Classroom save error!' });
      }
    }

    function createProblem() {
      var problem = {
        name: 'Untitled Problem',
        description: '',
        tests: []
      };
      vm.classroom.problems.push(problem);
      console.log(vm.classroom);
    }

    // vm.popupProblemForm = function () {
    //   console.log('Create Problem');
    //   var modalInstance = $uibModal.open({
    //     templateUrl: '/modules/classrooms/client/views/create-problem.client.view.html',
    //     controller: 'CreateProblemModalCtrl as vm'// ,
    //     // resolve: {
    //     //   locationData: function() {
    //     //     return {
    //     //       locationid : vm.locationid,
    //     //       locationName : vm.data.location.name
    //     //     }
    //     //   }
    //     // }
    //   });
    //   modalInstance.result.then(function (data) {
    //     vm.classroom.problems.push(data);
    //   });
    // };
  }
}());
