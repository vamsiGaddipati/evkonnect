//LinkedIn functions
//Execute on load profile 
function onLinkedInLoad() {
//	alert('*******');
	IN.Event.on(IN, "auth", function() {
		onLinkedInLogin();
	});
	IN.Event.on(IN, "logout", function() {
		onLinkedInLogout();
	});
}

//execute on logout event
function onLinkedInLogout() {
	location.reload(true);
}

//execute on login event
function onLinkedInLogin() {
	//alert("*****66666**");
	// pass user info to angular
	angular.element(document.getElementById("appBody")).scope().$apply(
		function($scope) {
			$scope.getLinkedInData();
		}
	);
}