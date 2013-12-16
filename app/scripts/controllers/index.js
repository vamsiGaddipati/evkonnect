'use strict';
var app = angular.module('SPAApp');
app.controller('IndexCtrl', ['$scope', '$location', '$rootScope', 'QCalls','Session', 'Menu', 'Logger', 'Demo', function ($scope, $location,$rootScope, QCalls,Session, Menu, Logger, Demo) {
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


	$scope.getLinkedInData = function() {
		if(!$scope.hasOwnProperty("userprofile")){
			//alert("********34343");
			IN.API.Profile("me").fields(
					[ "id", "firstName", "lastName","emailAddress", "pictureUrl",
							"publicProfileUrl" ]).result(function(result) {
				// set the model
				$rootScope.$apply(function() {
					var userprofile =result.values[0]
					$rootScope.userprofile = userprofile;
					$rootScope.loggedUser = true;
					//alert("**email"+userprofile.emh/customlogin?lAddress+"*******");
			    	//go to main
			    	//?_dn=brucelee&_ea=dadslf@asdf.com

					//alert("**email** index"+userprofile.emailAddress+"*******");
			    	//go to main
			    	$rootScope.userId = "";
			    	var dn = userprofile.firstName+""+userprofile.lastName;
			    	var ea = userprofile.emailAddress;
			    	var callback = function(response,status, $rootScope,userprofile) {
			    			//alert(status);
			    			console.log("response:"+response);
			    			if(response.indexOf("@_") > -1) {
			    				var responsenative = response.substring(0,response.indexOf("@_"));
			    			//	alert(responsenative);
			    			var responjson = angular.fromJson(responsenative);
			    			//alert(responjson.sessionId);
			    		//	alert(responjson.userId);
			    			
			    				Session.set("sessionId",responjson.sessionId);
			    				Session.set("userId",responjson.userId);
			    				Session.set("displayName",dn);
			    				//alert(Session.get().sessionId);
			    				Session.store();
			    				//userprofile.id = responjson.userId;
			    				//alert(userprofile.firstName);
								$location.path("/profile");		
			    			} else {
			    				console.log("Error:"+response);
			    				Logger.showError("Unable to create/access user information!","Error");
			    			}
			    			
			    	}
			    	QCalls.waitForAllQCalls(homeBaseUrl+'h/customlogin?_dn='+dn+"&_ea="+ea,callback);
					
				});
			}).error(function(err) {
				$scope.error = err;
				alert(err); 
			});
		}
	};
  //logout and go to login screen
	$scope.logoutLinkedIn = function() {
    //retrieve values from LinkedIn
		IN.User.logout();
		delete $rootScope.userprofile;
		$rootScope.loggedUser = false;
		$location.path("/login");
	};  
}]);
