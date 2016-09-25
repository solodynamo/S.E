angular.module('stocker.services', [])

  .factory('encodeURIService', function() {
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

    var deferred = $q.defer();
    var query = 'select * from yahoo.finance.historicaldata where symbol = "' + ticker + '" and startDate = "' + fromDate + '" and endDate = "' + todayDate + '"';
    var url = 'http://query.yahooapis.com/v1/public/yql?q=' + encodeURIService.encode(query) + '&format=json&env=http://datatables.org/alltables.env';
    var chacheKey = ticker; 
    var chartDataCache = chartDataCacheService.get(chacheKey);

    if(chartDataCache)  {
      deferred.resolve(chartDataCache);
    }

    else  {
      $http.get(url)
      .success(function(json) {
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

        deferred.resolve(formattedChartData);
        chartDataCacheService.put(chacheKey,formattedChartData);
      })
      .error(function(error) {
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
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
      });
        
    }

    var _off = function () {
      $ionicLoading.hide();
    }

    return {
        _on: _on,
        _off: _off
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

.factory('notesCacheService', function(CacheFactory) {

  var notesCache;

  if(!CacheFactory.get('notesCache')) {
    notesCache = CacheFactory('notesCache', {
      storageMode: 'localStorage'
    });
  } else {
    notesCache = CacheFactory.get('notesCache');
  }

  return notesCache;
})


.factory('notesService', function(notesCacheService) {

  return {

    getNotes: function(ticker) {
      return notesCacheService.get(ticker);
    },

    addNote: function(ticker, note) {
      var stockNotes = [];

      if( notesCacheService.get(ticker) ) {
        stockNotes = notesCacheService.get(ticker);
        stockNotes.push(note);
      } else {
        stockNotes.push(note);
      }
      notesCacheService.put(ticker, stockNotes);
    },

    deleteNote: function(ticker, index) {
      var stockNotes = [];

      stockNotes = notesCacheService.get(ticker);
      stockNotes.splice(index, 1);
      notesCacheService.put(ticker, stockNotes);
    }
  }
})