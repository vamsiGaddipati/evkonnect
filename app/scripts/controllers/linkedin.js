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

function invite() {
	 var url = '/people/~/mailbox',
	body = {
		  recipients: {
			values: [{
				person: {
				'_path': '/people/pbZVjgMetc',
				}
			}]
			},
		  subject: 'Invitation to connect.',
		  body: 'Say yes!',
				'item-content':{
					'invitation-request':{
					'connect-type':'friend',
				 	'authorization':{
	               			"name":"NAME_SEARCH",
	                        "value":"9a869d1e-709a-4fee-909a-9426e73fabd"
	                 }
	           		}
		          }
		 
		};
		var body2 = {
			 "recipients": {
			   "values": [{
			     "person": {
			       "_path": "/people/pbZVjgMetc",
			      }
			   }]
			 },
			 "subject": "JSON POST test",
			 "body": "You rule",
			 "item-content": {
			        "invitation-request": {
			                "connect-type":"friend",
			                "authorization": {
			                        "name":"OUT_OF_NETWORK",
			                        "value":"aOfX"
			             }
			         }
			   }
};
	  IN.API.Raw()
		.url(url)
		.method("POST")
		.body(JSON.stringify(body))
		.result(function (result) {
			
		console.log(result);
		})
		.error(function (error) {
		console.log(error);
		
	  });
};
