(function (app) {
  'use strict';

  app.registerModule('automata', ['core', 'windows', 'ui.bootstrap']);// The core module is required for special route handling; see /core/client/config/core.client.routes
  app.registerModule('automata.services');
  app.registerModule('automata.routes', ['ui.router', 'core.routes', 'automata.services']);
}(ApplicationConfiguration));
