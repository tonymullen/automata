(function () {
  'use strict';

  describe('Classrooms Route Tests', function () {
    // Initialize global variables
    var $scope,
      ClassroomsService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _ClassroomsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      ClassroomsService = _ClassroomsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('classrooms');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/classrooms');
        });

        it('Should be abstract', function () {
          expect(mainstate.abstract).toBe(true);
        });

        it('Should have template', function () {
          expect(mainstate.template).toBe('<ui-view/>');
        });
      });

      describe('View Route', function () {
        var viewstate,
          ClassroomsController,
          mockClassroom;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('classrooms.view');
          $templateCache.put('modules/classrooms/client/views/view-classroom.client.view.html', '');

          // create mock Classroom
          mockClassroom = new ClassroomsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Classroom Name'
          });

          // Initialize Controller
          ClassroomsController = $controller('ClassroomsController as vm', {
            $scope: $scope,
            classroomResolve: mockClassroom
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:classroomId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.classroomResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            classroomId: 1
          })).toEqual('/classrooms/1');
        }));

        it('should attach an Classroom to the controller scope', function () {
          expect($scope.vm.classroom._id).toBe(mockClassroom._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/classrooms/client/views/view-classroom.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          ClassroomsController,
          mockClassroom;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('classrooms.create');
          $templateCache.put('modules/classrooms/client/views/form-classroom.client.view.html', '');

          // create mock Classroom
          mockClassroom = new ClassroomsService();

          // Initialize Controller
          ClassroomsController = $controller('ClassroomsController as vm', {
            $scope: $scope,
            classroomResolve: mockClassroom
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.classroomResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/classrooms/create');
        }));

        it('should attach an Classroom to the controller scope', function () {
          expect($scope.vm.classroom._id).toBe(mockClassroom._id);
          expect($scope.vm.classroom._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/classrooms/client/views/form-classroom.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          ClassroomsController,
          mockClassroom;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('classrooms.edit');
          $templateCache.put('modules/classrooms/client/views/form-classroom.client.view.html', '');

          // create mock Classroom
          mockClassroom = new ClassroomsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Classroom Name'
          });

          // Initialize Controller
          ClassroomsController = $controller('ClassroomsController as vm', {
            $scope: $scope,
            classroomResolve: mockClassroom
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:classroomId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.classroomResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            classroomId: 1
          })).toEqual('/classrooms/1/edit');
        }));

        it('should attach an Classroom to the controller scope', function () {
          expect($scope.vm.classroom._id).toBe(mockClassroom._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/classrooms/client/views/form-classroom.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
