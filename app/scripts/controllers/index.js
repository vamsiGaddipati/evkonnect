'use strict';
var app = angular.module('SPAApp');
app.controller('IndexCtrl', ['$scope', '$location', 'Session', 'Menu', 'Logger', 'Demo', function ($scope, $location, Session, Menu, Logger, Demo) {
	$scope.Menu = Menu;
	$scope.Logger = Logger;
	Demo.setScope($scope);
	Demo.indexScope = $scope;
	$scope.Demo = Demo;
	function init() {
		$scope.menuItems = Menu.getItems();
		Menu.clear();
	}
	init();
	$scope.menuItemClick = function(menuItem) {
		Menu.menuItemClick(menuItem);
	};
	$scope.isSubPage = function() {
		return Menu.isSubPage();
	};
	$scope.getPath = function() {
		return $location.path();
	};
	Menu.setSubPage(true);
	Session.validate(
		function(){
			$location.path('/');
		}
	);
	$scope.getAnimationClasses = function() {
		return {enter: 'view-enter', leave: 'view-leave'};
	};
	$scope.getAnimationDirectionClass = function() {
		var c = Menu.isSubPage()?'LR':'RL';
		return c;
	};
}]);
