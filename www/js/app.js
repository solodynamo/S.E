
angular.module('stocker', ['ionic', 'nvd3', 'angular-cache', 'nvChart', 'stocker.controllers','stocker.services','stocker.directives','stocker.filters', 'ngStorage'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
   // Initialize Firebase
  // var config = {
  //   apiKey: "AIzaSyB4og649VLOfYXIt_zK_SBgVuGskV92lt8",
  //   authDomain: "stocker-668d3.firebaseapp.com",
  //   databaseURL: "https://stocker-668d3.firebaseio.com",
  //   storageBucket: "stocker-668d3.appspot.com",
  //   messagingSenderId: "910001279386"
  // };
  // firebase.initializeApp(config);

  // firebase.auth().signInAnonymously().then(function(_auth)
  // {
  //   console.log("logged in");
  // })
  // .catch(function(err)
  // {
  //   console.log(err);
  // })

})

//other person code
.constant('Popup', {
    delay: 3000, //How long the popup message should show before disappearing (in milliseconds -> 3000 = 3 seconds).
    successIcon: "ion-happy-outline",
    errorIcon: "ion-sad-outline",
    accountCreateSuccess: "Congratulations! Your account has been created. Logging you in.",
    emailAlreadyExists: "Sorry, but an account with that email address already exists. Please register with a different email and try again.",
    accountAlreadyExists: "Sorry, but an account with the same credential already exists. Please check your account and try again.",
    emailNotFound: "Sorry, but we couldn\'t find an account with that email address. Please check your email and try again.",
    userNotFound: "Sorry, but we couldn\'t find a user with that account. Please check your account and try again.",
    invalidEmail: "Sorry, but you entered an invalid email. Please check your email and try again.",
    notAllowed: "Sorry, but registration is currently disabled. Please contact support and try again.",
    serviceDisabled: "Sorry, but logging in with this service is current disabled. Please contact support and try again.",
    wrongPassword: "Sorry, but the password you entered is incorrect. Please check your password and try again.",
    accountDisabled: "Sorry, but your account has been disabled. Please contact support and try again.",
    weakPassword: "Sorry, but you entered a weak password. Please enter a stronger password and try again.",
    errorRegister: "Sorry, but we encountered an error registering your account. Please try again later.",
    passwordReset: "A password reset link has been sent to: ",
    errorPasswordReset: "Sorry, but we encountered an error sending your password reset email. Please try again later.",
    errorLogout: "Sorry, but we encountered an error logging you out. Please try again later.",
    sessionExpired: "Sorry, but the login session has expired. Please try logging in again.",
    errorLogin: "Sorry, but we encountered an error logging you in. Please try again later.",
    welcomeBack: "Welcome back! It seems like you should still be logged in. Logging you in now.",
    manyRequests: "Sorry, but we\'re still proccessing your previous login. Please try again later.",
    fullVersionOnly: "Sorry, but this feature is not available on the Lite version. Upgrade to Full version in order to use Social Login."
  })

//other person code ends
.config(function($stateProvider, $urlRouterProvider,$ionicConfigProvider) {
   $ionicConfigProvider.backButton.previousTitleText(false);
   $ionicConfigProvider.backButton.text('');
  $stateProvider


  .state("login", {
      url: "/login",
      templateUrl: "templates/login.html",
      controller: "LoginCtrl"
    })

  .state("signUp", {
      url: "/signUp",
      templateUrl: "templates/signup.html",
      controller: "SignUpCtrl"
    })


    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'MainCtrl as vm'
  
  })

  
    .state('app.myStocks', {
      url: '/my-stocks',
      
      views: {
        'menuContent': {
          templateUrl: 'templates/my-stocks.html',
          controller: 'MyStocksCtrl as vm'
        }
      }
    })

  .state('app.stock', {
    url: '/:selectedStock',
    views: {
      'menuContent': {
        templateUrl: 'templates/stock.html',
        controller: 'StockCtrl as vm'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('app/my-stocks');
});
