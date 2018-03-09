'use strict';

describe('Classrooms E2E Tests:', function () {
  describe('Test Classrooms page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/classrooms');
      expect(element.all(by.repeater('classroom in classrooms')).count()).toEqual(0);
    });
  });
});
