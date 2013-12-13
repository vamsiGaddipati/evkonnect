'use strict';
var app = angular.module('SPAApp');
app.controller('SearchAccountsCtrl', ['$scope', '$location', 'RaModel', 'Session', 'Cache', 'Menu', 'Logger', function ($scope, $location, RaModel, Session, Cache, Menu, Logger) {
	Menu.setActiveCode('searchAccounts');
	Logger.log('SearchAccountsCtrl');
	$scope.Menu = Menu;
	var s;
	function init() {
		$scope.s = Cache.get('SearchAccountsData') || {'data':{}};
		s = $scope.s;
		s.loading = false;
	}
	init();
	var query = function(callback){
		if (s.data) {
			s.loading = true;
			RaModel.query({'dataSource':'CustWBCustomerSearch'}, {'limit':20,'offset':s.offset, 'params':{'executeCountSql': 'N'}, 'sessionId':Session.get().sessionId, 'data' : s.data, 'orderBy': '#accountNumber# ASC, #identifyingAddressFlag# DESC'}, function(result){
				if (result.$error) {
					Logger.showAlert(result.errorMessage, result.errorTitle);
				} else {
					if (result.data.length > 0) {
						s.elapsed = result.elapsed;
						s.result.push.apply(s.result, result.data);
						Cache.put('SearchAccountsResults', s.result);
						if (result.data.length < 20) {
							s.hasMore = false;
						} else {
							s.hasMore = true;
						}
						Cache.put('SearchAccountsHasMore', s.hasMore);
					} else {
						s.hasMore = false;
						if (s.result.length === 0) {
							Logger.showAlert('No acounts found');
						}
					}
				}
				s.loading = false;
				s.scrolling = false;
				if (callback) {
					callback(result);
				}
			});
		} else {
			Logger.showAlert('You must', 'Blind Query');
			s.scrolling = false;
		}
	};
	$scope.doSearch = function(callback) {
		if (s.loading === true) {
			return;
		}
		s.hasMore = false;
		s.result = [];
		s.offset = 0;
		query(callback);
		Cache.put('SearchAccountsData', s);
	};
	$scope.doClear = function() {
		s = $scope.s = {'data':{}};
		Cache.remove('SearchAccountsData');
	};
	$scope.scroll = function(w) {
		if (s.scrolling === true || s.loading === true || s.hasMore === false || s.result === undefined || s.result.length === 0) {
			return;
		}
		s.scrolling = true;
		$scope.getMore();
	};
	$scope.getMore = function() {
		s.offset += 20;
		query();
	};
	$scope.goToDetails = function(a) {
		Menu.setSubPage(false);
		Cache.put('currentAccount', a);
		$location.path('/account');
	};
	$scope.back = function() {
		$location.path('/');
	};
}]);

app.controller('MainCtrl', ['$scope', '$location', 'alarmService', 'Menu', 'Session', 'Cache', 'Demo', function ($scope, $location, alarmService, Menu, Session, Cache, Demo) {
	Menu.setActiveCode('/');
	$scope.Menu = Menu;
	$scope.Demo = Demo;
	$scope.showIntro = Cache.get('showIntro');
	if ($scope.showIntro === undefined) {
		$scope.showIntro = true;
	}
	setTimeout(function(){
		$scope.$apply(function(){
			$scope.showIntro = false;
			Cache.put('showIntro', $scope.showIntro);
		});
	}, 5000);
/*
	$scope.userName = Session.get().displayName;
	$scope.session = Session.get();
*/
	$scope.signOff = function() {
		Session.signOff();
	};
}]);



app.controller('PeopleCtrl', ['$timeout','$rootScope','$scope','$http' ,'$location', '$window','RaModel', 'Session', 'Cache', 'Menu','Logger', function ($timeout,$rootScope,$scope, $http,$location,$window, RaModel,Session, Cache, Menu, Logger) {
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
			RaModel.query({'dataSource':'Events'}, {'limit':_limit,'offset':a.events.offset, 'params':{'executeCountSql': 'N'}, 'sessionId':Session.get().sessionId, 'select': ['eventInfo','startDate','venue'],'orderBy': '#creationDate# DESC'}, function(result){
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
			RaModel.query({'dataSource':'Events'}, {'limit':_limit,'offset':a.events.offset, 'params':{'executeCountSql': 'N'}, 'sessionId':Session.get().sessionId, 'select': ['eventName',	'startDate','venue'],'orderBy': '#creationDate# DESC'}, function(result){
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

	this.scheduleQuery = function(){
			a.schedule.loading = true;	 
			RaModel.query({'dataSource':'EventSchedule'}, {'limit':_limit,'offset':a.schedule.offset, 'params':{'executeCountSql': 'N'}, 'sessionId':Session.get().sessionId, 'data':{eventId:1},'select': ['startTime','endTime','name','venue'],'orderBy': '#creationDate# DESC'}, function(result){
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


app.controller('ProfileCtrl', ['$scope', '$location', 'alarmService','Logger','RaModel', 'Menu', 'Session', 'Cache', 'Demo', function ($scope, $location, alarmService,Logger,RaModel, Menu, Session, Cache, Demo) {
	
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
		$this.profileQuery();
	};
	
	this.init = function(){
		a = {'pageTitle':'Profile'};
	};
  	
	$scope.joinEvent = function() {
		Logger.showAlert("You are joined this event");
	};

	this.profileQuery = function(){
			a.profile.loading = true;	 
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



app.controller('TasksCtrl', ['$scope', '$location', 'alarmService', 'Menu', function ($scope, $location, alarmService, Menu) {
	function init() {
		$scope.alarms = alarmService.getAlarms();
	}
	init();
	$scope.goToDetails = function(alarm) {
		if (Menu.isOpen()) {
			Menu.toggle();
			return;
		}
		Menu.setSubPage(false);
		$location.path('/details/' + alarm.id);
	};
	$scope.create = function() {
		Menu.setSubPage(false);
		$location.path('/create');
	};
}]);

app.controller('DetailsCtrl', ['$scope', '$routeParams', '$location', 'alarmService', 'Menu', function ($scope, $routeParams, $location, alarmService, Menu) {
	function init() {
		var alarmId = ($routeParams.alarmId) ? parseInt($routeParams.alarmId, 10) : 0;
		if (alarmId >= 0) {
			$scope.alarm = alarmService.getAlarm(alarmId);
		}
	}
	init();
	$scope.back = function() {
		Menu.setSubPage(true);
		$location.path('/tasks');
	};
}]);

app.controller('SettingsCtrl', ['$scope', '$location', 'Menu', 'Cache', 'Logger', 'Demo', function ($scope, $location, Menu,Cache, Logger, Demo) {
	$scope.s = Cache.get('settings');
	if ($scope.s === undefined) {
		$scope.s = {};
		Demo.setAuto(true);
		$scope.s.selection = 'Demo';
	}
	$scope.Demo = Demo;
	Menu.setActiveCode('settings');
	$scope.Menu = Menu;
	$scope.$watch('s', function(n, o){
		Cache.put('settings', $scope.s);
	});
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
}]);
app.controller('CreateCtrl', ['$scope', '$location', 'alarmService', 'Menu', function ($scope, $location, alarmService, Menu) {
	function init() {
		$scope.date = '2013-06-20';
		$scope.time = '09:30';
		$scope.msg = alarmService.getCount()+1 + ' New message goes here...';
	}
	init();
	$scope.back = function() {
		Menu.setSubPage(true);
		$location.path('/tasks');
	};
	$scope.createAlarm = function() {
		var d = $scope.date;
		var t = $scope.time;
		var m = $scope.msg;
		alarmService.addAlarm(d, t, m);
		init();
		$scope.back();
	};
}]);
app.controller('MapCtrl', ['$scope', '$location', 'alarmService', 'Menu', 'Session', 'Cache', 'Logger', function ($scope, $location, alarmService, Menu, Session, Cache, Logger) {
	Menu.setActiveCode('map');
	$scope.Menu = Menu;
	var geocoder;
	var map;
	function initialize() {
		geocoder = new google.maps.Geocoder();
		var latlng = new google.maps.LatLng(33.67162,-117.857189);
		var mapOptions = {
			zoom: 12,
			center: latlng,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			disableDefaultUI: true
		};
		map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
		codeAddress();
	}
	function codeAddress() {
		var address = Cache.get('mapAddress');
		if (address === undefined) {
			address = '19200 Von Karman Avenue, Irvine, CA 92612';
		}
		$scope.address = address;
		if (address){
			geocoder.geocode( { 'address': address}, function(results, status) {
				if (status === google.maps.GeocoderStatus.OK) {
					map.setCenter(results[0].geometry.location);
					var marker = new google.maps.Marker({
						map: map,
						position: results[0].geometry.location,
						title: address,
						animation: google.maps.Animation.DROP
					});
					var infowindow = new google.maps.InfoWindow({
						content: address
					});

					google.maps.event.addListener(marker, 'click', function() {
						infowindow.open(map,marker);
					});
				} else {
					Logger.showAlert('Geocode was not successful for the following reason: ' + status);
				}
			});
		}
	}
	initialize();
}]);