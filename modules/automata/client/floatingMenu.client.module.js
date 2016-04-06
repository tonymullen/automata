(function (app) {
  'use strict';

  // Use Applicaion configuration module to register a new module
  app.registerModule('itsADrag');
  app.registerModule('resizeIt');
  app.registerModule('windows', ['itsADrag', 'resizeIt']);

}(ApplicationConfiguration));
