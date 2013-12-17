function loadProfile(){
    var request = gapi.client.plus.people.get( {'userId' : 'me'} );
    request.execute(loadProfileCallback);
  }

  function loadProfileCallback(obj) {
   angular.element(document.getElementById("appBody")).scope().$apply(
		function($scope) {
			$scope.googleLogin(obj);
		}
	);
  }

function signinCallback(authResult) {
  if (authResult) {
      if (authResult['error'] == undefined){
     
        gapi.client.load('plus','v1', loadProfile);  // Trigger request to get the email address.
      } else {
        console.log('An error occurred');
      }
    } else {
      console.log('Empty authResult');  // Something went wrong
    }
}