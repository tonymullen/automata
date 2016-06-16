'use strict';

module.exports = {
  client: {
    lib: {
      css: [
        'https://fonts.googleapis.com/css?family=Francois+One',
        'public/fonts',
        'public/fonts/automaton-icons/fonts',
        'public/fonts/automaton-icons/styles.css',
        'public/lib/bootstrap/dist/css/bootstrap.css',
        'public/lib/angular-xeditable/dist/css/xeditable.css'
      ],
      js: [
        'public/lib/jquery/dist/jquery.js',
        'public/lib/jquery-ui/jquery-ui.js',
        'public/lib/jqueryui-touch-punch/jquery.ui.touch-punch.min.js',
        'public/lib/angular/angular.js',
        'public/lib/angular-resource/angular-resource.js',
        'public/lib/angular-animate/angular-animate.js',
        'public/lib/angular-messages/angular-messages.js',
        'public/lib/angular-ui-router/release/angular-ui-router.js',
        'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
        'public/lib/angular-file-upload/dist/angular-file-upload.js',
        'public/lib/owasp-password-strength-test/owasp-password-strength-test.js',
        'public/js/my_cytoscape.js',
      //  'public/test/test-cytoscape-edgehandles/cytoscape.js-snapshot/cytoscape.js',
        'public/lib/cytoscape-edgehandles/cytoscape-edgehandles.js',
      //  'public/test/test-cytoscape-edgehandles/cytoscape.js-edgehandles-master/cytoscape-edgehandles.js',
        'public/lib/ng-context-menu/dist/ng-context-menu.min.js',
        'public/lib/cytoscape-cxtmenu/cytoscape-cxtmenu.js',
        'public/lib/angular-xeditable/dist/js/xeditable.js',
        'public/js/jsPDF/dist/jspdf.min.js'
      ],
      tests: ['public/lib/angular-mocks/angular-mocks.js']
    },
    css: [
      'modules/*/client/css/*.css'
    ],
    less: [
      'modules/*/client/less/*.less'
    ],
    sass: [
      'modules/*/client/scss/*.scss'
    ],
    js: [
      'modules/core/client/app/config.js',
      'modules/core/client/app/init.js',
      'modules/*/client/*.js',
      'modules/*/client/**/*.js'
    ],
    img: [
      'modules/**/*/img/**/*.jpg',
      'modules/**/*/img/**/*.png',
      'modules/**/*/img/**/*.gif',
      'modules/**/*/img/**/*.svg'
    ],
    views: ['modules/*/client/views/**/*.html'],
    templates: ['build/templates.js']
  },
  server: {
    gruntConfig: ['gruntfile.js'],
    gulpConfig: ['gulpfile.js'],
    allJS: ['server.js', 'config/**/*.js', 'modules/*/server/**/*.js'],
    models: 'modules/*/server/models/**/*.js',
    routes: ['modules/!(core)/server/routes/**/*.js', 'modules/core/server/routes/**/*.js'],
    sockets: 'modules/*/server/sockets/**/*.js',
    config: ['modules/*/server/config/*.js'],
    policies: 'modules/*/server/policies/*.js',
    views: ['modules/*/server/views/*.html']
  }
};
