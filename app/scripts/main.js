
var app = angular.module ('app', ['angularUtils.directives.dirPagination', 'amChartsDirective'])
	.controller('stockController', ['$scope','$http',stockControllerFunc]);

function stockControllerFunc($scope, $http) {
	$http({
		method : 'GET',
		url : 'data.json',
    dataType: 'json',
	}).then(function(response) {
		$scope.stocks = response.data.price;
    $scope.weight = response.data.eps;
    $scope.historical = response.data.historical;
		$scope.limit = 8;
		// pagination controls
		$scope.currentPage = 1;
		$scope.totalItems = Object.keys($scope.stocks).length;
		$scope.entryLimit = 8; // items per page
		$scope.noOfPages = Math.ceil($scope.totalItems / $scope.entryLimit);
	});

  $scope.portfolio = [];
  $scope.stocksCount = 0;
  var sum = 0;
  $scope.netWorth = sum;

  // Add folio
  $scope.addFolio = function(name, price) {
    function containsObject(name, list) {
      var i;
      for (i = 0; i < list.length; i++) {
        if (list[i].name === name) {
          return true;
        }
      }
      return false;
    }
    if(!containsObject(name, $scope.portfolio)){
      var eps = $scope.weight[name];
      var data = {};
      data.name = name;
      data.price = price;
      data.eps = eps;
      data.historical = $scope.historical[name];
      data.count = 1;
      $scope.portfolio.push(data);
      $scope.netTotal();
    }
    $scope.stocksCount = $scope.portfolio.length;
    // console.log($scope.portfolio);
    $scope.chart();
  }

  // Remove Folio
  $scope.removeFolio = function(name, count) {
    for (var i = 0; i < $scope.portfolio.length; i++) {
      if ($scope.portfolio[i].name === name) {
        $scope.portfolio.splice(i,1);
      }
    }
    $scope.stocksCount = $scope.portfolio.length;
    $scope.netTotal();
  }

  // Calculate Count
  $scope.shareCalculate = function(name, count) {
    // console.log(name, count);
    for (var i = 0; i < $scope.portfolio.length; i++) {
      if ($scope.portfolio[i].name === name) {
        $scope.portfolio[i].count = count;
        if(count == 0) {
          $scope.portfolio.splice(i,1);
        }
      }
    }
    $scope.stocksCount = $scope.portfolio.length;
    $scope.netTotal();
    // console.log($scope.portfolio);
  }

  // Net Total
  $scope.netTotal = function() {
    // NetWorth
    // Net Worth = Sum(Stock Price * Shares Held)
    var a = [];
    // array of (stockprice * shares held)
    for (var i = 0; i < $scope.portfolio.length; i++) {
      a[i] = ($scope.portfolio[i].price * $scope.portfolio[i].count);
    }
    sum = a.reduce(function(accum, val) {return accum + Number(val);}, 0);
    $scope.netWorth = sum.toFixed(2);
    $scope.weightage();
  }

  // Calculate Weightage
  $scope.weightage = function() {
    // Weightage = (Stock Price * Shares Held)/Net Worth
    var a = [];
    for (var i = 0; i < $scope.portfolio.length; i++) {
      a[i] = parseInt($scope.portfolio[i].price * $scope.portfolio[i].count);
      $scope.portfolio[i].weight = parseFloat((a[i] / $scope.netWorth).toFixed(2));
    }
  }

  // P/E
  $scope.pe = function() {
    // Portfolio P/E = Net Worth/Sum(Stock EPS * Shares Held)
    var a = [];
    var sumPE;
    for (var i = 0; i < $scope.portfolio.length; i++) {
      a[i] = ($scope.portfolio[i].eps * $scope.portfolio[i].count);
    }
    sumPE = a.reduce(function(accum, val) {return accum + Number(val);}, 0);
    if(isNaN($scope.netWorth/sumPE)) {
      return 0;
    }
    return ($scope.netWorth/sumPE).toFixed(2);
  }

  // Chart
  var a = [];
  var b = [];
  $scope.chart = function() {
    // Net Worth[date] = Sum(Stock Price[date] * Shares Held)
    for (var i = 0; i < $scope.portfolio.length; i++) {
      for(var j = 0; j < $scope.portfolio[i].historical.point.length; j++) {
        var d = new Date($scope.portfolio[i].historical.point[j].date);
        $scope.portfolio[i].historical.point[j].date = d.getDate();
        $scope.portfolio[i].historical.point[j].price = $scope.portfolio[i].historical.point[j].price * $scope.portfolio[i].count;
      }
    }
    // console.log(a);
    // console.log(b);
    // b = b.reduce(function(accum, val) {return accum + Number(val);}, 0);
    // console.log(points);
    console.log($scope.portfolio);
    var pointsLength = $scope.portfolio.length-1;
    $scope.$broadcast('amCharts.updateData', $scope.portfolio[pointsLength].historical.point, 'myFirstChart');
  }

  $scope.amChartOptions = {
    data: [{
      date: 24,
      price: 23.5,
    }, {
      date: 1,
      price: 26.2,
    }, {
      date: 8,
      price: 30.1,
    }, {
      date: 19,
      price: 29.5,
    }, {
      date: 21,
      price: 24.6,
    }],
    type: 'serial',
    legend: {
      enabled: false
    },
    chartScrollbar: {
      enabled: false,
    },
    categoryAxis: {
      gridPosition: 'end',
      parseDates: false
    },
    fontSize: 12,
    valueAxes: [{
      position: 'bottom',
      title: 'Value'
    }],
    'theme': 'light',
    'marginRight': 30,
    'marginTop': 10,
    graphs: [{
      fillAlpha: 1,
      type: 'smoothedLine',
      lineAlpha: 1,
      lineThickness: 2,
      bullet: 'round',
      bulletSize: 5,
    }]
  }

}
