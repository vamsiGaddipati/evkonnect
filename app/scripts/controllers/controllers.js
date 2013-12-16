'use strict';
var app = angular.module('SPAApp');

app.controller('MainCtrl', ['$scope', '$location', 'alarmService', 'Logger','RaModel', 'Menu', 'Session', 'Cache', 'Demo', function ($scope, $location, alarmService, Logger,RaModel,Menu, Session, Cache, Demo) {
	Menu.setActiveCode('/');
	$scope.Menu = Menu;
	$scope.Demo = Demo;
	$scope.showIntro = Cache.get('showIntro');

var tweets = Cache.get('tweets'), a = Cache.get('_a'), c, _limit = 20, $this = this;
	$scope.sessionId = "";
	
	this.initScope = function() {
		a.data = tweets;
		a.selection = 'Tweets';
		$scope.displayName = Session.get().displayName;
		a.tweets = {};
		a.tweets.data = [];
		a.tweets.offset = 0;
		a.tweets.initialized = false;
		a.tweets.hasMore = false;
		a.tweets.loading = false;

		$scope.a = a;
		$this.tweetsQuery();
	};
  	

	if ($scope.showIntro === undefined) {
		$scope.showIntro = true;
	}
/*	setTimeout(function(){
		$scope.$apply(function(){
			$scope.showIntro = false;
			Cache.put('showIntro', $scope.showIntro);
		});
	}, 5000);
*//*
	$scope.userName = Session.get().displayName;
	$scope.session = Session.get();
*/
	
	$scope.getMoreTweets = function() {
		console.log("********");
		if (a.tweets.loading || !a.tweets.hasMore) {
			return;
		}
		a.tweets.offset += _limit;
		$this.tweetsQuery();aler
	};

	this.tweetsQuery = function(){
			a.tweets.loading = true;

			RaModel.query({'dataSource':'TweetFeed'}, {'limit':_limit,'offset':a.tweets.offset, 'params':{'executeCountSql': 'N'}, 'select':['imageurl','tweet'],'sessionId':Session.get().sessionId}, function(result){
					if (result.$error) {
						Logger.showAlert(result.errorMessage, result.errorTitle);
					} else {tweets
						if (result.data.length > 0) {
							a.tweets.data.push.apply(a.tweets.data, result.data);
							if (result.data.length < _limit) {
								a.tweets.hasMore = false;
							} else {
								a.tweets.hasMore = true;
							}
						} else {
							a.tweets.hasMore = false;
						}
						Cache.put('_a', a);
					}
					a.tweets.loading = false;
				}
			);
	   
	};


	$scope.signOff = function() {
		Session.signOff();
	};

this.init = function(){
		a = {};
	};
	if (a === undefined) {
		this.init();
		Cache.put('_a', a);
	}
	this.initScope();

}]);



app.controller('ConnectionCtrl', ['$timeout','$rootScope','$scope','$http' ,'$location', '$window','RaModel', 'Session', 'Cache', 'Menu','Logger', function ($timeout,$rootScope,$scope, $http,$location,$window, RaModel,Session, Cache, Menu, Logger) {
	var attendees = Cache.get('attendees'), a = Cache.get('_a'), c, _limit = 20, $this = this;
	$scope.sessionId = "";
	$scope.getMoreAttendees = function() {
		if (a.attendees.loading || !a.attendees.hasMore) {
			return;
		}
		a.attendees.offset += _limit;
		$this.attendeesQuery();
	};
	this.initScope = function() {
		a.data = attendees;
		a.selection = 'Connections';
		$scope.displayName = Session.get().displayName;
		a.attendees = {};
		a.attendees.data = [];
		a.attendees.offset = 0;
		a.attendees.initialized = false;
		a.attendees.hasMore = false;
		a.attendees.loading = false;

		a.attendeeDetails = {};
		a.attendeeDetails.data = [];
		a.attendeeDetails.offset = 0;
		a.attendeeDetails.initialized = false;
		a.attendeeDetails.hasMore = false;
		a.attendeeDetails.loading = false;
		a.attendeeDetails.imagesloading = false;
		a.attendeeDetails.images = {};
		a.attendeeDetails.images.data = [];
		a.attendeeDetails.imagesrefresh = false;
		a.patientComments = {};
		a.patientComments.data = [];
		a.patientComments.initialized = false;
		a.patientComments.loading = false;
		//a.attendeeDetails.imagesloading
		$scope.a = a;
		$this.attendeesQuery();
	};
  	
	this.init = function(){
		a = {'pageTitle':'Connections'};
	};

	this.attendeesQuery = function(){
			a.attendees.loading = true;	 
			RaModel.query({'dataSource':'UserConnctionsV'}, {'limit':_limit,'offset':a.attendees.offset, 'params':{'executeCountSql': 'N'}, 'sessionId':Session.get().sessionId,'data':{'userId':Session.get().userId}, 'select': ['firstName','lastName','emailAddress','phone','title','about','twitterName','linkedinName'],'orderBy': '#creationDate# DESC'}, function(result){
					if (result.$error) {
						Logger.showAlert(result.errorMessage, result.errorTitle);
					} else {
						if (result.data.length > 0) {
							a.attendees.data.push.apply(a.attendees.data, result.data);
							if (result.data.length < _limit) {
								a.attendees.hasMore = false;
							} else {
								a.attendees.hasMore = true;
							}
						} else {
							a.attendees.hasMore = false;
						}
						Cache.put('_a', a);
					}
					a.attendees.loading = false;
				}
			);
	   
	};


	$scope.$watch('a.selection', function(newValue, oldValue){
		Logger.log(oldValue + '->' + newValue);
		//alert(newValue);
		/*
		a.attendees.initialized = true;
		*/if (newValue === 'Connections') {
			a.pageTitle = 'Connections';
			
			//$this.attendeesQuery();
			if (a.attendees.initialized) {
				return;
			}
			
		} else if (newValue === 'AttendeeDetails') {
			a.pageTitle = 'Attendee';
		} 
	});

	$scope.openPopup = function(urlIndex1) {
               $scope.imageselected = true;
               //alert(urlIndex1);
               $scope.urlIndex = urlIndex1+"";
             //  alert($scope.urlIndex);
             
    };


	$scope.closePopup = function() {
	               $scope.imageselected = false;
	};
	
	$scope.$watch('a.attendees.current', function(a, o){
		Logger.log(o + '->' + a);
		if (o){
			Logger.log(o.patientId + ',' + o.facility + ', ' + o.state + ' ' + o.postalCode);
		}
		if (a){
			$scope.a.pageTitle = 'Attendee';
			Logger.log(a.patientId +  ',' + a.city + ', ' + a.state + ' ' + a.postalCode);
			//$this.attendeeDetailsQuery(a.patientId);
			
		}
	}, true);

	/*

		$scope.openCamera  = function() {

			a.attendeeDetails.imagesrefresh = true;
						var options = {};
					    options.fileKey="file";
					    options.fileName="patientinfo.JPG";
					    options.mimeType="image/jpeg";
					    var params = new Object();
					    params.sid = Session.get().sessionId;
					    params.name = name;
					    params.ds = "PatientReferralFormV";
					    options.params = params;
					    options.chunkedMode = false;
						CameraFactory.openCamera(options,{
							success: function(r,fileurl) {
								$scope.safeApply(function(){
									$scope.uploadingimages = false;
									var _json  = eval(r);
									if(typeof $scope.fileIds !== "undefined") {
				    					$scope.fileIds = $scope.fileIds +","+_json[0].fileId;
					    			} else {
					    				$scope.fileIds = _json[0].fileId;
					    			}
					    			var imgurl = fileUploadUrl+"?rev=1&sid="+Session.get().sessionId+"&ds=PatientReferralFormV&fid="+_json[0].fileId;
					    			var patientImgs = $scope.image_data[a.attendees.current.patientId];
					    			if(typeof patientImgs !== "undefined") {
					    					patientImgs.push(imgurl);		
					    			} else {
					    				var _imagedata = [];
					    				_imagedata.push(fileurl);
					    				$scope.image_data[a.attendees.current.patientId] = _imagedata;
					    			}
					    			var fids = $scope.fileIds;
					    			$this.insertDocument(fids);
					    			$scope.fileIds = "";
					    			a.attendeeDetails.imagesrefresh = false;
				    			});
				    		},
				    		failure : function(error) {
								Logger.showError(error);
		    				}
						});
	}
*/
	$scope.safeApply = function(fn) {
	    var phase = this.$root.$$phase;
	    if(phase == '$apply' || phase == '$digest') {
		if(fn && (typeof(fn) === 'function')) {
		  fn();
		}
	    } else {
	    	//Logger.showAlert(phase+"****** else *****");
	       this.$apply(fn);
	    }
	};

	
	$scope.insertComments = function(pid,userid,comments) {
		if(comments === '') return false;
		a.patientComments.loading = true;
		RaModel.save({'dataSource':'RefferralComments','operation':'insert'}, { "sessionId":Session.get().sessionId,
		  'patientId':pid,
		  'userId':  userid,
	  	  "comments":comments

		}, function(result){
				if (result.$error) {
					Logger.showAlert(result.errorMessage,result.errorTitle);
				} else {
					$this.loadComments(pid);
				}
		});
	};
	

	/* End */

	/* Start attendee Details */
	this.attendeeDetailsQueryInternal = function(pid){
		RaModel.query({'dataSource':'PatientReferralFormV'}, {'limit':_limit,'offset':a.attendeeDetails.offset, 'params':{'executeCountSql': 'N'}, 'sessionId':Session.get().sessionId,'data' :{'attendeeId':pid}}, function(result){
				if (result.$error) {
					Logger.showAlert(result.errorMessage, result.errorTitle);
				} else {
					if (result.data.length > 0) {

						a.attendeeDetails.data.push.apply(a.attendeeDetails.data, result.data);
						a.attendeeDetails.current = result.data[0];
						
						if (result.data.length < _limit) {
							a.attendeeDetails.hasMore = false;
						} else {
							a.attendeeDetails.hasMore = true;
						}

					} else {
						a.attendeeDetails.hasMore = false;
					}
					Cache.put('_a', a);
				}
				a.attendeeDetails.loading = false;
			});

/*			$scope.$evalAsync(this.downloadAllFiles (a.attendees.current.uploadDocIds,pid));
*/	}

	this.attendeeDetailsQuery = function(pid){
		a.attendeeDetails.loading = true;

		if(a.attendeeDetails.data.length && a.attendeeDetails.data.length > 0) {
			var recordFound = false;
			for(var counter = 0; counter < a.attendeeDetails.data.length; counter ++) {
				var attendeeDetails = a.attendeeDetails.data[counter];
				console.log("queried pid:"+pid+":"+attendeeDetails.patientId)
				if(pid === attendeeDetails.patientId) {
					recordFound = true;
					a.attendeeDetails.loading = false;
					a.attendeeDetails.current = attendeeDetails;

					a.attendeeDetails.imagesloading = false;
					break;

				}
			}
			if(!recordFound) {
				console.log("Query again...");
				$this.attendeeDetailsQueryInternal(pid);	
			} else {
				console.log("Existing record");
			}
		} else {
			console.log("No records found!");
			$this.attendeeDetailsQueryInternal(pid);
		}
	};

	this.getMoreattendeeDetails = function() {
		if (a.attendeeDetails.loading || !a.attendeeDetails.hasMore) {
			return;
		}
		a.attendeeDetails.offset += _limit;
		$this.orderQuery();
	};
	/* End attendeeDetails */
	if (a === undefined) {
		this.init();
		Cache.put('_a', a);
	}
	this.initScope();


	/*this.downloadAllFiles = function(fid,pid) {
		var imagedata = [];
		var parentimagedata = {};
		a.attendeeDetails.imagesloading = true;
		parentimagedata.pid = pid;
			var params = fileUploadUrl+"?rev=1&sid="+Session.get().sessionId+"&ds=PatientReferralFormV&fid=";
			var count = 1;
			var fileIds = [];
			if(typeof fid === "undefined") {
				a.attendeeDetails.imagesloading = false;
				return;
			}
			if(fid.indexOf(",") > -1) {
			fileIds = fid.split(",");
				count = fileIds.length;
			} else {
				fileIds[0] = fid;
			}
			for(var c = 0 ; c < count; c++) {
				if(fileIds[c] === "") {
					continue;
				} else {
				if(fileIds[c].length > 1) {
						imagedata.push(params+fileIds[c]);
				}
			}
			}
			a.attendeeDetails.imagesloading = false;
			$scope.image_data[pid] = imagedata;
	};
*/
}]);


app.controller('PeopleCtrl', ['$timeout','$rootScope','$scope','$http' ,'$location', '$window','RaModel', 'Session', 'Cache', 'Menu','Logger', function ($timeout,$rootScope,$scope, $http,$location,$window, RaModel,Session, Cache, Menu, Logger) {
	var peoples = Cache.get('peoples'), a = Cache.get('_a'), c, _limit = 20, $this = this;
	$scope.sessionId = "";
	
	this.initScope = function() {
		a.data = peoples;
		a.selection = 'People';
		$scope.displayName = Session.get().displayName;
		a.peoples = {};
		a.peoples.data = [];
		a.peoples.offset = 0;
		a.peoples.initialized = false;
		a.peoples.hasMore = false;
		a.peoples.loading = false;

		a.peopleDetails = {};
		a.peopleDetails.data = [];
		a.peopleDetails.offset = 0;
		a.peopleDetails.initialized = false;
		a.peopleDetails.hasMore = false;
		a.peopleDetails.loading = false;
		a.peopleDetails.imagesloading = false;
		$scope.a = a;
		$this.peoplesQuery();
	};
  	
  	$scope.getMorePeoples = function() {   
		if (a.peoples.loading || !a.peoples.hasMore) {
			return;
		}
		a.peoples.offset += _limit;
		$this.peoplesQuery();
	};
	this.init = function(){
		a = {'pageTitle':'People'};
	};

	$scope.getMorePeople = function() {
		if (a.peoples.loading || !a.peoples.hasMore) {
			return;
		}
		a.peoples.offset += _limit;
		$this.peoplesQuery();
	};

	this.peoplesQuery = function(){
			a.peoples.loading = true;

			RaModel.query({'dataSource':'EventUsersV'}, {'limit':_limit,'offset':a.peoples.offset, 'params':{'executeCountSql': 'N'}, 'select':['userName','userId'],'sessionId':Session.get().sessionId,'orderBy': '#creationDate# DESC'}, function(result){
					if (result.$error) {
						Logger.showAlert(result.errorMessage, result.errorTitle);
					} else {
						if (result.data.length > 0) {
							a.peoples.data.push.apply(a.peoples.data, result.data);
							if (result.data.length < _limit) {
								a.peoples.hasMore = false;
							} else {
								a.peoples.hasMore = true;
							}
						} else {
							a.peoples.hasMore = false;
						}
						Cache.put('_a', a);
					}
					a.peoples.loading = false;
				}
			);
	   
	};


	$scope.$watch('a.selection', function(newValue, oldValue){
		Logger.log(oldValue + '->' + newValue);
		//alert(newValue);
		/*
		a.peoples.initialized = true;
		*/if (newValue === 'People') {
			a.pageTitle = 'People';
			
			//$this.peoplesQuery();
			if (a.peoples.initialized) {
				return;
			}
			
		} else if (newValue === 'peopleDetails') {
			a.pageTitle = 'Attendee';
		} 
	});
	$scope.$watch('a.peoples.current', function(a, o){
		Logger.log(o + '->' + a);
		if (o){
			Logger.log(o.userId);
		}
		if (a){
			$scope.a.pageTitle = 'People';
			Logger.log(a.userId +  ',' + a.city + ', ' + a.state + ' ' + a.postalCode);
			$this.peopleDetailsQuery(a.userId);
			
		}
	}, true);
	$scope.safeApply = function(fn) {
	    var phase = this.$root.$$phase;
	    if(phase == '$apply' || phase == '$digest') {
		if(fn && (typeof(fn) === 'function')) {
		  fn();
		}
	    } else {
	    	//Logger.showAlert(phase+"****** else *****");
	       this.$apply(fn);
	    }
	};
	/* Start people Details */
	this.peopleDetailsQueryInternal = function(pid){
		//alert(pid);
		RaModel.query({'dataSource':'UserSocialInfoV'}, {'limit':_limit,'offset':a.peopleDetails.offset, 'params':{'executeCountSql': 'N'}, 'sessionId':Session.get().sessionId,'data' :{'userId':pid}}, function(result){
				if (result.$error) {
					Logger.showAlert(result.errorMessage, result.errorTitle);
				} else {
					if (result.data.length > 0) {

						a.peopleDetails.data.push.apply(a.peopleDetails.data, result.data);
						a.peopleDetails.current = result.data[0];
						
						if (result.data.length < _limit) {
							a.peopleDetails.hasMore = false;
						} else {
							a.peopleDetails.hasMore = true;
						}

					} else {
						a.peopleDetails.hasMore = false;
					}
					Cache.put('_a', a);
				}
				a.peopleDetails.loading = false;
			});
	}

	this.peopleDetailsQuery = function(pid){
		a.peopleDetails.loading = true;
		if(a.peopleDetails.data.length && a.peopleDetails.data.length > 0) {
			var recordFound = false;
			for(var counter = 0; counter < a.peopleDetails.data.length; counter ++) {
				var peopleDetails = a.peopleDetails.data[counter];
				if(pid === peopleDetails.userId) {
					recordFound = true;
					a.peopleDetails.loading = false;
					a.peopleDetails.current = peopleDetails;
					break;
				}
			}
			if(!recordFound) {
				console.log("Query again...");
				$this.peopleDetailsQueryInternal(pid);	
			} else {
				console.log("Existing record");
			}
		} else {
			console.log("No records found!");
			$this.peopleDetailsQueryInternal(pid);
		}
	};

	this.getMorePeopleDetails = function() {
		if (a.peopleDetails.loading || !a.peopleDetails.hasMore) {
			return;
		}
		a.peopleDetails.offset += _limit;
		$this.orderQuery();
	};
	/* End peopleDetails */
	if (a === undefined) {
		this.init();
		Cache.put('_a', a);
	}
	this.initScope();
}]);



app.controller('SponsersCtrl', ['$timeout','$rootScope','$scope','$http' ,'$location', '$window','RaModel', 'Session', 'Cache', 'Menu','Logger', function ($timeout,$rootScope,$scope, $http,$location,$window, RaModel,Session, Cache, Menu, Logger) {
	var sponsers = Cache.get('sponsers'), a = Cache.get('_a'), c, _limit = 20, $this = this;
	$scope.sessionId = "";
	
	this.initScope = function() {
		a.data = sponsers;
		a.selection = 'Sponsers';
		$scope.displayName = Session.get().displayName;
		a.sponsers = {};
		a.sponsers.data = [];
		a.sponsers.offset = 0;
		a.sponsers.initialized = false;
		a.sponsers.hasMore = false;
		a.sponsers.loading = false;

		a.sponserDetails = {};
		a.sponserDetails.data = [];
		a.sponserDetails.offset = 0;
		a.sponserDetails.initialized = false;
		a.sponserDetails.hasMore = false;
		a.sponserDetails.loading = false;
		a.sponserDetails.imagesloading = false;
		$scope.a = a;
		$this.sponsersQuery();
	};
  	this.init = function(){
		a = {'pageTitle':'Sponsors'};
	};

	$scope.getMoreSponsers = function() {
		if (a.sponsers.loading || !a.sponsers.hasMore) {
			return;
		}
		a.sponsers.offset += _limit;
		$this.sponsersQuery();
	};

	this.sponsersQuery = function(){
			a.sponsers.loading = true;

			RaModel.query({'dataSource':'EventHolders'}, {'limit':_limit,'offset':a.sponsers.offset, 'params':{'executeCountSql': 'N'},'data':{'eventId':1,'holderType':'SPONSOR'}, 'select':['urlText','holderName','holderAbout2'],'sessionId':Session.get().sessionId,'orderBy': '#holderName#'}, function(result){
					if (result.$error) {
						Logger.showAlert(result.errorMessage, result.errorTitle);
					} else {
						if (result.data.length > 0) {
							a.sponsers.data.push.apply(a.sponsers.data, result.data);
							if (result.data.length < _limit) {
								a.sponsers.hasMore = false;
							} else {
								a.sponsers.hasMore = true;
							}
						} else {
							a.sponsers.hasMore = false;
						}
						Cache.put('_a', a);
					}
					a.sponsers.loading = false;
				}
			);
	   
	};


	$scope.$watch('a.selection', function(newValue, oldValue){
		Logger.log(oldValue + '->' + newValue);
		//alert(newValue);
		/*
		a.sponsers.initialized = true;
		*/if (newValue === 'Sponsers') {
			a.pageTitle = 'Sponsors';
			
			//$this.sponsersQuery();
			if (a.sponsers.initialized) {
				return;
			}
			
		} else if (newValue === 'sponserDetails') {
			a.pageTitle = 'Sponsor Details';
		} 
	});
	$scope.$watch('a.sponsers.current', function(a, o){
		Logger.log(o + '->' + a);
		if (o){
			Logger.log(o.userId);
		}
		if (a){
			$scope.a.pageTitle = 'Sponser Details';
	//		$this.sponserDetailsQuery(a.userId);
			
		}
	}, true);
	$scope.safeApply = function(fn) {
	    var phase = this.$root.$$phase;
	    if(phase == '$apply' || phase == '$digest') {
		if(fn && (typeof(fn) === 'function')) {
		  fn();
		}
	    } else {
	    	//Logger.showAlert(phase+"****** else *****");
	       this.$apply(fn);
	    }
	};
	/* End peopleDetails */
	if (a === undefined) {
		this.init();
		Cache.put('_a', a);
	}
	this.initScope();
}]);


app.controller('EventInfoCtrl', ['$scope', '$location', 'alarmService','Logger','RaModel', 'Menu', 'Session', 'Cache', 'Demo', function ($scope, $location, alarmService,Logger,RaModel, Menu, Session, Cache, Demo) {
	var currEvent = Cache.get('currEvent'), a = Cache.get('_a'), c, _limit = 20, $this = this;
	this.initScope = function() {
		a.data = currEvent;
		a.selection = 'events';
		//$scope.displayName = Session.get().displayName;
		a.events = {};
		a.events.offset = 0;
		a.events.initialized = false;
		a.events.hasMore = false;
		a.events.loading = false;
		$scope.a = a;
		$this.eventsQuery();
	};
	
	this.init = function(){
		a = {'pageTitle':'MyEvents'};
	};
  	
	$scope.joinEvent = function() {
		Logger.showAlert("You are joined this event");
	};

	this.eventsQuery = function(){
			a.events.loading = true;	 
			RaModel.query({'dataSource':'Events'}, {'limit':_limit,'offset':a.events.offset,'data':{'eventId':1}, 'params':{'executeCountSql': 'N'}, 'sessionId':Session.get().sessionId, 'select': ['eventInfo','startDate','venue'],'orderBy': '#creationDate# DESC'}, function(result){
					if (result.$error) {
						Logger.showAlert(result.errorMessage, result.errorTitle);
					} else {
						if (result.data.length > 0) {
							a.events = result.data[0];
						} else {
							a.events.hasMore = false;
						}
						Cache.put('_a', a);
					}
					a.events.loading = false;
				}
			);
	   
	};

	
	$scope.signOff = function() {
		Session.signOff();
	};

	if (a === undefined) {
		alert("**");
		this.init();
		Cache.put('_a', a);
	}
	this.initScope();
}]);



app.controller('MyEventCtrl', ['$scope', '$location', 'alarmService','Logger','RaModel', 'Menu', 'Session', 'Cache', 'Demo', function ($scope, $location, alarmService,Logger,RaModel, Menu, Session, Cache, Demo) {
	var currEvent = Cache.get('currEvent'), a = Cache.get('_a'), c, _limit = 20, $this = this;
	this.initScope = function() {
		a.data = currEvent;
		a.selection = 'events';
		//$scope.displayName = Session.get().displayName;
		a.events = {};
		a.events.data = [];
		a.events.offset = 0;
		a.events.initialized = false;
		a.events.hasMore = false;
		a.events.loading = false;
		$scope.a = a;
		$this.eventsQuery();
	};
	
	this.init = function(){
		a = {'pageTitle':'MyEvents'};
	};
  	
	$scope.joinEvent = function() {
		Logger.showAlert("You are joined this event");
	};

	this.eventsQuery = function(){
			a.events.loading = true;	 
			RaModel.query({'dataSource':'Events'}, {'limit':_limit,'offset':a.events.offset, 'params':{'executeCountSql': 'N'}, 'sessionId':Session.get().sessionId,'data':{'eventId':1}, 'select': ['eventName',	'startDate','venue'],'orderBy': '#creationDate# DESC'}, function(result){
					if (result.$error) {
						Logger.showAlert(result.errorMessage, result.errorTitle);
					} else {
						if (result.data.length > 0) {
							a.events = result.data[0];
						} else {
							a.events.hasMore = false;
						}
						Cache.put('_a', a);
					}
					a.events.loading = false;
				}
			);
	   
	};

	
	$scope.signOff = function() {
		Session.signOff();
	};

	if (a === undefined) {
		alert("**");
		this.init();
		Cache.put('_a', a);
	}
	this.initScope();
}]);


app.controller('MyScheduleCtrl', ['$scope', '$location', 'alarmService','Logger','RaModel', 'Menu', 'Session', 'Cache', 'Demo', function ($scope, $location, alarmService,Logger,RaModel, Menu, Session, Cache, Demo) {
	var currSchedule = Cache.get('currSchedule'), a = Cache.get('_a'), c, _limit = 20, $this = this;
	this.initScope = function() {
		a.data = currSchedule;
		a.selection = 'schedule';
		//$scope.displayName = Session.get().displayName;
		a.schedule = {};
		a.schedule.data = [];
		a.schedule.offset = 0;
		a.schedule.initialized = false;
		a.schedule.hasMore = false;
		a.schedule.loading = false;
		$scope.a = a;
		$this.scheduleQuery();
	};
	
	this.init = function(){
		a = {'pageTitle':'MyEvents'};
	};
  	
	$scope.joinEvent = function() {
		Logger.showAlert("You are joined this event");
	};

	$scope.getMoreSchedules = function() {
		console.log("********");
		if (a.schedule.loading || !a.schedule.hasMore) {
			return;
		}
		a.schedule.offset += _limit;
		$this.scheduleQuery();
	};

	this.scheduleQuery = function(){
			a.schedule.loading = true;	 
			RaModel.query({'dataSource':'EventSchedule'}, {'limit':_limit,'offset':a.schedule.offset, 'params':{'executeCountSql': 'N'}, 'sessionId':Session.get().sessionId, 'data':{eventId:1},'select': ['startTime','endTime','name','venue']}, function(result){
					if (result.$error) {
						Logger.showAlert(result.errorMessage, result.errorTitle);
					} else {
						if (result.data.length > 0) {
							a.schedule.data.push.apply(a.schedule.data, result.data);
							if (result.data.length < _limit) {
								a.schedule.hasMore = false;
							} else {
								a.schedule.hasMore = true;
							}
						
						} else {
							a.schedule.hasMore = false;
						}
						Cache.put('_a', a);
					}
					a.schedule.loading = false;
				}
			);
	   
	};

	
	$scope.signOff = function() {
		Session.signOff();
	};

	if (a === undefined) {
		alert("**");
		this.init();
		Cache.put('_a', a);
	}
	this.initScope();
}]);


app.controller('ProfileCtrl', ['$scope', '$location','$rootScope', 'alarmService','Logger','RaModel', 'Menu', 'Session', 'Cache', 'Demo', function ($scope, $location, $rootScope,alarmService,Logger,RaModel, Menu, Session, Cache, Demo) {
	
	var currProfile = Cache.get('currProfile'), a = Cache.get('_a'), c, _limit = 20, $this = this;
	
	//$scope.userName = Session.get().displayName;
	//$scope.session = Session.get();

	this.initScope = function() {
		a.data = currProfile;
		a.selection = 'profile';
		//$scope.displayName = Session.get().displayName;
		a.profile = {};
		
		a.profile.data = [];
		a.profile.offset = 0;
		a.profile.initialized = false;
		a.profile.hasMore = false;
		a.profile.loading = false;
		$scope.a = a;
		//alert(Session.get().userId);
		if($rootScope.userprofile) {
			a.profile = $rootScope.userprofile;
		} else {
			$this.profileQuery();
		}
	};
	
	this.init = function(){
		a = {'pageTitle':'Profile'};
	};
  	
	$scope.joinEvent = function() {
		Logger.showAlert("You are joined this event");
	};

	this.profileQuery = function(){
			a.profile.loading = true;	 
			//alert(Session.get().userId+"******");
			RaModel.query({'dataSource':'UserSocialInfoV'}, {'limit':_limit,'offset':a.profile.offset, 'params':{'executeCountSql': 'N'}, 'sessionId':Session.get().sessionId, 'select': ['firstName','lastName','title','emailAddress','phone','linkedinName','twitterName'],'data' :{'userId':Session.get().userId},'orderBy': '#creationDate# DESC'}, function(result){
					if (result.$error) {
						Logger.showAlert(result.errorMessage, result.errorTitle);
					} else {
						if (result.data.length > 0) {
							console.log(result.data);
							a.profile = result.data[0];
							//a.profile.data.push.apply(a.profile.data, result.data);
						} else {
							a.profile.hasMore = false;
						}
						Cache.put('_a', a);
					}
					a.profile.loading = false;
				}
			);
	   
	};

	
	$scope.signOff = function() {
		Session.signOff();
	};

	if (a === undefined) {
		alert("**");
		this.init();
		Cache.put('_a', a);
	}
	this.initScope();
}]);



app.controller('LoginCtrl', ['$scope', '$location', 'Session', 'Menu', function ($scope, $location, Session, Menu) {
	Menu.setSubPage(true);
	setTimeout(function(){
		$('input[type="text"]').focus();
	}, 100);
	$scope.signIn = function() {
		Session.signIn($scope.username, $scope.password, function(){
			if (Session.isActive()) {
				$location.path('/');
			}
		});
	};

	$scope.getLinkedInData = function() {
		if(!$scope.hasOwnProperty("userprofile")){
		//	alert("********34343");
			IN.API.Profile("me").fields(
					[ "id", "firstName", "lastName","emailAddress", "pictureUrl",
							"publicProfileUrl" ]).result(function(result) {
				// set the model
				$rootScope.$apply(function() {
					var userprofile =result.values[0]
					$rootScope.userprofile = userprofile;
					$rootScope.loggedUser = true;
					alert("**email** inlogin"+userprofile.emailAddress+"*******");
			    	//go to main
			var dn = userprofile.firstName+""+userprofile.lastName;
			    	var ea = userprofile.emailAddress;
			    	var callback = function(response,status) {
			    			alert(status);
			    			console.log("response:"+response);
			    			$location.path("/main");		
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
