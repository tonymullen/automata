'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('itsADrag');
ApplicationConfiguration.registerModule('resizeIt');
ApplicationConfiguration.registerModule('windows',['itsADrag','resizeIt']);
