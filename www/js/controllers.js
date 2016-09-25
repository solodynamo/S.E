
angular.module('stocker.controllers', [])

  .controller('MainCtrl', function($scope, $ionicModal, $timeout) {

    var vm= this;
    vm.loginData = {};

    $ionicModal.fromTemplateUrl('templates/login.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal = modal;
    });

    vm.closeLogin = function() {
      $scope.modal.hide();
    };

    vm.login = function() {
      $scope.modal.show();
    };

    vm.doLogin = function() {

    }

  
})

.controller('MyStocksCtrl', ['$scope',
  function($scope) {
    var vm= this;
    vm.myStocksArray = [
      { selectedStock: "AAPL" },
      { selectedStock: "GPRO" },
      { selectedStock: "FB" },
      { selectedStock: "NFLX" },
      { selectedStock: "TSLA" },
      { selectedStock: "BRK-A" },
      { selectedStock: "INTC" },
      { selectedStock: "MSFT" },
      { selectedStock: "GE" },
      { selectedStock: "BAC" },
      { selectedStock: "C" },
      { selectedStock: "T" }
    ];

  }
])

.controller('StockCtrl', ['$scope', '$stateParams', 'stockDataService','customService','dateService','$window','chartDataService','$ionicPopup',
  function($scope, $stateParams, stockDataService, customService, dateService, $window, chartDataService, $ionicPopup) {
    var vm= this;
    vm.selectedStock = $stateParams.selectedStock;
    // vm.typesOfCharts=[{chartType:'daily'},{chartType:'weekly'},{chartType:'threeMonths'},{chartType:'yearly'},{chartType:'max'}];
    vm.todayDate=dateService.currentDate();
    vm.oneYearAgoDate=dateService.oneYearAgoDate();

     $scope.chartView = 4;
  
     vm.chartViewFunc = function(n) {
       $scope.chartView = n;
     }

    // $scope.$watch("vm.selectedChart",function(newVal,oldVal)
    // {
    //   console.log("tyekjl");
    // });

    $scope.$on("$ionicView.afterEnter", function() {
      getPriceData();
      getDetailsData();
      getChartData();
    });

    function getPriceData() {
      var promise = stockDataService.getPriceData(vm.selectedStock);

      promise.then(function(data) {
        vm.stockPriceData=data;
        console.log("price data",data);
      });
    }

    function getDetailsData() {
    
       customService._on();
      stockDataService.getDetailsData(vm.selectedStock).then(function(data) {
        vm.stockDetailsData=data;
        customService._off();
        console.log("details data",data);
      });
    }
  function getChartData() {

      var promise = chartDataService.getHistoricalData($stateParams.selectedStock, vm.oneYearAgoDate, vm.todayDate);

      promise.then(function(data) {

        $scope.myData = JSON.parse(data)
          .map(function(series) {
            series.values = series.values.map(function(d) { return {x: d[0], y: d[1] }; });
            return series;
          });

      });
    }

    var xTickFormat = function(d) {
      var dx = $scope.myData[0].values[d] && $scope.myData[0].values[d].x || 0;
      if (dx > 0) {
        return d3.time.format("%b %d")(new Date(dx));
      }
      return null;
    };

    var x2TickFormat = function(d) {
      var dx = $scope.myData[0].values[d] && $scope.myData[0].values[d].x || 0;
      return d3.time.format('%b %Y')(new Date(dx));
    };

    var y1TickFormat = function(d) {
      return d3.format(',f')(d);
    };

    var y2TickFormat = function(d) {
      return d3.format('s')(d);
    };

    var y3TickFormat = function(d) {
      return d3.format(',.2s')(d);
    };

    var y4TickFormat = function(d) {
      return d3.format(',.2s')(d);
    };

    var xValueFunction = function(d, i) {
      return i;
    };

    var marginBottom = ($window.innerWidth / 100) * 5;

    $scope.chartOptions = {
      chartType: 'linePlusBarWithFocusChart',
      data: 'myData',
      margin: {top: marginBottom, right: 0, bottom: 0, left: 0},
      interpolate: "cardinal",
      useInteractiveGuideline: true,
      yShowMaxMin: false,
      tooltips: true,
      showLegend: false,
      useVoronoi: false,
      xShowMaxMin: false,
      xValue: xValueFunction,
      xAxisTickFormat: xTickFormat,
      x2AxisTickFormat: x2TickFormat,
      y1AxisTickFormat: y1TickFormat,
      y2AxisTickFormat: y2TickFormat,
      y3AxisTickFormat: y3TickFormat,
      y4AxisTickFormat: y4TickFormat,
      transitionDuration: 500,
      y1AxisLabel:'Price',
      y3AxisLabel:'Volume'
    };

     vm.addNote = function() {
      $scope.note = {};

      var note = $ionicPopup.show({
        template: '<input type="password" ng-model="data.wifi">',
        title: 'Enter Wi-Fi Password',
        subTitle: 'Please use normal things',
        scope: $scope,
        buttons: [
          { text: 'Cancel' },
          {
            text: '<b>Save</b>',
            type: 'button-positive',
            onTap: function(e) {
            if (!$scope.data.wifi) {
              e.preventDefault();
            } else {
              return $scope.data.wifi;
            }
          }
        }
      ]
    });

    note.then(function(res) {
      console.log('Tapped!', res);
    });
  }


  }
]);