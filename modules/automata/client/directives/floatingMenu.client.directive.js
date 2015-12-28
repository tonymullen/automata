'use strict';

/***** Draggable Library *****/

angular.module('itsADrag',[])

/**
  Possible element attributes:
    1.  template
    2.  id
    3.  options - json of jquery ui draggable options
    4.  group
    5.  placeholder
**/
.directive('draggable',[function(){
  return {
    restrict : 'AE',
    link : function(scope,el,attrs){
      scope.minimized = false;
      // draggable object properties
      scope.obj = {
        id : null,
        content : '',
        group : null
      };
      scope.placeholder = false;

      /*** Setup ***/

      scope.obj.content = el.html(); // store object's content

      if(angular.isDefined(attrs.id))
        scope.obj.id = attrs.id;

      if(angular.isDefined(attrs.placeholder))
        scope.placeholder = scope.$eval(attrs.placeholder);

      // options for jQuery UI's draggable method
      var opts = (angular.isDefined(attrs.draggable)) ? scope.$eval(attrs.draggable) : {};

      if(angular.isDefined(attrs.group)){
        scope.obj.group = attrs.group;
        opts.stack = '.' + attrs.group;
      }

      // event handlers
      var evts = {
        start : function(evt,ui){
          if(scope.placeholder) // ui.helper is jQuery object
            ui.helper.wrap('<div class="dragging"></div>');

          scope.$apply(function(){ // emit event in angular context
            scope.$emit('draggable.started',{ obj: scope.obj });
          }); // end $apply
        }, // end start

        drag : function(evt){
          scope.$apply(function(){ // emit event in angular context
            scope.$emit('draggable.dragging');
          }); // end $apply
        }, // end drag

        stop : function(evt,ui){
          if(scope.placeholder)
            ui.helper.unwrap();

          scope.$apply(function(){ // emit event in angular context
            scope.$emit('draggable.stopped');
          }); // end $apply
        } // end stop
      }; // end evts

      // combine options and events
      var options = angular.extend({},opts,evts);
      el.draggable(options); // make element draggable
    } // end link
  }; // end return
}]) // end draggable

.run(['$templateCache',function($templateCache){
  $templateCache.put('/tmpls/draggable/default','<div ng-transclude></div>');
}]); // end itsADrag.run

angular.module('resizeIt',[])
/**
  jQuery UI resizable adds exact pixel width and heights to the element via a style tag.
**/
.directive('resizeable',['$timeout', function($timeout){
  return {
    restrict : 'A',
    link : function(scope,el,attrs,ctrlr){
      scope.obj = {
        el : null,
        id : null,
        size : null // {width,height}
      };

      /*** Setup ***/

      scope.obj.el = el; // save handle to element

      if(angular.isDefined(attrs.id))
        scope.obj.id = attrs.id;

      var opts = (angular.isDefined(attrs.resizeable)) ? scope.$eval(attrs.resizeable) : {};

      var evts = {
        create : function(evt,ui){
          $timeout(function(){
            scope.$emit('resizeable.create',{ obj: scope.obj });
          });
        },// end create

        start : function(evt,ui){
          scope.$apply(function(){
            scope.$emit('resizeable.start',{ obj: scope.obj });
          });
        }, // end start

        stop : function(evt,ui){
          scope.$apply(function(){
            scope.$emit('resizeable.stop',{ 'ui': ui });
            scope.obj.size = angular.copy(ui.size);
            //console.log(scope.obj.size);
          });
        }, // end stop

        resize : function(evt,ui){
          scope.$apply(function(){
            scope.$emit('resizeable.resizing');
          });
        } // end resize
      }; // end evts

      var options = angular.extend({},opts,evts);
      el.resizable(options);

      /*** Listeners ***/

//      scope.$on('resizeable.set.height',function(evt,params){
//        if(angular.isDefined(params.height))
//          el.css('height',parseInt(params.height) + 'px');
//      }); // end on(resizeable.set.height)

      scope.$on('resizeable.set.width',function(evt,params){
        if(angular.isDefined(params.width))
          el.css('width',parseInt(params.width) + 'px');
      }); // end on(resizeable.set.width

//      scope.$on('resizeable.reset.height',function(evt){
//        if(angular.isDefined(scope.obj.size))
//          el.css('height',scope.obj.size.height + 'px');
//      }); // end on(resizeable.reset.height)

      scope.$on('resizeable.reset.width',function(evt){
        if(angular.isDefined(scope.obj.size))
          el.css('width',scope.obj.size.width + 'px');
      }); // end on(resizeable.reset.width)
    } // end link
  }; // end return
}]); // end resizeable

angular.module('windows',['ngAnimate','itsADrag','resizeIt'])

.directive('window',['$animate',function($animate){
  return {
    restrict : 'E',
    transclude : true,
    replace : true,
    //template: '<div class="floating-window" id="{{id}}" draggable="{handle: \'div.panel-heading\',opacity: 0.5}"><div class="panel panel-primary" resizeable="{handles: \'se\', alsoResize: \'#windowBodyContent\'}"><div class="panel-heading cursor-move" id="windowHeading"><span class="pull-right"><a type="button" id="windowMinimizeBtn" class="btn btn-primary btn-xs" ng-click="minimize()"><span class="glyphicon" ng-class="{false: \'glyphicon-chevron-up\',true: \'glyphicon-chevron-down\'}[minimized]"></span></a></span><span><big>{{title}}</big></span></div><div id="windowBody"><div class="panel-body" id="windowBodyContent" ng-transclude></div><div class="panel-footer"><small>&nbsp;</small><span class="pull-right glyphicon glyphicon-resize-full ui-resizable-handle ui-resizable-se"></span></div></div></div></div>',
    templateUrl : 'modules/automata/client/directives/tape.html',
    scope : {
      id : '@id',
      title : '@title'
    },
    link : function(scope,el,attr){
      scope.minimized = false;

      /** Methods **/
      scope.minimize = function(){
        scope.minimized = !scope.minimized;

        if(angular.equals(scope.minimized,true)){
          $animate.addClass(el,'minimize');
        }else{
          $animate.removeClass(el,'minimize');
        }
      }; // end minimize

    } // end link
  }; // end return
}]) // end window


.run(['$templateCache', '$http', function($templateCache, $http){
  //$templateCache.put('/tmpls/window', '<div class="floating-window" id="{{id}}" draggable="{handle: \'div.panel-heading\',opacity: 0.5}"><div class="panel panel-primary" resizeable="{handles: \'se\', alsoResize: \'#windowBodyContent\'}"><div class="panel-heading cursor-move" id="windowHeading"><span class="pull-right"><a type="button" id="windowMinimizeBtn" class="btn btn-primary btn-xs" ng-click="minimize()"><span class="glyphicon" ng-class="{false: \'glyphicon-chevron-up\',true: \'glyphicon-chevron-down\'}[minimized]"></span></a></span><span><big>{{title}}</big></span></div><div id="windowBody"><div class="panel-body" id="windowBodyContent" ng-transclude></div><div class="panel-footer"><small>&nbsp;</small><span class="pull-right glyphicon glyphicon-resize-full ui-resizable-handle ui-resizable-se"></span></div></div></div></div>');
  $http.get('modules/automata/client/directives/tape.html', { cache:$templateCache });
}]); // end windows


/***** Application *****/
/*
angular.module('adminMenu',['windows','ui.bootstrap'])

.controller('aMenuCtrl',['$scope',function($scope){
  $scope.onAtATime = true;
}]); // end aMenuCtrl
*/
