'use strict';

(function () {
  // Automata Controller Spec
  describe('Automata Controller Tests', function () {
    // Initialize global variables
    var AutomataController,
      scope,
      $httpBackend,
      $stateParams,
      $location,
      Authentication,
      Automata,
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
    beforeEach(inject(function ($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_, _Authentication_, _Automata_) {
      // Set a new global scope
      scope = $rootScope.$new();

      // Point global variables to injected services
      $stateParams = _$stateParams_;
      $httpBackend = _$httpBackend_;
      $location = _$location_;
      Authentication = _Authentication_;
      Automata = _Automata_;

      // create mock automaton
      mockAutomaton = new Automata({
        _id: '525a8422f6d0f87f0e407a33',
        title: 'An Automaton about MEAN',
        content: 'MEAN rocks!'
      });

      // Mock logged in user
      Authentication.user = {
        roles: ['user']
      };

      // Initialize the Automata controller.
      AutomataController = $controller('AutomataController', {
        $scope: scope
      });
    }));

    it('$scope.find() should create an array with at least one automaton object fetched from XHR', inject(function (Automata) {
      // Create a sample automata array that includes the new automaton
      var sampleAutomata = [mockAutomaton];

      // Set GET response
      $httpBackend.expectGET('api/automata').respond(sampleAutomata);

      // Run controller functionality
      scope.find();
      $httpBackend.flush();

      // Test scope value
      expect(scope.automata).toEqualData(sampleAutomata);
    }));

    it('$scope.findOne() should create an array with one automaton object fetched from XHR using a automatonId URL parameter', inject(function (Automata) {
      // Set the URL parameter
      $stateParams.automatonId = mockAutomaton._id;

      // Set GET response
      $httpBackend.expectGET(/api\/automata\/([0-9a-fA-F]{24})$/).respond(mockAutomaton);

      // Run controller functionality
      scope.findOne();
      $httpBackend.flush();

      // Test scope value
      expect(scope.automaton).toEqualData(mockAutomaton);
    }));

    describe('$scope.create()', function () {
      var sampleAutomatonPostData;

      beforeEach(function () {
        // Create a sample automaton object
        sampleAutomatonPostData = new Automata({
          title: 'An Automaton about MEAN',
          content: 'MEAN rocks!'
        });

        // Fixture mock form input values
        scope.title = 'An Automaton about MEAN';
        scope.content = 'MEAN rocks!';

        spyOn($location, 'path');
      });

      it('should send a POST request with the form input values and then locate to new object URL', inject(function (Automata) {
        // Set POST response
        $httpBackend.expectPOST('api/automata', sampleAutomatonPostData).respond(mockAutomaton);

        // Run controller functionality
        scope.create(true);
        $httpBackend.flush();

        // Test form inputs are reset
        expect(scope.title).toEqual('');
        expect(scope.content).toEqual('');

        // Test URL redirection after the automaton was created
        expect($location.path.calls.mostRecent().args[0]).toBe('automata/' + mockAutomaton._id);
      }));

      it('should set scope.error if save error', function () {
        var errorMessage = 'this is an error message';
        $httpBackend.expectPOST('api/automata', sampleAutomatonPostData).respond(400, {
          message: errorMessage
        });

        scope.create(true);
        $httpBackend.flush();

        expect(scope.error).toBe(errorMessage);
      });
    });

    describe('$scope.update()', function () {
      beforeEach(function () {
        // Mock automaton in scope
        scope.automaton = mockAutomaton;
      });

      it('should update a valid automaton', inject(function (Automata) {
        // Set PUT response
        $httpBackend.expectPUT(/api\/automata\/([0-9a-fA-F]{24})$/).respond();

        // Run controller functionality
        scope.update(true);
        $httpBackend.flush();

        // Test URL location to new object
        expect($location.path()).toBe('/automata/' + mockAutomaton._id);
      }));

      it('should set scope.error to error response message', inject(function (Automata) {
        var errorMessage = 'error';
        $httpBackend.expectPUT(/api\/automata\/([0-9a-fA-F]{24})$/).respond(400, {
          message: errorMessage
        });

        scope.update(true);
        $httpBackend.flush();

        expect(scope.error).toBe(errorMessage);
      }));
    });

    describe('$scope.remove(automaton)', function () {
      beforeEach(function () {
        // Create new automata array and include the automaton
        scope.automata = [mockAutomaton, {}];

        // Set expected DELETE response
        $httpBackend.expectDELETE(/api\/automata\/([0-9a-fA-F]{24})$/).respond(204);

        // Run controller functionality
        scope.remove(mockAutomaton);
      });

      it('should send a DELETE request with a valid automatonId and remove the automaton from the scope', inject(function (Automata) {
        expect(scope.automata.length).toBe(1);
      }));
    });

    describe('scope.remove()', function () {
      beforeEach(function () {
        spyOn($location, 'path');
        scope.automaton = mockAutomaton;

        $httpBackend.expectDELETE(/api\/automata\/([0-9a-fA-F]{24})$/).respond(204);

        scope.remove();
        $httpBackend.flush();
      });

      it('should redirect to automata', function () {
        expect($location.path).toHaveBeenCalledWith('automata');
      });
    });
  });
}());
