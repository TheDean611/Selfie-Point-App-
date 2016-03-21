/*! 
 * Roots v 2.0.0
 * Follow me @adanarchila at Codecanyon.net
 * URL: http://codecanyon.net/item/roots-phonegapcordova-multipurpose-hybrid-app/9525999
 * Don't forget to rate Roots if you like it! :)
 */

// In this file we are goint to include all the Controllers our app it's going to need

(function(){
  'use strict';
 
  var deviceType = (navigator.userAgent.match(/iPad/i))  == "iPad" ? "iPad" : (navigator.userAgent.match(/iPhone/i))  == "iPhone" ? "iPhone" : (navigator.userAgent.match(/Android/i)) == "Android" ? "Android" : (navigator.userAgent.match(/BlackBerry/i)) == "BlackBerry" ? "BlackBerry" : "null";
  
  var app = angular.module('app', ['onsen', 'angular-images-loaded', 'ngMap', 'pascalprecht.translate']);

  var api = 'http://selfie-points.de/api/';

  // Filter to convert HTML content to string by removing all HTML tags
  app.filter('htmlToPlaintext', function() {
      return function(text) {
        return String(text).replace(/<[^>]+>/gm, '');
      }
    }
  );

  // Language Strings

  app.config(['$translateProvider', function ($translateProvider) {

    $translateProvider.translations('en', {
      'HOME': 'Home',
      'ABOUT': 'Über uns',
      'TERMS': 'Nutzerbestimmungen',
      'FAQ': 'F.A.Q.',
      'NO_INTERNET' : 'Keine Verbindung zum Internet',
      'CONNECTING' : 'Laden...',
      'PASSWORD_INSTRUCTIONS': 'Passwort - mind. 6 Zeichen',
      'EMAIL': 'Email',
      'USERNAME': 'Benutzername',
      'PASSWORD': 'Passwort',
      'LOGIN': 'Login',
      'SIGNUP': 'kostenlos Registrieren',
      'TAKE_SELFIE': 'Selfie aufnehmen',
      'SELFIE_POINTS': 'Selfie-Points',
      'NEWS': 'News',
      'CITIES': 'Städte',
      'CORPORATIONS': 'Unternehmen',
      'LOGOUT': 'Logout',
      'SHARE_FACEBOOK': 'Auf Facebook teilen!',
      'CAMERA': 'Kamera',
      'LATEST_NEWS': 'Aktuelles',
      'MORE': 'mehr',
      'ARTICLE': 'Artikel',
      'BACK': 'zurück',
    });
   
    $translateProvider.preferredLanguage('en');

    // German translation
    // $translateProvider.preferredLanguage('de');

  }]);

  app.controller('networkController', function($scope){  

    // Check if is Offline
    document.addEventListener("offline", function(){

      offlineMessage.show();

      /* 
       * With this line of code you can hide the modal in 8 seconds but the user will be able to use your app
       * If you want to block the use of the app till the user gets internet again, please delete this line.       
       */

      setTimeout('offlineMessage.hide()', 8000);  

    }, false);

    document.addEventListener("online", function(){
      // If you remove the "setTimeout('offlineMessage.hide()', 8000);" you must remove the comment for the line above      
      // offlineMessage.hide();
    });

  });


  // Init controller
  app.controller('initController', [ '$http', '$scope', '$rootScope', function($http, $scope, $rootScope){

    $scope.init = function(){
      
      // Check if it has a cookie saved
      if (window.localStorage.getItem("rootsCookie") != null ) {

        $http.jsonp(api+'user/validate_auth_cookie/?cookie='+window.localStorage.getItem("rootsCookie")+'&callback=JSON_CALLBACK').success(
          function(response) {
            console.log(response);
            if(response.status=='ok' && response.valid==true){
              $scope.menu.setMainPage('welcome.html', {closeMenu: true}); // if logged in send to latest.html
            } else {
              $scope.menu.setMainPage('login.html', {closeMenu: true}); // if login didn't work send back to login.html
            }
          }
        );

      } else {
        
        $scope.menu.setMainPage('login.html', {closeMenu: true}); // if login didn't work send back to login.html

      }
    
    };

  }]);

  // Log In Controller
  app.controller('loginController', [ '$http', '$scope', '$rootScope', function($http, $scope, $rootScope){

    $scope.nonce = '';
    $scope.username = '';
    $scope.password = '';

    $scope.login = function(){
            
      if($scope.username==='' && $scope.password===''){
        
        ons.notification.alert({message: "You can't leave any fields empty"});

      } else {
        
        modal.show();

        $http.jsonp(api+'get_nonce/?controller=user&method=generate_auth_cookie&callback=JSON_CALLBACK').success(
          function(response) {
            console.log(response);
            if(response.status=='ok'){
              
              $scope.nonce = response.nonce;

              $http.jsonp(api+'user/generate_auth_cookie/?nonce='+$scope.nonce+'&username='+encodeURIComponent($scope.username)+'&password='+encodeURIComponent($scope.password)+'&callback=JSON_CALLBACK').success(
                function(response){
                  
                  if(response.status=='ok'){

                    // We save the cookie
                    window.localStorage.setItem("rootsCookie", response.cookie);
                    modal.hide();
                    $scope.menu.setMainPage('welcome.html', {closeMenu: true});

                  } else{

                    modal.hide();
                    ons.notification.alert({message: 'Your username/password was incorrect, please try again.'});

                  }
                    
                }
              );

            } else {

              modal.hide();
              ons.notification.alert({message: 'There was an error trying to connect to the server, please try again.'});

            }
          }
        );

      }

    };

  }]);

  // Sign up Controller
  app.controller('signupController', [ '$http', '$scope', '$rootScope', function($http, $scope, $rootScope){

    $scope.username = '';
    $scope.password = '';
    $scope.email    = '';

    $scope.register = function(){
      
      if($scope.username==='' && $scope.password==='' && $scope.email===''){
        
        ons.notification.alert({message: "You can't leave any fields empty"});

      } else if( $scope.password.length<6 ){

        ons.notification.alert({message: "Your password must have 6 characters or more."});

      } else {

        modal.show();

        $http.jsonp(api+'get_nonce/?controller=user&method=register&callback=JSON_CALLBACK').success(
          function(response) {
            console.log(response);
            if(response.status=='ok'){
              
              $scope.nonce = response.nonce;

              $http.jsonp(api+'user/register/?username='+encodeURIComponent($scope.username)+'&email='+encodeURIComponent($scope.email)+'&nonce='+$scope.nonce+'&user_pass='+encodeURIComponent($scope.password)+'&display_name='+encodeURIComponent($scope.username)+'&notify=no&callback=JSON_CALLBACK').success(
                function(response){
                  
                  if(response.status=='ok'){

                    // We save the cookie
                    window.localStorage.setItem("rootsCookie", response.cookie);
                    modal.hide();
                    $scope.menu.setMainPage('welcome.html', {closeMenu: true});

                  } else if(response.status=='error'){
                  
                    modal.hide();
                    ons.notification.alert({message: response.error });

                  } else {

                    modal.hide();
                    ons.notification.alert({message: 'There was a problem trying to create your account, please try again.'});

                  }
                    
                }
              );

            } else {

              modal.hide();
              ons.notification.alert({message: 'There was an error trying to connect to the server, please try again.'});

            }
          }
        );

      }

    };

  }]);  


  // This functions will help us save the JSON in the localStorage to read the website content offline

  Storage.prototype.setObject = function(key, value) {
      this.setItem(key, JSON.stringify(value));
  }

  Storage.prototype.getObject = function(key) {
      var value = this.getItem(key);
      return value && JSON.parse(value);
  }

  // This directive will allow us to cache all the images that have the img-cache attribute in the <img> tag
  app.directive('imgCache', ['$document', function ($document) {
    return {
      link: function (scope, ele, attrs) {
        var target = $(ele);

        scope.$on('ImgCacheReady', function () {

          ImgCache.isCached(attrs.src, function(path, success){
            if(success){
              ImgCache.useCachedFile(target);
            } else {
              ImgCache.cacheFile(attrs.src, function(){
                ImgCache.useCachedFile(target);
              });
            }
          });
        }, false);

      }
    };
  }]);    

  app.controller('menuController', [ '$scope',  function($scope){

    $scope.logOut = function(){
      
      window.localStorage.removeItem("rootsCookie");
      $scope.menu.setMainPage('loading.html', {closeMenu: true});

    };
    
  }]);


  app.config(function($compileProvider){
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
  })

  app.controller('cameraController', function( $scope, $compile){
    
    $scope.lastPhoto = 'images/selfie.jpg';

    $scope.camOptions = {};

    var originalPhoto = document.getElementById('photo');

    // This function takes care of opening the camera and getting the URL
    $scope.openCamera = function(){
      ons.ready(function() {
        $scope.camOptions = { 
          quality : 100,
          destinationType : navigator.camera.DestinationType.FILE_URI,
          sourceType : navigator.camera.PictureSourceType.CAMERA,
          //allowEdit : true,
          encodingType: navigator.camera.EncodingType.JPEG,
          //targetWidth: 640,
          //targetHeight: 640,
          saveToPhotoAlbum: true 
        };      
        navigator.camera.getPicture( $scope.onSuccess, $scope.onFail, $scope.camOptions );
      });
    }

    // This is the function that will trigger if we succeded taking the picture
    $scope.onSuccess = function(imageURI) {
      console.log(imageURI);
      $scope.$apply(function(){
        $scope.lastPhoto = imageURI;
      });
    }

    // This is the function that will trigger if we failed to take a picture
    $scope.onFail = function(message) {
        console.log('Failed because: ' + message);
    }

    $scope.shareFacebook = function(){
      console.log('trying to share the image');
      if($scope.lastPhoto !== 'images/selfie.jpg'){
        
        window.plugins.socialsharing.shareViaFacebook(
          '#SelfiePoint', 
          $scope.lastPhoto, 
          null /* url */, 
          function() {
            console.log('share ok');
          }, function(errormsg){
            console.log(errormsg);
          }
        );

      } else {
        alert('Please take a picture first.');
      }

    };


  });

  // Show Latest Posts
  // This controller gets all the posts from our WordPress site and inserts them into a variable called $scope.items
  app.controller('latestController', [ '$http', '$scope', '$rootScope', function($http, $scope, $rootScope){

    $scope.yourAPI = api+'get_posts/?post_type=post';
    $scope.items = [];
    $scope.totalPages = 0;
    $scope.currentPage = 1;
    $scope.pageNumber = 1;
    $scope.isFetching = true;
    $scope.lastSavedPage = 0;
    $scope.cookie = '';

    // Let's initiate this on the first Controller that will be executed.
    ons.ready(function() {
      
      // Cache Images Setup
      // Set the debug to false before deploying your app
      ImgCache.options.debug = true;

      ImgCache.init(function(){

        //console.log('ImgCache init: success!');
        $rootScope.$broadcast('ImgCacheReady');
        // from within this function you're now able to call other ImgCache methods
        // or you can wait for the ImgCacheReady event

      }, function(){
        //console.log('ImgCache init: error! Check the log for errors');
      });

    });


    $scope.pullContent = function(){
      
      $http.jsonp($scope.yourAPI+'&page='+$scope.pageNumber+'&cookie='+$scope.cookie+'&callback=JSON_CALLBACK').success(function(response) {

        if($scope.pageNumber > response.pages){

          // hide the more news button
          $('#moreButton[rel=home]').fadeOut('fast');  

        } else {

          $scope.items = $scope.items.concat(response.posts);
          window.localStorage.setObject('rootsPostsHome', $scope.items); // we save the posts in localStorage
          window.localStorage.setItem('rootsDateHome', new Date());
          window.localStorage.setItem("rootsLastPageHome", $scope.currentPage);
          window.localStorage.setItem("rootsTotalPagesHome", response.pages);

          // For dev purposes you can remove the comment for the line below to check on the console the size of your JSON in local Storage
          // for(var x in localStorage)console.log(x+"="+((localStorage[x].length * 2)/1024/1024).toFixed(2)+" MB");

          $scope.totalPages = response.pages;
          $scope.isFetching = false;

          if($scope.pageNumber == response.pages){

            // hide the more news button
            $('#moreButton[rel=home]').fadeOut('fast'); 

          }

        }

      });

    }

    $scope.getAllRecords = function(pageNumber){

      $scope.isFetching = true;    

      if (window.localStorage.getItem("rootsCookie") == null ) {
      
        $scope.menu.setMainPage('login.html', {closeMenu: true});

      } else {
        
        $scope.cookie = window.localStorage.getItem("rootsCookie");

        if (window.localStorage.getItem("rootsLastPageHome") == null ) {

          $scope.pullContent();

        } else {
          
          var now = new Date();
          var saved = new Date(window.localStorage.getItem("rootsDateHome"));

          var difference = Math.abs( now.getTime() - saved.getTime() ) / 3600000;

          // Lets compare the current dateTime with the one we saved when we got the posts.
          // If the difference between the dates is more than 24 hours I think is time to get fresh content
          // You can change the 24 to something shorter or longer

          if(difference > 24){
            // Let's reset everything and get new content from the site.
            $scope.currentPage = 1;
            $scope.pageNumber = 1;
            $scope.lastSavedPage = 0;
            window.localStorage.removeItem("rootsLastPageHome");
            window.localStorage.removeItem("rootsPostsHome");
            window.localStorage.removeItem("rootsTotalPagesHome");
            window.localStorage.removeItem("rootsDateHome");

            $scope.pullContent();
          
          } else {
            
            $scope.lastSavedPage = window.localStorage.getItem("rootsLastPageHome");

            // If the page we want is greater than the last saved page, we need to pull content from the web
            if($scope.currentPage > $scope.lastSavedPage){

              $scope.pullContent();
            
            // else if the page we want is lower than the last saved page, we have it on local Storage, so just show it.
            } else {

              $scope.items = window.localStorage.getObject('rootsPostsHome');
              $scope.currentPage = $scope.lastSavedPage;
              $scope.totalPages = window.localStorage.getItem("rootsTotalPagesHome");
              $scope.isFetching = false;

            }

          }

        }
      
      }

    };

    $scope.imgLoadedEvents = {
        done: function(instance) {
            angular.element(instance.elements[0]).removeClass('is-loading').addClass('is-loaded');
        }
    };

    $scope.showPost = function(index){
        
      $rootScope.postContent = $scope.items[index];
      $scope.news.pushPage('post.html');

    };

    $scope.nextPage = function(){

      $scope.currentPage++; 
      $scope.pageNumber = $scope.currentPage;                 
      $scope.getAllRecords($scope.pageNumber);        

    }

  }]);

  // This controller let us print the Post Content in the post.html template
  app.controller('postController', [ '$scope', '$rootScope', '$sce', function($scope, $rootScope, $sce){
    
    $scope.item = $rootScope.postContent;

    $scope.renderHtml = function (htmlCode) {
      return $sce.trustAsHtml(htmlCode);
    };

    $scope.imgLoadedEvents = {
        done: function(instance) {
            angular.element(instance.elements[0]).removeClass('is-loading').addClass('is-loaded');
        }
    };    

  }]);


  // Show Cities Posts
  // This controller gets all the posts from our WordPress site and inserts them into a variable called $scope.items
  app.controller('citiesController', [ '$http', '$scope', '$rootScope', '$sce', function($http, $scope, $rootScope, $sce){

    $scope.yourAPI = api+'get_posts/?post_type=stdte';
    $scope.items = [];
    $scope.totalPages = 0;
    $scope.currentPage = 1;
    $scope.pageNumber = 1;
    $scope.isFetching = true;
    $scope.lastSavedPage = 0;
    $scope.cookie = '';

    // Let's initiate this on the first Controller that will be executed.
    ons.ready(function() {
      
      // Cache Images Setup
      // Set the debug to false before deploying your app
      ImgCache.options.debug = true;

      ImgCache.init(function(){

        //console.log('ImgCache init: success!');
        $rootScope.$broadcast('ImgCacheReady');
        // from within this function you're now able to call other ImgCache methods
        // or you can wait for the ImgCacheReady event

      }, function(){
        //console.log('ImgCache init: error! Check the log for errors');
      });

    });


    $scope.pullContent = function(){
      
      $http.jsonp($scope.yourAPI+'&page='+$scope.pageNumber+'&cookie='+$scope.cookie+'&callback=JSON_CALLBACK').success(function(response) {

        if($scope.pageNumber > response.pages){

          // hide the more news button
          $('#moreButton[rel=home]').fadeOut('fast');  

        } else {

          $scope.items = $scope.items.concat(response.posts);
          window.localStorage.setObject('rootsCities', $scope.items); // we save the posts in localStorage
          window.localStorage.setItem('rootsDateCities', new Date());
          window.localStorage.setItem("rootsLastCities", $scope.currentPage);
          window.localStorage.setItem("rootsTotalCities", response.pages);

          // For dev purposes you can remove the comment for the line below to check on the console the size of your JSON in local Storage
          // for(var x in localStorage)console.log(x+"="+((localStorage[x].length * 2)/1024/1024).toFixed(2)+" MB");

          $scope.totalPages = response.pages;
          $scope.isFetching = false;

          if($scope.pageNumber == response.pages){

            // hide the more news button
            $('#moreButton[rel=home]').fadeOut('fast'); 

          }

        }

      });

    }

    $scope.getAllRecords = function(pageNumber){

      $scope.isFetching = true;    

      if (window.localStorage.getItem("rootsCookie") == null ) {
      
        $scope.menu.setMainPage('login.html', {closeMenu: true});

      } else {
        
        $scope.cookie = window.localStorage.getItem("rootsCookie");

        if (window.localStorage.getItem("rootsLastCities") == null ) {

          $scope.pullContent();

        } else {
          
          var now = new Date();
          var saved = new Date(window.localStorage.getItem("rootsDateCities"));

          var difference = Math.abs( now.getTime() - saved.getTime() ) / 3600000;

          // Lets compare the current dateTime with the one we saved when we got the posts.
          // If the difference between the dates is more than 24 hours I think is time to get fresh content
          // You can change the 24 to something shorter or longer

          if(difference > 24){
            // Let's reset everything and get new content from the site.
            $scope.currentPage = 1;
            $scope.pageNumber = 1;
            $scope.lastSavedPage = 0;
            window.localStorage.removeItem("rootsLastCities");
            window.localStorage.removeItem("rootsCities");
            window.localStorage.removeItem("rootsTotalCities");
            window.localStorage.removeItem("rootsDateCities");

            $scope.pullContent();
          
          } else {
            
            $scope.lastSavedPage = window.localStorage.getItem("rootsLastCities");

            // If the page we want is greater than the last saved page, we need to pull content from the web
            if($scope.currentPage > $scope.lastSavedPage){

              $scope.pullContent();
            
            // else if the page we want is lower than the last saved page, we have it on local Storage, so just show it.
            } else {

              $scope.items = window.localStorage.getObject('rootsCities');
              $scope.currentPage = $scope.lastSavedPage;
              $scope.totalPages = window.localStorage.getItem("rootsTotalCities");
              $scope.isFetching = false;

            }

          }

        }
      
      }

    };

    $scope.imgLoadedEvents = {
        done: function(instance) {
            angular.element(instance.elements[0]).removeClass('is-loading').addClass('is-loaded');
        }
    };

    $scope.showPost = function(index){
        
      $rootScope.postContent = $scope.items[index];
      $scope.news.pushPage('city.html');

    };

    $scope.nextPage = function(){

      $scope.currentPage++; 
      $scope.pageNumber = $scope.currentPage;                 
      $scope.getAllRecords($scope.pageNumber);        

    }

    $scope.renderHtml = function (htmlCode) {
      return $sce.trustAsHtml(htmlCode);
    };

  }]);

  // This controller let us print the Post Content in the post.html template
  app.controller('cityPostController', [ '$scope', '$rootScope', '$sce', function($scope, $rootScope, $sce){
    
    $scope.item = $rootScope.postContent;

    $scope.renderHtml = function (htmlCode) {
      return $sce.trustAsHtml(htmlCode);
    };

    $scope.imgLoadedEvents = {
        done: function(instance) {
            angular.element(instance.elements[0]).removeClass('is-loading').addClass('is-loaded');
        }
    };    

  }]);


  // Show Corporations Posts
  // This controller gets all the posts from our WordPress site and inserts them into a variable called $scope.items
  app.controller('corporationsController', [ '$http', '$scope', '$rootScope', '$sce', function($http, $scope, $rootScope, $sce){

    $scope.yourAPI = api+'get_posts/?post_type=unternehmen';
    $scope.items = [];
    $scope.totalPages = 0;
    $scope.currentPage = 1;
    $scope.pageNumber = 1;
    $scope.isFetching = true;
    $scope.lastSavedPage = 0;
    $scope.cookie = '';

    // Let's initiate this on the first Controller that will be executed.
    ons.ready(function() {
      
      // Cache Images Setup
      // Set the debug to false before deploying your app
      ImgCache.options.debug = true;

      ImgCache.init(function(){

        //console.log('ImgCache init: success!');
        $rootScope.$broadcast('ImgCacheReady');
        // from within this function you're now able to call other ImgCache methods
        // or you can wait for the ImgCacheReady event

      }, function(){
        //console.log('ImgCache init: error! Check the log for errors');
      });

    });


    $scope.pullContent = function(){
      
      $http.jsonp($scope.yourAPI+'&page='+$scope.pageNumber+'&cookie='+$scope.cookie+'&callback=JSON_CALLBACK').success(function(response) {

        if($scope.pageNumber > response.pages){

          // hide the more news button
          $('#moreButton[rel=home]').fadeOut('fast');  

        } else {

          $scope.items = $scope.items.concat(response.posts);
          window.localStorage.setObject('rootsCorporation', $scope.items); // we save the posts in localStorage
          window.localStorage.setItem('rootsDateCorporation', new Date());
          window.localStorage.setItem("rootsLastCorporation", $scope.currentPage);
          window.localStorage.setItem("rootsTotalCorporation", response.pages);

          // For dev purposes you can remove the comment for the line below to check on the console the size of your JSON in local Storage
          // for(var x in localStorage)console.log(x+"="+((localStorage[x].length * 2)/1024/1024).toFixed(2)+" MB");

          $scope.totalPages = response.pages;
          $scope.isFetching = false;

          if($scope.pageNumber == response.pages){

            // hide the more news button
            $('#moreButton[rel=home]').fadeOut('fast'); 

          }

        }

      });

    }

    $scope.getAllRecords = function(pageNumber){

      $scope.isFetching = true;    

      if (window.localStorage.getItem("rootsCookie") == null ) {
      
        $scope.menu.setMainPage('login.html', {closeMenu: true});

      } else {
        
        $scope.cookie = window.localStorage.getItem("rootsCookie");

        if (window.localStorage.getItem("rootsLastCorporation") == null ) {

          $scope.pullContent();

        } else {
          
          var now = new Date();
          var saved = new Date(window.localStorage.getItem("rootsDateCorporation"));

          var difference = Math.abs( now.getTime() - saved.getTime() ) / 3600000;

          // Lets compare the current dateTime with the one we saved when we got the posts.
          // If the difference between the dates is more than 24 hours I think is time to get fresh content
          // You can change the 24 to something shorter or longer

          if(difference > 24){
            // Let's reset everything and get new content from the site.
            $scope.currentPage = 1;
            $scope.pageNumber = 1;
            $scope.lastSavedPage = 0;
            window.localStorage.removeItem("rootsLastCorporation");
            window.localStorage.removeItem("rootsCorporation");
            window.localStorage.removeItem("rootsTotalCorporation");
            window.localStorage.removeItem("rootsDateCorporation");

            $scope.pullContent();
          
          } else {
            
            $scope.lastSavedPage = window.localStorage.getItem("rootsLastCorporation");

            // If the page we want is greater than the last saved page, we need to pull content from the web
            if($scope.currentPage > $scope.lastSavedPage){

              $scope.pullContent();
            
            // else if the page we want is lower than the last saved page, we have it on local Storage, so just show it.
            } else {

              $scope.items = window.localStorage.getObject('rootsCorporation');
              $scope.currentPage = $scope.lastSavedPage;
              $scope.totalPages = window.localStorage.getItem("rootsTotalCorporation");
              $scope.isFetching = false;

            }

          }

        }
      
      }

    };

    $scope.imgLoadedEvents = {
        done: function(instance) {
            angular.element(instance.elements[0]).removeClass('is-loading').addClass('is-loaded');
        }
    };

    $scope.showPost = function(index){
        
      $rootScope.postContent = $scope.items[index];
      $scope.news.pushPage('corporation.html');

    };

    $scope.nextPage = function(){

      $scope.currentPage++; 
      $scope.pageNumber = $scope.currentPage;                 
      $scope.getAllRecords($scope.pageNumber);        

    }

    $scope.renderHtml = function (htmlCode) {
      return $sce.trustAsHtml(htmlCode);
    };

  }]);

  // This controller let us print the Post Content in the post.html template
  app.controller('corporationPostController', [ '$scope', '$rootScope', '$sce', function($scope, $rootScope, $sce){
    
    $scope.item = $rootScope.postContent;

    $scope.renderHtml = function (htmlCode) {
      return $sce.trustAsHtml(htmlCode);
    };

    $scope.imgLoadedEvents = {
        done: function(instance) {
            angular.element(instance.elements[0]).removeClass('is-loading').addClass('is-loaded');
        }
    };    

  }]);

  // Map Markers Controller
  var map;

  app.controller('branchesController', function($http, $scope, $compile, $sce){
    
    $scope.getAll = true;
    $scope.locationsType = 'map';
    $scope.centerMap = [40.7112, -74.213]; // Start Position
    $scope.API = 'http://app.wokexpressfreshandfast.com.au/api/get_posts/?post_type=stores&posts_per_page=-1';
    $scope.isFetching = true;
    $scope.locations = [];
    $scope.userLat = 0;
    $scope.userLng = 0;
    $scope.closestLocations = [];
    $scope.minDistance = 50; // Km
    $scope.markers = [];
    $scope.infoWindow = {
      id: '',
      title: '',
      content: '',
      address: '',
      hours: '',
      phone: '',
      distance: '',
      order_now: ''
    };

    // true is to show ALL locations, false to show ONLY closests locations
    $scope.start = function(value, locationType){
        $scope.getAll = value;
        $scope.locationsType = locationType;
        
        if(locationType=='list'){
          $scope.init();
        }
    }

    $scope.$on('mapInitialized', function(event, evtMap) {
      map = evtMap;
      $scope.init();
      });

      $scope.init = function(){           

      navigator.geolocation.getCurrentPosition(function(position){
        $scope.drawMyLocation( position.coords.latitude, position.coords.longitude );
        $scope.userLat = position.coords.latitude;
        $scope.userLng = position.coords.longitude;
      }, function(error){
        console.log("Couldn't get the location of the user.");
        console.log(error);
      }, {
        maximumAge:60000,
        timeout:10000,
        enableHighAccuracy: true
      });

      }

      $scope.drawMyLocation = function( lat, lng){
        
        $scope.getAllRecords();

        if($scope.locationsType=='map'){
          var pinLayer;
        var swBound = new google.maps.LatLng(lat, lng);
        var neBound = new google.maps.LatLng(lat, lng);
        var bounds = new google.maps.LatLngBounds(swBound, neBound);  
         
        pinLayer = new PinLayer(bounds, map);
      }

      $scope.centerMap = [ lat, lng ];

      }

    $scope.getAllRecords = function(pageNumber){

      $scope.isFetching = true;

          $http.jsonp($scope.API+'&callback=JSON_CALLBACK').success(function(response) {

        $scope.locations = response.posts;
        $scope.isFetching = false;

        if($scope.getAll==true){
          // Get all locations
          $scope.allLocations();
        } else{
          // Get closest locations
          $scope.closestLocation();
        }
        

        });
     
    }

    $scope.allLocations = function(){
      
      $.each($scope.locations, function( index, value ) {

        var distance = Haversine( $scope.locations[ index ].custom_fields.location[0].lat, $scope.locations[ index ].custom_fields.location[0].lng, $scope.userLat, $scope.userLng );

        $scope.markers.push({
          'id'    : index,
          'title'   : $scope.locations[ index ].title,
          'content'   : $scope.locations[ index ].custom_fields.description[0],
          'address' : $scope.locations[ index ].custom_fields.address[0],
          'hours'   : $scope.locations[ index ].custom_fields.open_hours[0],
          'phone'   : $scope.locations[ index ].custom_fields.phone[0],
          'order_now'   : $scope.locations[ index ].custom_fields.order_now[0],
          'distance'  : (Math.round(distance * 100) / 100),
          'location'  : [$scope.locations[ index ].custom_fields.location[0].lat, $scope.locations[ index ].custom_fields.location[0].lng]
        });

      });

    }

    $scope.closestLocation = function(){    

      for(var i = 0; i < $scope.locations.length; i++){

        // Get lat and lon from each item
        var locationLat = $scope.locations[ i ].custom_fields.location[0].lat;
        var locationLng = $scope.locations[ i ].custom_fields.location[0].lng;

        // get the distance between user's location and this point
              var dist = Haversine( locationLat, locationLng, $scope.userLat, $scope.userLng );

              if ( dist < $scope.minDistance ){
                  $scope.closestLocations.push(i);
              }

      }

      $.each($scope.closestLocations, function( index, value ) {

        var distance = Haversine( $scope.locations[ value ].custom_fields.location[0].lat, $scope.locations[ value ].custom_fields.location[0].lng, $scope.userLat, $scope.userLng );

        $scope.markers.push({
          'id'    : index,
          'title'   : $scope.locations[ value ].title,
          'content'   : $scope.locations[ value ].custom_fields.description[0],
          'address' : $scope.locations[ value ].custom_fields.address[0],
          'hours'   : $scope.locations[ value ].custom_fields.open_hours[0],
          'phone'   : $scope.locations[ value ].custom_fields.phone[0],
          'order_now'   : $scope.locations[ value ].custom_fields.order_now[0],
          'distance'  : (Math.round(distance * 100) / 100),
          'location'  : [$scope.locations[ value ].custom_fields.location[0].lat, $scope.locations[ value ].custom_fields.location[0].lng]
        });

      });

    }

      $scope.showMarker = function(event){

      $scope.marker = $scope.markers[this.id];
        $scope.infoWindow = {
          id    : $scope.marker.id,
        title   : $scope.marker.title,
        content : $scope.marker.content,
        address : $scope.marker.address,
        hours : $scope.marker.hours,
        phone : $scope.marker.phone,
        distance: $scope.marker.distance,
        order_now: $scope.marker.order_now
      };
      $scope.$apply();
      $scope.showInfoWindow(event, 'marker-info', this.getPosition());

      }

      $scope.renderHtml = function (htmlCode) {
          return $sce.trustAsHtml(htmlCode);
      }

      // Get Directions
    $(document).on('click', '.get-directions', function(e){
      e.preventDefault();

      var marker = $scope.markers[$(this).attr('data-marker')];

      launchnavigator.navigate(
        [marker.location[0], marker.location[1]],
        null,
      function(){
        console.log('launch navigator success');
      },
      function(error){
        console.log('launch navigator error');
      });

    });

    $(document).on('click', '.order-now', function(e){
      e.preventDefault();

      var url = $(this).attr('data-url');

      window.open(url, '_system');

    });
          
      // Call
    $(document).on('click', '.call-phone', function(e){

      e.preventDefault();

      var phone = $(this).attr('data-phone');
      phone = phone.replace(/\D+/g, "");

      window.open('tel:'+phone, '_system');

    });

  });


  // Maps Functions //

  // Math Functions
  function Deg2Rad( deg ) {
     return deg * Math.PI / 180;
  }

  // Get Distance between two lat/lng points using the Haversine function
  // First published by Roger Sinnott in Sky & Telescope magazine in 1984 ("Virtues of the Haversine")
  function Haversine( lat1, lon1, lat2, lon2 ){
      var R = 6372.8; // Earth Radius in Kilometers

      var dLat = Deg2Rad(lat2-lat1);  
      var dLon = Deg2Rad(lon2-lon1);  

      var a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
                      Math.cos(Deg2Rad(lat1)) * Math.cos(Deg2Rad(lat2)) * 
                      Math.sin(dLon/2) * Math.sin(dLon/2);  
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      var d = R * c; 

      // Return Distance in Kilometers
      return d;
  }

  // Pulse Marker Icon
  function PinLayer(bounds, map) {
      this.bounds = bounds;
      this.setMap(null);
      this.setMap(map);
  }

  PinLayer.prototype = new google.maps.OverlayView();

  PinLayer.prototype.onAdd = function() {

    // Container
    var container = document.createElement('DIV');
    container.className = "pulse-marker";

    // Pin
      var marker = document.createElement('DIV');
      marker.className = "pin";

      // Pulse
      var pulse = document.createElement('DIV');
      pulse.className = 'pulse';

      container.appendChild(marker);
      container.appendChild(pulse);

      this.getPanes().overlayLayer.appendChild(container);

      container.appendChild(document.createElement("DIV"));
      this.div = container;
  }

  PinLayer.prototype.draw = function() {
      var overlayProjection = this.getProjection();
      var sw = overlayProjection.fromLatLngToDivPixel(this.bounds.getSouthWest());
      var ne = overlayProjection.fromLatLngToDivPixel(this.bounds.getNorthEast());
      var div = this.div;
      div.style.left = sw.x - 8 + 'px';
      div.style.top = ne.y - 15 + 'px';
  }  

})();

