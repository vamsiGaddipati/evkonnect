'use strict';
var app = angular.module('SPAApp');
app.controller('IndexCtrl', ['$scope', '$location', '$rootScope','RaModel', 'QCalls','Session', 'Menu', 'Logger', 'Demo', function ($scope, $location,$rootScope,RaModel,QCalls,Session, Menu, Logger, Demo) {
	$scope.Menu = Menu;
	$scope.Logger = Logger;
	Demo.setScope($scope);
	Demo.indexScope = $scope;
	$scope.Demo = Demo;
	var $this = this;
	$scope.loading = false;
	function init() {
		$scope.menuItems = Menu.getItems();
		Menu.clear();
		//$this.getLinkedInData();
	}
	
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


	this.insertNewUser = function(userId) {
		var data = $scope.personDetails;
		RaModel.save({'dataSource':'Users','operation':'insert'}, { "sessionId":Session.get().sessionId,
	  'firstName':data.firstName,
	  'lastName':  data.lastName,
	  "title":data.title,                      
	  "phone":data.phoneNumbers,       
      "emailAddress":data.emailAddress,
      "profileUrl":data.profileUrl,
      "publicProfileUrl":data.publicProfileUrl,

      "linkedinUsername":data.linkedinUsername,
	  'twitterUsername':data.twitterUsername,
	  'userId':userId,

	 	}, function(result){
			console.log(result);
			$location.path("/myevents");		
		});

	}

	$scope.email = "";
	$scope.guestLogin = function(emailAddress) {
		if(emailAddress === '' || emailAddress === null)  {
			Logger.showAlert("Please enter valid email address","Error");
			return;
		}

		if(emailAddress.indexOf('@') < 0 || emailAddress.indexOf('.')  < 0 || emailAddress.length <3 )  {
			Logger.showAlert("Please enter valid email address","Error");
			return;
		}
		$scope.loading = true; 

		var callback = function(response) {
		
	    			if(response.indexOf("@_") > -1) {
			    				var responsenative = response.substring(0,response.indexOf("@_"));
			    				var responjson = angular.fromJson(responsenative);
			    				if(responjson.Error) {
			    					Logger.showAlert(responjson.Error,"Error");
			    					return;
			    				}
			    				Session.set("sessionId",responjson.sessionId);
			    				Session.set("userId",responjson.userId);
			    				Session.set("displayName",emailAddress);
			    				
			    				Session.store();
			    				if(responjson.userCount == 0) {
				    				console.log("********** new user*************"+responjson.userId);
				    				var personDetails = {};
				    				personDetails.firstName = emailAddress;
				    				personDetails.lastName = "";
				    				personDetails.title = "";
									personDetails.emailAddress = emailAddress;
				    				$scope.personDetails = personDetails;
				    				$scope.loading = false; 
				    				$this.insertNewUser(responjson.userId);
			    				} else {
			    					console.log("********** existing*************");
			    					$scope.loading = false; 
			    					$location.path("/myevents");		
			    				}
			    			} else {
			    				$scope.loading = false;
			    				/*alert(response);
			    				var responjson = angular.fromJson(response);
			    				if(responjson.Error) {
			    					Logger.showAlert(responjson.Error,"Error");
			    					return;
			    				} else {*/
			    					Logger.showAlert("Unable to create/access user information!"+response,"Error");
			    				//}
			    			}
			    
	};

		    	//alert(phoneNumbers)
			    	//var requrl = "pictureUrl="+pictureUrl+"&publicProfileUrl="+publicProfileUrl
			    	            //  +"&firstName="+firstName+"&lastName="+lastName     
			    	             // +"&phoneNumbers="+phoneNumbers;
			    	QCalls.waitForAllQCalls(homeBaseUrl+'h/customlogin?_dn='+emailAddress+"&_ea="+emailAddress,callback);
	

	}



	$scope.googleLogin = function(obj) {

		console.log(obj);
   //from the filtered results, should always be defined.
    var email = obj.emails[0].value;
    var displayName = obj.displayName;
    var firstName = obj.name.givenName;
    var lastName = obj.name.familyName;
    var title = obj.occupation;
    var pictureUrl = obj.image.url;
    var publicProfileUrl = obj.url;
    $scope.loading = true; 
    console.log("Getting here.....");
	/*var request = $.ajax({
	    url: "http://tevents.rapapp.com/h/customlogin",
	    type: "GET",
	    data: {'_ea':email, '_dn':displayName,'firstName':firstName,'lastName':lastName,'title':title,'pictureUrl':pictureUrl,'publicProfileUrl':publicProfileUrl},
	    dataType: "html"
	});
	*/var callback = function(response) {
		
	    			if(response.indexOf("@_") > -1) {
			    				var responsenative = response.substring(0,response.indexOf("@_"));
			    				var responjson = angular.fromJson(responsenative);
			    				Session.set("sessionId",responjson.sessionId);
			    				Session.set("userId",responjson.userId);
			    				Session.set("displayName",firstName+" "+lastName);
			    				
			    				Session.store();
			    				//alert(Session.get().displayName);
			    				//alert("stored");
			    				if(responjson.userCount == 0) {
				    				console.log("********** new user*************8");
				    				var personDetails = {};
				    				personDetails.firstName = firstName;
				    				personDetails.lastName = lastName;
				    				personDetails.title = title;
				    				personDetails.profileUrl = pictureUrl;
				    				personDetails.publicProfileUrl = publicProfileUrl;
				    				personDetails.emailAddress = email;
				    				console.log("google:"+personDetails);
				    				$scope.personDetails = personDetails;
				    				$this.insertNewUser(responjson.userId);
			    				} else {
			    					console.log("********** existing*************");
			    					$scope.loading  = false;
			    					$location.path("/myevents");		
			    				}
			    			} else {
			    				console.log("Error:"+response);
			    				$scope.loading = false; 
			    				Logger.showAlert("Unable to create/access user information!"+response,"Error");
			    			}
			    
	};

		    	//alert(phoneNumbers)
			    	//var requrl = "pictureUrl="+pictureUrl+"&publicProfileUrl="+publicProfileUrl
			    	            //  +"&firstName="+firstName+"&lastName="+lastName     
			    	             // +"&phoneNumbers="+phoneNumbers;
			    	QCalls.waitForAllQCalls(homeBaseUrl+'h/customlogin?_dn='+displayName+"&_ea="+email,callback);
	

	}
	$scope.personDetails = {};
	$scope.getLinkedInData = function() {
	
		if(!$scope.hasOwnProperty("userprofile")){
		$scope.loading = true; 
			//alert("********34343");
			IN.API.Profile("me").fields(
					[ "id","firstName", "lastName","emailAddress", "pictureUrl",
							"phoneNumbers","twitterAccounts","headline","publicProfileUrl" ]).result(function(result) {
				// set the model
				$rootScope.$apply(function() {
					var userprofile =result.values[0]
					$rootScope.userprofile = userprofile;
					console.log(userprofile.phoneNumbers);
					console.log(userprofile.headline);
					
					$rootScope.loggedUser = true;
					//alert("**email"+userprofile.emh/customlogin?lAddress+"*******");
			    	//go to main
			    	//?_dn=brucelee&_ea=dadslf@asdf.com

					//alert("**email** index"+userprofile.emailAddress+"*******");
			    	//go to main
			    	$rootScope.userId = "";
			    	var dn = userprofile.firstName+""+userprofile.lastName;
			    	var ea = userprofile.emailAddress;
			    	var personDetails = {};
			    				personDetails.firstName = userprofile.firstName;
			    				personDetails.lastName = userprofile.lastName;
			    				personDetails.title = userprofile.headline;
			    				personDetails.profileUrl = userprofile.pictureUrl;
			    				personDetails.publicProfileUrl = userprofile.publicProfileUrl;
			    				personDetails.emailAddress = userprofile.emailAddress;
			    				personDetails.linkedinUsername = userprofile.publicProfileUrl;
			    				personDetails.twitterUsername = userprofile.twitterAccounts.values[0].providerAccountName;
			    				
			    				console.log(personDetails.twitterUsername)
			    					$scope.personDetails = personDetails;
			    					console.log("linkedin:"+personDetails);
			    	var callback = function(response,status, $rootScope,userprofile) {
			    			console.log("response:"+response);
			    			if(response.indexOf("@_") > -1) {
			    				var responsenative = response.substring(0,response.indexOf("@_"));
			    				var responjson = angular.fromJson(responsenative);
			    				Session.set("sessionId",responjson.sessionId);
			    				Session.set("userId",responjson.userId);
			    				Session.set("displayName",$scope.personDetails.firstName+" "+$scope.personDetails.lastName);
			    				Session.store();
			    				//alert(Session.get().displayName);
			    				$scope.personDetails = personDetails;

			    				if(responjson.userCount == 0) {
				    				console.log("********** new user*************8");
								$this.insertNewUser(responjson.userId);
								$scope.loading = false; 
								} else {
									console.log("********** existing*************");
									$scope.loading = false; 
			    					$location.path("/myevents");		
			    					
								}
			    				
			    				
			    			} else {
			    				console.log("Error:"+response);
			    				$scope.loading = false; 
			    				Logger.showAlert("Unable to create/access user information!"+response,"Error");
			    			}
			    			
			    	}
			    	var phoneNumbers = "";
			    	if(userprofile.phoneNumbers) {
			    		if(userprofile.phoneNumbers.values) {
			    			for(var counter = 0; counter < userprofile.phoneNumbers.values.length;counter++) {
			    				phoneNumbers += userprofile.phoneNumbers.values[counter].phoneNumber+","; //tracking only one phone number

			    		 }
			    		}
			    	}
			    	//alert(phoneNumbers)
			    	var requrl = "pictureUrl="+userprofile.pictureUrl+"&publicProfileUrl="+userprofile.publicProfileUrl
			    	              +"&firstName="+userprofile.firstName+"&lastName="+userprofile.lastName     
			    	              +"&phoneNumbers="+phoneNumbers;
			    	QCalls.waitForAllQCalls(homeBaseUrl+'h/customlogin?_dn='+dn+"&_ea="+ea,callback);
					
				});
			}).error(function(err) {
				$scope.error = err;
				alert(err); 
			});
		}
	};



	init();
  //logout and go to login screen
	$scope.logoutLinkedIn = function() {
    //retrieve values from LinkedIn
		Session.signOff();
	};  
}]);
