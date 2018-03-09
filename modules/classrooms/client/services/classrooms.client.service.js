// Classrooms service used to communicate Classrooms REST endpoints
(function () {
  'use strict';

  angular
    .module('classrooms')
    .factory('ClassroomsService', ClassroomsService);

  ClassroomsService.$inject = ['$resource', '$log'];

  function ClassroomsService($resource, $log) {
    var Classroom = $resource('/api/classrooms/:classroomId', {
      classroomId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });

    angular.extend(Classroom.prototype, {
      createOrUpdate: function () {
        var classroom = this;
        return createOrUpdate(classroom);
      }
    });

    return Classroom;

    function createOrUpdate(classroom) {
      if (classroom._id) {
        return classroom.$update(onSuccess, onError);
      } else {
        return classroom.$save(onSuccess, onError);
      }

      // Successful response
      function onSuccess(classroom) {
        // any required internal processing from
        // inside the service
      }

      function onError(errorResponse) {
        var error = errorResponse.data;
        handleError(error);
      }
    }

    function handleError(error) {
      $log.error(error);
    }
  }
}());
