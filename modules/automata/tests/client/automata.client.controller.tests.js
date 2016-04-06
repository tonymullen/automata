(function () {
  'use strict';

  describe('Automata Controller Tests', function () {
    // Initialize global variables
    var AutomataController,
      $scope,
      $httpBackend,
      $state,
      Authentication,
      AutomataService,
      mockAutomaton;


    // The $resource service augments the response object with methods for updating and deleting the resource.
    // If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
    // the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
    // When the toEqualData matcher compares two objects, it takes only object properties into
    // account and ignores methods.
    beforeEach(function () {
      jasmine.addMatchers({
        toEqualData: function (util, customEqualityTesters) {
          return {
            compare: function (actual, expected) {
              return {
                pass: angular.equals(actual, expected)
              };
            }
          };
        }
      });
    });

    // Then we can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.

    beforeEach(inject(function ($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_, _$state_, _Authentication_, _AutomataService_) {

      // Set a new global scope
      $scope = $rootScope.$new();

      // Point global variables to injected services
      $httpBackend = _$httpBackend_;
      $state = _$state_;
      Authentication = _Authentication_;
      AutomataService = _AutomataService_;

      // create mock automaton
      mockAutomaton = new AutomataService({

        _id: '525a8422f6d0f87f0e407a33',
        title: 'An Automaton about MEAN',
        content: 'MEAN rocks!'
      });

      // Mock logged in user
      Authentication.user = {
        roles: ['user']
      };

      // Initialize the Automata controller.
      AutomataController = $controller('AutomataController as vm', {
        $scope: $scope,
        automatonResolve: {}
      });

      // Spy on state go
      spyOn($state, 'go');
    }));

    describe('vm.save() as create', function () {
      var sampleAutomatonPostData;

      beforeEach(function () {
        // Create a sample automaton object TODO
        sampleAutomatonPostData = new AutomataService({
          title: 'An Automaton about MEAN',
          content: 'MEAN rocks!'
        });

        $scope.vm.automaton = sampleAutomatonPostData;
      });

      it('should send a POST request with the form input values and then locate to new object URL', inject(function (ArticlesService) {

        // Set POST response
        $httpBackend.expectPOST('api/automata', sampleAutomatonPostData).respond(mockAutomaton);

        // Run controller functionality
        $scope.vm.save(true);
        $httpBackend.flush();


        // Test URL redirection after the article was created
        expect($state.go).toHaveBeenCalledWith('automata.view', {
          automatonId: mockAutomaton._id
        });
      }));

      it('should set $scope.vm.error if error', function () {
        var errorMessage = 'this is an error message';
        $httpBackend.expectPOST('api/automata', sampleAutomatonPostData).respond(400, {
          message: errorMessage
        });

        $scope.vm.save(true);
        $httpBackend.flush();

        expect($scope.vm.error).toBe(errorMessage);
      });
    });

    describe('vm.save() as update', function () {
      beforeEach(function () {

        // Mock automaton in $scope
        $scope.vm.automaton = mockAutomaton;
      });

      it('should update a valid automaton', inject(function (AutomataService) {

        // Set PUT response
        $httpBackend.expectPUT(/api\/automata\/([0-9a-fA-F]{24})$/).respond();

        // Run controller functionality
        $scope.vm.save(true);
        $httpBackend.flush();

        // Test URL location to new object

        expect($state.go).toHaveBeenCalledWith('automata.view', {
          automatonId: mockAutomaton._id
        });
      }));

      it('should set $scope.vm.error if error', inject(function (AutomataService) {
        var errorMessage = 'error';
        $httpBackend.expectPUT(/api\/automata\/([0-9a-fA-F]{24})$/).respond(400, {
          message: errorMessage
        });

        $scope.vm.save(true);
        $httpBackend.flush();

        expect($scope.vm.error).toBe(errorMessage);
      }));
    });

    describe('vm.remove()', function () {
      beforeEach(function () {
        // Setup articles
        $scope.vm.automaton = mockAutomaton;
      });

      it('should delete the automaton and redirect to automata', function () {
        // Return true on confirm message

        spyOn(window, 'confirm').and.returnValue(true);

        $httpBackend.expectDELETE(/api\/automata\/([0-9a-fA-F]{24})$/).respond(204);

        $scope.vm.remove();
        $httpBackend.flush();

        expect($state.go).toHaveBeenCalledWith('articles.list');
      });


      it('should should not delete the automaton and not redirect', function () {
        // Return false on confirm message

        spyOn(window, 'confirm').and.returnValue(false);

        $scope.vm.remove();

        expect($state.go).not.toHaveBeenCalled();
      });
    });
  });
}());
