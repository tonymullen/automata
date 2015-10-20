'use strict';

describe('Automata E2E Tests:', function () {
  describe('Test automata page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/automata');
      expect(element.all(by.repeater('automaton in automata')).count()).toEqual(0);
    });
  });
});
