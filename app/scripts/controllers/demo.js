'use strict';
var app = angular.module('SPAApp');
var addEvent = function(elem, type, eventHandle) {
	if(elem === null || elem === undefined) {
		return;
	}
	if(elem.addEventListener) {
		elem.addEventListener(type, eventHandle, false);
	}else {
		if(elem.attachEvent) {
			elem.attachEvent('on' + type, eventHandle);
		}else {
			elem['on' + type] = eventHandle;
		}
	}
};
app.service('Demo',['Menu', 'Logger', 'Cache', '$rootScope', '$location', '$window','Session', function(Menu, Logger, Cache, $rootScope, $location, $window, Session) {
	Logger.log('Demo init');
	var $this = this, currentStepIndex = -1, $scope = null;
	this.auto = false;
	this.steps = [];
	this.pause = false;
	this.enabled = true;
	this.getCurrentStepIndex = function(){
		return currentStepIndex;
	};
	this.isEnabled = function(){
		return $this.enabled;
	};

	this.setEnabled = function(b){
		if (b === $this.enabled) {
			return;
		}
		$this.enabled = b;
		if ($window.parent && $window.parent.onChangeDemoParam) {
			$window.parent.onChangeDemoParam('demo', b);
		}
	};
	this.isAuto = function(){
		return $this.auto;
	};
	this.setPaused = function(b){
		if (b === $this.pause) {
			return;
		}
		if (b) {
			$this.pauseDemo();
		} else {
			$this.resumeDemo();
		}
	};
	this.isPaused = function(){
		return $this.pause;
	};

	this.setAuto = function(b){
		$this.auto = b;
	};
	this.indexScope = null;

	$window.onDemoParamsChange = function(n, o) {
		$rootScope.$apply(function(){
			if (n.demo !== o.demo) {
				$this.enabled = n.demo;
			}
			if (n.autoDemo !== o.autoDemo) {
				$this.auto = n.autoDemo;
			}
			if ($this.enabled) {
				if (n.startDemo === true && o.startDemo === false) {
					setTimeout(function(){
						$this.startDemo();
					}, 1);
				} else if (n.startDemo === false && o.startDemo === true) {
					setTimeout(function(){
						$this.pauseDemo();
					}, 1);
				} else {
					if (n.autoDemo === true && o.autoDemo === false) {
						if (Logger.isAlertVisible()) {
							Logger.hideAlert();
						}
						if (currentStepIndex !== -1) {
							setTimeout(function(){
								$this.nextStep($scope);
							}, 1);
						}
					}
				}
			}
		});
	};

	$this.pauseDemo = function(){
		if ($this.enabled && $this.pause === false && currentStepIndex !== -1) {
			Logger.log('Demo paused');
			$this.pause = true;
			if ($window.parent && $window.parent.onChangeDemoParam) {
				$window.parent.onChangeDemoParam('pauseDemo', true);
			}
			Logger.showAlert('Demo paused');
		}
	};
	$this.resumeDemo = function(){
		if (Session.isActive()) {
			if (Logger.isAlertVisible()) {
				Logger.hideAlert();
			}
			Logger.log('Demo resumed');
			$this.pause = false;
			if ($window.parent && $window.parent.onChangeDemoParam) {
				$window.parent.onChangeDemoParam('pauseDemo', false);
			}
			$this.nextStep($scope);
		}
	};

	$this.setScope = function(s) {
		$scope = s;
	};

	$this.startDemo = function(){
		setTimeout(function(){
			$this.startDemoOutsideApply();
		},1);
	};
	$this.startDemoOutsideApply = function(){
		$scope = $this.indexScope;
		if (Session.isActive()) {
			if ($this.enabled) {
				if (Logger.isAlertVisible()) {
					Logger.hideAlert();
				}
				$location.path('/');
				currentStepIndex = -1;
				if ($this.pause) {
					$this.resumeDemo();
				} else {
					$this.nextStep($scope, 0);
				}
			}
		} else {
			$scope.$apply(function(){
				Session.signIn('mfg', 't2t8ruhetreSp3Ju', function(){
					if (Session.isActive()) {
//						$location.path('/');
setTimeout(function(){
	$this.startDemo();
}, 1);
					}
				});
			});
		}
	};
	$this.addStep = function(startText, endText, step) {
		if (typeof startText === 'function') {
			step = startText;
			startText = null;
			endText = null;
		}
		$this.steps.push([startText, endText, step]);
	};
	$this.nextStep = function(scope, ms){
		if ($this.enabled === false) {
			return;
		}
		$scope = scope;
		if ($this.pause) {
			return;
		}
		if (ms === undefined) {
			$this.nextStep(scope, 3);
			return;
		}
		if (ms > 0) {
			setTimeout(function(){
				$this.nextStep(scope, 0);
			}, ms);
			return;
		}
		currentStepIndex += 1;
		if ($this.steps.length < (currentStepIndex+1)) {
			$this.pause = true;
			$this.indexScope.$apply(function(){
				Logger.showAlert('Demo complete');
			});
			setTimeout(function(){
				$this.startDemo();
			}, 60000);
			return;
		}
		var step = $this.steps[currentStepIndex];
		Logger.log('Starting step ' + currentStepIndex + ' ' + step[0]);
		if ($this.auto) {
			step[2](scope);
		} else {
			if (currentStepIndex > 0 && $this.steps[currentStepIndex-1][1] !== null) {
				$this.indexScope.$apply(function(){
					Logger.showConfirm($this.steps[currentStepIndex-1][1], function(){
						if (step[0] === null) {
							setTimeout(function(){
								step[2](scope);
							}, 1);
						} else {
							Logger.showConfirm(step[0], function() {
								setTimeout(function(){
									step[2](scope);
								}, 1);
							}, 'Start Step ' + (currentStepIndex+1));
						}
					}, 'Continue Demo');
				});
			} else {
				if (step[0] === null) {
					step[2](scope);
				} else {
					$this.indexScope.$apply(function(){
						Logger.showConfirm(step[0], function() {
							setTimeout(function(){
								step[2](scope);
							}, 1);
						}, 'Start Step ' + (currentStepIndex+1));
					});
				}
			}
		}
	};

	this.scrollDown = function(ms){
		$('div.content').animate({'scrollTop':$('div.content').prop('scrollHeight')}, ms);
		$('div.content .tab').animate({'scrollTop':$('div.content .tab').prop('scrollHeight')}, ms);
	};

	this.scrollUp = function(ms){
		$('div.content').animate({'scrollTop':0}, ms);
		$('div.content .tab').animate({'scrollTop':0}, ms);
	};
	this.addStep('Welcome to the Telidos Mobile Demo. Please press Yes to continue...', 'Great... I will be navigating through the app with giving some comments along the way. Please be prepared click Yes atleast couple dezon times ;). You can stop/pause the demo anytime by clicking No at any step or by performing actions on the pages. Let\'s get started...', function(scope){
		$this.nextStep(scope, 0);
	});
	this.addStep('This is the home page... here you will have your notifications, tasks nearing due date etc. There are also a set of icons for all the functions that you have access to.', 'Clicking on the icon will take you to the respective page', function(scope){
		$this.nextStep(scope, 0);
	});

	this.addStep('Clicking on the menu icon, on the top left corner will reveal the Navigation panel', 'Clicking on the cross icon, will hide the Navigation panel', function(scope){
		scope.$apply(function(){
			Menu.toggle();
		});
		$this.nextStep(scope, 500);
	});
	this.addStep(function(scope){
		scope.$apply(function(){
			Menu.toggle();
		});
		$this.nextStep(scope, 500);
	});

	this.addStep('Let\'s go the customer search screen', 'I have just performed a search for customer name \'Vision\' against an Oracle EBS R12.1.3 Vision instance running on Amazon Cloud', function(scope){
		scope.$apply(function(){
			Cache.remove('SearchAccountsData');
			Cache.remove('_a');
			Menu.menuItemClick(Menu.getItem('searchAccounts'));
		});
		setTimeout(function(){
			var selector = angular.element($('#searchAccounts'));
			var ss = selector.scope();
			ss.$apply(function(){
				ss.s.data.partyname = 'Vision';
				ss.doSearch(function(result){
					if (result.$error) {
						Logger.showAlert('Oops... Sorry something bad happened and I cannot procceed further with this demo :(');
					} else {
						if (result.data.length === 0) {
							Logger.showAlert('Oops... there are no records found and I cannot procceed further with this demo :(');
						} else {
							if ($this.auto) {
								Logger.showAlert('That was fast! We got ' + result.data.length + ' records in ' + result.elapsed + ' milliseconds!');
								setTimeout(function(){
									$this.nextStep(ss, 0);
								}, 1);
							} else {
								if (result.elapsed < 1000) {
									Logger.showConfirm('That was fast! We got ' + result.data.length + ' records in ' + result.elapsed + ' milliseconds!', function() {
										setTimeout(function(){
											$this.nextStep(ss, 0);
										}, 1);
									}, 'Query executed');
								} else {
									Logger.showConfirm('That was ok I guess! We got ' + result.data.length + ' records in ' + result.elapsed + ' milliseconds. Usually I take around 40 ms for this type of query', function() {
										setTimeout(function(){
											$this.nextStep(ss, 0);
										}, 1);
									}, 'Query executed');
								}
							}
						}
					}
				});
			});
		}, 500);
	});
	this.addStep(null, 'Scrolling to the bottom would automatically fetch the next set of 20 rows', function(scope){
		$this.scrollDown(1500);
		$this.nextStep(scope, 1500);
	});
	this.addStep('Scrolling again...', null, function(scope){
		$this.scrollDown(1500);
		$this.nextStep(scope, 1600);
	});
	this.addStep(function(scope){
		$this.scrollUp();
		$this.nextStep(scope, 2000);
	});
	this.addStep('Clicking or swiping on a customer record will open up the Account details screen', null, function(scope){
		setTimeout(function(){
			scope.$apply(function(){
				if (Logger.isAlertVisible()) {
					Logger.hideAlert();
				}
				scope.goToDetails(scope.s.result[1]);
			});
			$this.nextStep(scope, 1000);
		}, 1);
	});

	this.addStep('Account detail screen. This page is divided into multiple tabs using the below tab bar.', null, function(scope){
		var selector = angular.element($('#accountPage'));
		var ss = selector.scope();
		$this.nextStep(ss, 0);
	});

	this.addStep('Let\'s go to Addressses tab', null, function(scope){
		scope.a.selection = 'Addresses';
		$this.nextStep(scope, 2000);
	});
	this.addStep(function(scope){
		$this.scrollDown(1500);
		$this.nextStep(scope, 1550);
	});
	this.addStep(null, 'Clicking or swiping on a address record will open up the address details screen',function(scope){
		$this.scrollUp();
		$this.nextStep(scope, 2000);
	});

	this.addStep(null, 'Google Maps Integration', function(scope){
		scope.a.addresses.current = scope.a.addresses.data[1];
		scope.a.selection='AddressDetails';
		$this.nextStep(scope, 3000);
	});

	this.addStep('Clicking on the cross icon on the top right corner will go back to the addresses tab',  null, function(scope){
		scope.a.selection = 'Addresses';
		$this.nextStep(scope, 2000);
	});

	this.addStep('Now let\'s check out the Contacts Tab', null, function(scope){
		scope.a.selection = 'Contacts';
		$this.nextStep(scope, 500);
	});

	this.addStep('Now let\'s check out the Orders Tab', null, function(scope){
		scope.a.selection = 'Orders';
		$this.nextStep(scope, 2000);
	});
	this.addStep(function(scope){
		$this.scrollDown(1500);
		$this.nextStep(scope, 1550);
	});
	this.addStep(function(scope){
		$this.scrollUp();
		$this.nextStep(scope, 1500);
	});

	this.addStep(null, 'Order Details', function(scope){
		scope.a.orders.current = scope.a.orders.data[1];
		scope.a.selection='OrderDetails';
		$this.nextStep(scope, 2000);
	});

	this.addStep(null, 'Order Line Details', function(scope){
		$this.scrollDown(1500);
		$this.nextStep(scope, 1550);
	});
	this.addStep(function(scope){
		$this.scrollUp();
		$this.nextStep(scope, 1500);
	});

	this.addStep(function(scope){
		scope.a.selection = 'Orders';
		$this.nextStep(scope, 3000);
	});

	this.addStep(null, 'Google Maps Full Screen', function(scope){
		$location.path('/map');
		$this.nextStep(scope, 3000);
	});
	this.addStep(null, 'Charts for Dashboards', function(scope){
		$location.path('/chart');
		$this.nextStep(scope, 5000);
	});
	if ($window.parent && $window.parent.onChangeDemoParam){
		this.addStep(null, 'Landscape orientation would display charts side by side', function(scope){
			$window.parent.onChangeDemoParam('demoOrientation', 'landscape');
			$this.nextStep(scope, 5000);
		});
		this.addStep(null, 'Ok... we are done. Thanks for watching this demo. Click Yes to go back to home screen', function(scope){
			$window.parent.onChangeDemoParam('demoOrientation', 'portrait');
			$this.nextStep(5000);
		});
	}
	this.addStep(function(scope){
		$location.path('/');
		$this.nextStep(scope, 3000);
	});
}]);