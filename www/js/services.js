angular.module('stocker.services', [])

.factory('encodeURIService', function(){
  return {
    encode: function(string) {
      console.log(string);
      return encodeURIComponent(string).replace(/\"/g, "%22").replace(/\ /g, "%20").replace(/[!'()]/g, escape);
    }
  };
})

.factory('dateService', function($filter) {
  
  var currentDate = function() {
    var d = new Date();
    var date = $filter('date')(d, 'yyyy-MM-dd');
    return date;
  };

  var oneYearAgoDate = function() {
    var d = new Date().setDate(new Date().getDate() - 365);
    var date = $filter('date')(d, 'yyyy-MM-dd');
    return date;
  };

  return {
    currentDate: currentDate,
    oneYearAgoDate: oneYearAgoDate
  };

})

.factory('stockDataService', function($q, $http, encodeURIService) {

  var getDetailsData = function(ticker) {

    var deferred = $q.defer();
    var query = 'select * from yahoo.finance.quotes where symbol IN ("' + ticker + '")';
    var url = 'http://query.yahooapis.com/v1/public/yql?q=' + encodeURIService.encode(query) + '&format=json&env=http://datatables.org/alltables.env'

    console.log(url);

    $http.get(url)
      .success(function(json) {
        deferred.resolve(json.query.results.quote);

      })
      .error(function(error) {
        console.log('Details data error: ' + error);
        deferred.reject();
      });

    return deferred.promise;
  };

  var getPriceData = function (ticker) {
  
    var deferred = $q.defer();
    var url = 'http://finance.yahoo.com/webservice/v1/symbols/' + ticker + '/quote?format=json&view=detail';

    $http.get(url)
      .success(function(json) {
        var jsonData = json.list.resources[0].resource.fields;
        deferred.resolve(jsonData);
      })
      .error(function(error) {
        console.log('Price data error: ' + error);
        deferred.reject();
      });

    return deferred.promise;

   };

  return {
    getPriceData: getPriceData,
    getDetailsData: getDetailsData
  };

})

.factory('chartDataService', function($q, $http, encodeURIService, chartDataCacheService) {

  var getHistoricalData = function(ticker, fromDate, todayDate) {

    // select * from yahoo.finance.historicaldata where symbol = "YHOO" and startDate = "2009-09-11" and endDate = "2010-03-10"


    var deferred = $q.defer();
    var query = 'select * from yahoo.finance.historicaldata where symbol = "' + ticker + '" and startDate = "' + fromDate + '" and endDate = "' + todayDate + '"';
    var url = 'http://query.yahooapis.com/v1/public/yql?q=' + encodeURIService.encode(query) + '&format=json&env=http://datatables.org/alltables.env';
    var chacheKey = ticker; 
    var chartDataCache = chartDataCacheService.get(chacheKey);

    if(chartDataCache)
    {
      deferred.resolve(chartDataCache);
    }

    else
    {
      $http.get(url)
      .success(function(json) {
        console.log("quote is",json);
        var jsonData = json.query.results.quote;

        var priceData = [];
        var volumeData = [];

        jsonData.forEach(function(dayDataObject) {

          var dateToMillis = dayDataObject.Date;
          var date =  Date.parse(dateToMillis);
          var price = parseFloat(Math.round(dayDataObject.Close * 100)/ 100).toFixed(3);
          var volume = dayDataObject.Volume;

          var volumeDatum = '[' + date + ', ' + volume + ']';
          var priceDatum = '[' + date + ', ' + price + ']';

          volumeData.unshift(volumeDatum);
          priceData.unshift(priceDatum);

        });

        var formattedChartData =
        '[{' + 
          '"key":' + '"volume",' +
          '"bar":' + 'true,' +
          '"values":' + '[' + volumeData + ']' +
        '},' +
        '{' +
          '"key":' + '"' + ticker + '",' +
          '"values":' + '[' + priceData + ']' +
        '}]';

        console.log(formattedChartData);

        deferred.resolve(formattedChartData);
        chartDataCacheService.put(chacheKey,formattedChartData);
      })
      .error(function(error) {
        console.log("Chart data error: " + error);
        deferred.reject();
      });

    }

    
    return deferred.promise;
  };

  return {
    getHistoricalData: getHistoricalData
  };
})


    .factory('customService', function ($ionicLoading, $ionicPopup, $q) {

        var _on = function () {
            $ionicLoading.show({
                content: 'android',
                // template: '<ion-spinner icon="android"></ion-spinner>',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0
            });
        }

        var _off = function () {
            $ionicLoading.hide();
        }

        var _showConfirm = function (data) {
            var confirmPopup = $ionicPopup.confirm({
                template: data.template,
                cssClass: 'customConfirm'
            });
            return confirmPopup;
        }

        var _showAlert = function (data) {
            var alertPopup = $ionicPopup.alert({
                template: data.template,
                cssClass: 'customAlert'
            });
            return alertPopup;
        }

        var _showPopup = function (data) {

            var deferred = $q.defer();

            $ionicPopup.show({
                template: data.template,
                title: data.title,
                scope: data.scope,
                cssClass: 'customPopup',
                buttons: [{
                    text: 'Cancel',
                    onTap: function (e) {
                        return false;
                }}, {
                    text: 'Submit',
                    type: 'button-positive',
                    onTap: function (e) {
                        if (!data.scope[data.modelName].comment) {
                            e.preventDefault();
                        } else {
                            return data.scope[data.modelName];
                        }
                }}]
            }).then(function (response) {
                deferred.resolve(response);
            });

            return deferred.promise;

        }
        
        return {
            _on: _on,
            _off: _off,
            _showConfirm: _showConfirm,
            _showAlert: _showAlert,
            _showPopup: _showPopup
        }

    })

.factory('chartDataCacheService', ['CacheFactory', function(CacheFactory){
 
 var chartDataCache;

  if(!CacheFactory.get('chartDataCache')) {
 
    chartDataCache=CacheFactory('chartDataCache',{
    maxAge:60*60*8*1000,
    deleteOnExpire:'aggressive',
    storageMode:'localStorage'
  })

 } else {

  chartDataCache=CacheFactory.get('chartDataCache');
 }

 return chartDataCache;

}])