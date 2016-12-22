(function (app) {
  'use strict';

  // Use ApplicationConfiguration module to register a new module
  app.registerModule('itsADrag');
  app.registerModule('resizeIt');
  app.registerModule('windows', ['itsADrag', 'resizeIt']);

}(ApplicationConfiguration));
