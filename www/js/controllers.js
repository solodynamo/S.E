
angular.module('stocker.controllers', [])

  .controller('MainCtrl', function($scope, $ionicModal, $timeout, modalService) {

    var vm= this;
    vm.loginData = {};

    $scope.modalService = modalService;

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

.controller('MyStocksCtrl', ['$scope', 'myStocksArrayService',
  function($scope, myStocksArrayService) {
    var vm= this;
    console.log(myStocksArrayService);
    vm.myStocksArray = myStocksArrayService;

  }
])

.controller('StockCtrl', ['$scope', '$stateParams', 'stockDataService', 'customService', 'dateService', '$window', 'chartDataService', '$ionicPopup', 'notesService' , 'newsService', 'followStockService',

  function($scope, $stateParams, stockDataService, customService, dateService, $window, chartDataService, $ionicPopup ,notesService, newsService, followStockService) {

    var vm= this;
    vm.selectedStock = $stateParams.selectedStock;
    vm.todayDate=dateService.currentDate();
    vm.oneYearAgoDate=dateService.oneYearAgoDate();
    vm.stockNotes = [];
    vm.following = followStockService.checkFollowing(vm.selectedStock);

    vm.toggleFollow = function() {
      if(vm.following) {
        followStockService.unfollow(vm.selectedStock);
        vm.following = false;
      } else{
        followStockService.follow(vm.selectedStock);
        vm.following = true;
      }
    }

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
      vm.stockNotes = notesService.getNotes(vm.selectedStock);
      getNews();
      
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
      $scope.note = {title:"note", description:"type it pal....!", ticker:vm.selectedStock ,date: vm.todayDate};

      var note = $ionicPopup.show({
        template: '<textarea type="text" ng-model="note.description"></textarea>',
        title: '' ,
        subTitle:vm.selectedStock,
        scope: $scope,
        buttons: [
          { text: 'Cancel' },
          {
            text: '<b>Save</b>',
            type: 'button-positive',
            onTap: function(e) {
              notesService.addNote(vm.selectedStock, $scope.note);
            }
          }
        ]
    });

    note.then(function(res) {
      vm.stockNotes = notesService.getNotes(vm.selectedStock);
    });
  }

  vm.openNote = function(index, noteObj) {
      // $scope.note = {title:title, description:description, ticker:vm.selectedStock ,date: vm.todayDate};

      var note = $ionicPopup.show({
        template: noteObj.description,
        title: '' ,
        subTitle:noteObj.ticker,
        scope: $scope,
        buttons: [
          { 
            text: 'Cancel' ,
            onTap: function()
            {
              $ionicPopup.close();
            } 
          },
          { 
            text: 'Delete',
            type: 'button-assertive',
            onTap : function() {
              notesService.deleteNote(noteObj.ticker,index);
            }
          }
        ]
    });

    note.then(function(res) {
      vm.stockNotes = notesService.getNotes(vm.selectedStock);
    });
  }

  function getNews() {

    vm.newsStories = [];

    var promise = newsService.getNews(vm.selectedStock);

    promise.then(function(data) {
      vm.newsStories = data;
      console.log(vm.newsStories);
    })
  }

  vm.openNews = function(link) {
    console.log(link);
  }


}])

.controller('SearchCtrl', ['$scope', '$state', 'modalService', 'searchService',
  function($scope, $state, modalService, searchService) {

    $scope.closeModal = function() {
      modalService.closeModal();
    };

    $scope.search = function() {
      $scope.searchResults = '';
      startSearch($scope.searchQuery);
    }

    var startSearch = ionic.debounce(function(query) {
      searchService.search(query)
        .then(function(data) {
          $scope.searchResults = data;
          console.log("stats",data);
        });
    }, 750);

    $scope.goToStock = function(ticker) {
      modalService.closeModal();
      $state.go('app.stock', {selectedStock: ticker});
    };
  }
])
.controller('loginCtrl', ['$scope', 'modalService', 'Utils', 'Popup', '$ionicModal', '$state', '$localStorage',
  function($scope, modalService, Utils, Popup, $ionicModal, $state, $localStorage) {

     $scope.login = function(user) {
    if (angular.isDefined(user)) {
      Utils.show();
      loginWithFirebase(user.email, user.password);
    }
  };

  $scope.closeModal= function()
  {
    modalService.closeModal();
  }

var loginWithFirebase = function(email, password) {
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then(function(response) {
        //Retrieve the account from the Firebase Database
        var userId = firebase.auth().currentUser.uid;
        firebase.database().ref('accounts').orderByChild('userId').equalTo(userId).once('value').then(function(accounts) {
          if (accounts.exists()) {
            accounts.forEach(function(account) {
              //Account already exists, proceed to home.
              Utils.hide();
              firebase.database().ref('accounts/' + account.key).on('value', function(response) {
                var account = response.val();
                $localStorage.account = account;
              });
              $state.go('app.myStocks');
            });
            console.log("Its working");
          }
        });
        $localStorage.loginProvider = "Firebase";
        $localStorage.email = email;
        $localStorage.password = password;
      })
      .catch(function(error) {
        var errorCode = error.code;
        showFirebaseLoginError(errorCode);
      });
  }

  var showFirebaseLoginError = function(errorCode) {
    switch (errorCode) {
      case 'auth/user-not-found':
        Utils.message(Popup.errorIcon, Popup.emailNotFound);
        break;
      case 'auth/wrong-password':
        Utils.message(Popup.errorIcon, Popup.wrongPassword);
        break;
      case 'auth/user-disabled':
        Utils.message(Popup.errorIcon, Popup.accountDisabled);
        break;
      case 'auth/too-many-requests':
        Utils.message(Popup.errorIcon, Popup.manyRequests);
        break;
      default:
        Utils.message(Popup.errorIcon, Popup.errorLogin);
        break;
    }
  };


 
  }])
.controller('SignUpCtrl', ['$ionicModal', '$scope', 'Utils', 'Popup','$localStorage', '$state', 'modalService',function($ionicModal ,$scope, Utils, Popup, $localStorage, $state, modalService) {
  $scope.closeModal= function() {
    modalService.closeModal();
  } 

  $scope.$on('$ionicView.enter', function() {
    //Clear the Registration Form.
    $scope.user = {
      email: '',
      password: ''
    };
  })

  $scope.register = function(user) {
    //Check if form is filled up.
    if (angular.isDefined(user)) {
      Utils.show();
      firebase.database().ref('accounts').orderByChild('email').equalTo(user.email).once('value').then(function(accounts) {
        if (accounts.exists()) {
          Utils.message(Popup.errorIcon, Popup.emailAlreadyExists);
        } else {
          //Create Firebase account.
          firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
            .then(function() {
              //Add Firebase account reference to Database. Firebase v3 Implementation.
              firebase.database().ref().child('accounts').push({
                email: user.email,
                userId: firebase.auth().currentUser.uid,
                dateCreated: Date(),
                provider: 'Firebase'
              }).then(function(response) {
                //Account created successfully, logging user in automatically after a short delay.
                Utils.message(Popup.successIcon, Popup.accountCreateSuccess)
                  .then(function() {
                    getAccountAndLogin(response.key);
                  })
                  .catch(function() {
                    //User closed the prompt, proceed immediately to login.
                    getAccountAndLogin(response.key);
                  });
                $localStorage.loginProvider = "Firebase";
                $localStorage.email = user.email;
                $localStorage.password = user.password;
              });
            })
            .catch(function(error) {
              var errorCode = error.code;
              var errorMessage = error.message;
              //Show error message.
              console.log(errorCode);
              switch (errorCode) {
                case 'auth/email-already-in-use':
                  Utils.message(Popup.errorIcon, Popup.emailAlreadyExists);
                  break;
                case 'auth/invalid-email':
                  Utils.message(Popup.errorIcon, Popup.invalidEmail);
                  break;
                case 'auth/operation-not-allowed':
                  Utils.message(Popup.errorIcon, Popup.notAllowed);
                  break;
                case 'auth/weak-password':
                  Utils.message(Popup.errorIcon, Popup.weakPassword);
                  break;
                default:
                  Utils.message(Popup.errorIcon, Popup.errorRegister);
                  break;
              }
            });
        }
      });
    }
  };

  //Function to retrieve the account object from the Firebase database and store it on $localStorage.account.
  getAccountAndLogin = function(key) {
    firebase.database().ref('accounts/' + key).on('value', function(response) {
      var account = response.val();
      $localStorage.account = account;
    });
    $state.go('app.myStocks');
  };


}])