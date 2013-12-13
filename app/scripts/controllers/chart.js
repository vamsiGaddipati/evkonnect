'use strict';
var app = angular.module('SPAApp');
app.controller('ChartCtrl', ['$scope', '$location', 'alarmService', 'Menu', 'Session', function ($scope, $location, alarmService, Menu, Session) {
	Menu.setActiveCode('chart');
	$scope.Menu = Menu;
	var myChart = FusionCharts.items.c1;
	if (myChart === undefined) {
		myChart = new FusionCharts( 'Column3D', 'c1', '100%', '100%' );
		myChart.setJSONData( {
			'chart':
			{
				'caption' : 'Weekly Sales Summary for June 2013' ,
				'xAxisName' : 'Week',
				'yAxisName' : 'Sales',
				'numberPrefix' : '$',
				'showShadow' : '1',
				'placeValuesInside':'1',
				'overlapColumns':'1'
			},
			'data' :
			[
			{ 'label' : 'Week 1', 'value' : '14400' },
			{ 'label' : 'Week 2', 'value' : '19600' },
			{ 'label' : 'Week 3', 'value' : '24000' },
			{ 'label' : 'Week 4', 'value' : '15700' }
			]
		} );
	}
	myChart.render('chartContainer1');
	var myChart2 = FusionCharts.items.c2;
	if (myChart2 === undefined) {

		myChart2 = new FusionCharts( 'Pie3D', 'c2', '100%', '100%' );
		myChart2.setJSONData( {
			'chart': {
				'caption': 'Sales Per Employee for year 2013',
				'palette': '2',
				'animation': '1',
				'formatnumberscale': '0',
				'numberprefix': '$',
				'pieslicedepth': '30',
				'startingangle': '125'
			},
			'data': [
			{
				'label': 'Leverling',
				'value': '100524',
				'issliced': '1'
			},
			{
				'label': 'Fuller',
				'value': '87790',
				'issliced': '1'
			},
			{
				'label': 'Davolio',
				'value': '81898',
				'issliced': '0'
			},
			{
				'label': 'Peacock',
				'value': '76438',
				'issliced': '0'
			},
			{
				'label': 'King',
				'value': '57430',
				'issliced': '0'
			},
			{
				'label': 'Callahan',
				'value': '55091',
				'issliced': '0'
			},
			{
				'label': 'Dodsworth',
				'value': '43962',
				'issliced': '0'
			},
			{
				'label': 'Suyama',
				'value': '22474',
				'issliced': '0'
			},
			{
				'label': 'Buchanan',
				'value': '21637',
				'issliced': '0'
			}
			],
			'styles': {
				'definition': [
				{
					'type': 'font',
					'name': 'CaptionFont',
					'size': '15',
					'color': '666666'
				},
				{
					'type': 'font',
					'name': 'SubCaptionFont',
					'bold': '0'
				}
				],
				'application': [
				{
					'toobject': 'caption',
					'styles': 'CaptionFont'
				},
				{
					'toobject': 'SubCaption',
					'styles': 'SubCaptionFont'
				}
				]
			}
		} );
	}
	myChart2.render('chartContainer2');
}]);