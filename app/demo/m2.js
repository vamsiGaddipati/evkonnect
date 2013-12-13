'use strict';
var app = angular.module('app', []);
app.filter('range', function() {
  return function(input, total) {
    total = parseInt(total);
	if (total > 20) {
		total = 20;
	}
    for (var i=0; i<total; i++)
      input.push(i);
    return input;
  };
});
app.controller('M2Ctrl', ['$scope', '$rootScope', '$window', function ($scope, $rootScope, $window) {
	$scope.d = {demo:true, autoDemo:false, pauseDemo:false, startDemo: false, total:3};
	$scope.$watch("d", function(n, o){
		$('iframe').each(function () {
			if ($(this)[0].contentWindow && $(this)[0].contentWindow.onDemoParamsChange) {
		        $(this)[0].contentWindow.onDemoParamsChange(n, o);
			}
		});
	}, true);
	window.onChangeDemoParam = function(k, v) {
		if (k === 'demo') {
			// setTimeout(function(){
			// 	$scope.$apply(function(){
			// 		$scope.d.demo = v;
			// 	});
			// },1);			
		} else if (k === 'autoDemo') {
			// setTimeout(function(){
			// 	$scope.$apply(function(){
			// 		$scope.d.autoDemo = v;
			// 	});
			// },1);			
		} else if (k === 'pauseDemo') {
			// setTimeout(function(){
			// 	$scope.$apply(function(){
			// 		$scope.d.pauseDemo = v;
			// 	});
			// },1);
		} else if (k === 'startDemo') {
			setTimeout(function(){
				$scope.$apply(function(){
					$scope.d.startDemo = v;
				});
			},1);
		} else if (k === 'demoOrientation') {
			setTimeout(function(){
				$scope.$apply(function(){
					if (v === 'landscape') {
						$scope.d.toggle = true;
					} else {
						$scope.d.toggle = false;
					}
				});
			},1);
		}
	};
}]);