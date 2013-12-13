/*global showAlert:false */
'use strict';
var app = angular.module('SPAApp');
app.controller('AccountCtrl', ['$scope', '$location', 'RaModel', 'Session', 'Cache', 'Menu','Logger', 'Demo', function ($scope, $location, RaModel, Session, Cache, Menu, Logger, Demo) {
	Logger.log('AccountCtrl');

	Demo.setScope($scope);
	//Cache.remove('_a');
	var currentAccount = Cache.get('currentAccount'), a = Cache.get('_a'), c, _limit = 20, $this = this;

	$scope.back = function() {
		Menu.setSubPage(true);
		$location.path('/searchAccounts');
	};
	$scope.showMap = function(a) {
		Menu.clear();
		Cache.put('mapAddress', a.address1 + ',' + a.city + ', ' + a.state + ' ' + a.postalCode);
		$location.path('/map');
	};
	$scope.getMoreAddresses = function() {
		if (a.addresses.loading || !a.addresses.hasMore) {
			return;
		}
		a.addresses.offset += _limit;
		$this.addressQuery();
	};
	this.initOrderLineScope = function(){
		a.orders.lines = {};
		a.orders.lines.data = [];
		a.orders.lines.offset = 0;
		a.orders.lines.initialized = false;
		a.orders.lines.hasMore = false;
		a.orders.lines.loading = false;
	};
	this.initScope = function() {
		a.data = currentAccount;
		a.selection = 'Details';

		a.addresses = {};
		a.addresses.data = [];
		a.addresses.offset = 0;
		a.addresses.initialized = false;
		a.addresses.hasMore = false;
		a.addresses.loading = false;

		a.contacts = {};
		a.contacts.data = [];
		a.contacts.offset = 0;
		a.contacts.initialized = false;
		a.contacts.hasMore = false;
		a.contacts.loading = false;

		a.orders = {};
		a.orders.data = [];
		a.orders.offset = 0;
		a.orders.initialized = false;
		a.orders.hasMore = false;
		a.orders.loading = false;
		$this.initOrderLineScope();
		$scope.a = a;
	};

	this.init = function(){
		a = {'pageTitle':'Account'};
	};

	this.addressQuery = function(){
		a.addresses.loading = true;
		RaModel.query({'dataSource':'Addresses'}, {'limit':_limit,'offset':a.addresses.offset, 'params':{'executeCountSql': 'N'}, 'sessionId':Session.get().sessionId, 'select': ['address1',	'address5','city','state','postalCode', 'billTo', 'shipTo'],'data' :{'custAccountId':a.data.custAccountId}, 'orderBy': '#partySiteId#'}, function(result){
				if (result.$error) {
					Logger.showAlert(result.errorMessage, result.errorTitle);
				} else {
					if (result.data.length > 0) {
						a.addresses.data.push.apply(a.addresses.data, result.data);
						if (result.data.length < _limit) {
							a.addresses.hasMore = false;
						} else {
							a.addresses.hasMore = true;
						}
					} else {
						a.addresses.hasMore = false;
					}
					Cache.put('_a', a);
				}
				a.addresses.loading = false;
			}
		);
	};
	$scope.$watch('a.selection', function(newValue, oldValue){
		Logger.log(oldValue + '->' + newValue);
		if (newValue === 'Addresses') {
			a.pageTitle = 'Addresses';
			if (a.addresses.initialized) {
				return;
			}
			$this.addressQuery();
			a.addresses.initialized = true;
		} else if (newValue === 'Contacts') {
			a.pageTitle = 'Contacts';
			if (a.contacts.initialized) {
				return;
			}
			$this.contactQuery();
			a.contacts.initialized = true;
		} else if (newValue === 'Orders') {
			a.pageTitle = 'Orders';
			if (a.orders.initialized) {
				return;
			}
			$this.orderQuery();
			a.orders.initialized = true;
		} else if (newValue === 'Invoices') {
			a.pageTitle = 'Invoices';
		}
	});

	var geocoder, marker, map, mapInitialized = false;
	this.initializeMap = function() {
		if (mapInitialized) {
			return;
		}
		mapInitialized = true;
		geocoder = new google.maps.Geocoder();
		var latlng = new google.maps.LatLng(34.442876,-118.575783);
		var mapOptions = {
			zoom: 8,
			center: latlng,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			disableDefaultUI: true
		};
		setTimeout(function(){
			map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
		}, 10);
	};

	this.codeAddress = function(address) {
		Logger.log(address);
		$this.initializeMap();
		if (address){
			geocoder.geocode( { 'address': address}, function(results, status) {
				if (status === google.maps.GeocoderStatus.OK) {
					map.setCenter(results[0].geometry.location);
					marker = new google.maps.Marker({
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
	};
	$scope.$watch('a.addresses.current', function(a, o){
		Logger.log(o + '->' + a);
		if (o){
			Logger.log(o.address1 + ',' + o.city + ', ' + o.state + ' ' + o.postalCode);
		}
		if (a){
			$scope.a.pageTitle = 'Address Details';
			Logger.log(a.address1 + ',' + a.city + ', ' + a.state + ' ' + a.postalCode);
			mapInitialized = false;
			$this.codeAddress(a.address1 + ',' + a.city + ', ' + a.state + ' ' + a.postalCode);
		}
	}, true);

	/* Start Orders */
	this.orderQuery = function(n){
		a.orders.loading = true;
		RaModel.query({'dataSource':'TransactionHistory'}, {'limit':_limit,'offset':a.orders.offset, 'params':{'executeCountSql': 'N'}, 'sessionId':Session.get().sessionId, 'select': ['orderNumber',	'status','orderTotal','lastShipDate','orderHoldFlag', 'lastUpdateDate', 'userName', 'name', 'headerId'], 'data' :{'soldToOrgId':a.data.custAccountId}, 'orderBy': '#headerId# DESC'}, function(result){
				if (result.$error) {
					Logger.showAlert(result.errorMessage, result.errorTitle);
				} else {
					if (result.data.length > 0) {
						a.orders.data.push.apply(a.orders.data, result.data);
						if (result.data.length < _limit) {
							a.orders.hasMore = false;
						} else {
							a.orders.hasMore = true;
						}
					} else {
						a.orders.hasMore = false;
					}
					Cache.put('_a', a);
				}
				a.orders.loading = false;
			}
		);
	};
	this.orderLinesQuery = function(n){
		a.orders.lines.loading = true;
		RaModel.query({'dataSource':'OrderLines'}, {'limit':_limit,'offset':a.orders.lines.offset, 'params':{'executeCountSql': 'N'}, 'sessionId':Session.get().sessionId,'data' :{'headerId':n.headerId}, 'orderBy': '#lineNo#,#shipmentNumber#,nvl(#optionNumber#,0),nvl(#componentNumber#,0)'}, function(result){
				if (result.$error) {
					Logger.showAlert(result.errorMessage, result.errorTitle);
				} else {
					if (result.data.length > 0) {
						a.orders.lines.data.push.apply(a.orders.lines.data, result.data);
						if (result.data.length < _limit) {
							a.orders.lines.hasMore = false;
						} else {
							a.orders.lines.hasMore = true;
						}
					} else {
						a.orders.lines.hasMore = false;
					}
				}
				a.orders.lines.loading = false;
			}
		);
	};
	$scope.getMoreOrders = function() {
		if (a.orders.loading || !a.orders.hasMore) {
			return;
		}
		a.orders.offset += _limit;
		$this.orderQuery();
	};
	$scope.getMoreOrderLines = function() {
		if (a.orders.lines.loading || !a.orders.lines.hasMore) {
			return;
		}
		a.orders.lines.offset += _limit;
		$this.orderLinesQuery();
	};
	$scope.$watch('a.orders.current', function(n, o){
		Logger.log(o + '->' + n);
		if (o){
			Logger.log(o.orderNumber);
		}
		if (n){
			a.pageTitle = 'Order Details';
			Logger.log(n.orderNumber);
			$this.initOrderLineScope();
			RaModel.query({'dataSource':'OrderHeader'}, {'limit':1,'offset':0, 'params':{'executeCountSql': 'N'}, 'sessionId':Session.get().sessionId, 'data' :{'headerId':n.headerId}}, function(result){
					if (result.$error) {
						Logger.showAlert(result.errorMessage, result.errorTitle);
					} else {
						if (result.data.length > 0) {
							a.orders.detail = result.data[0];
						} else {
							Logger.showAlert('Order not found!');
						}
					}
				}
			);
			$this.orderLinesQuery(n);
		}
	}, true);

	/* End Orders */

	/* Start Contacts */
	this.contactQuery = function(){
		a.contacts.loading = true;
		RaModel.query({'dataSource':'CustomerContactList'}, {'limit':_limit,'offset':a.contacts.offset, 'params':{'executeCountSql': 'N'}, 'sessionId':Session.get().sessionId,'data' :{'custAccountId':a.data.custAccountId}, 'orderBy': '#partySiteId#'}, function(result){
				if (result.$error) {
					Logger.showAlert(result.errorMessage, result.errorTitle);
				} else {
					if (result.data.length > 0) {
						a.contacts.data.push.apply(a.contacts.data, result.data);
						if (result.data.length < _limit) {
							a.contacts.hasMore = false;
						} else {
							a.contacts.hasMore = true;
						}
					} else {
						a.contacts.hasMore = false;
					}
					Cache.put('_a', a);
				}
				a.contacts.loading = false;
			}
		);
	};
	$scope.getMoreContacts = function() {
		if (a.contacts.loading || !a.contacts.hasMore) {
			return;
		}
		a.contacts.offset += _limit;
		$this.orderQuery();
	};
	/* End Contacts */
	if (a === undefined) {
		this.init();
		Cache.put('_a', a);
	}
	this.initScope();
}]);
