/***
 *      ____                         ____              __  ___
 *     / __ \_______ ____  ___ ____ /  _/______  ___  /  |/  /__ ____  ___ ____ ____ ____
 *    / /_/ / __/ _ `/ _ \/ _ `/ -_)/ // __/ _ \/ _ \/ /|_/ / _ `/ _ \/ _ `/ _ `/ -_) __/
 *    \____/_/  \_,_/_//_/\_, /\__/___/_/  \___/_//_/_/  /_/\_,_/_//_/\_,_/\_, /\__/_/
 *                       /___/                                            /___/
 */
"use strict";

var orangeIronManager = angular.module('orangeIronManager', ['ui.router', 'ngAnimate'])

.config(function($stateProvider, $urlRouterProvider) {
    //
    // For any unmatched url, redirect to /loadServer
    $urlRouterProvider.otherwise("/loadServer");
    //
    // Now set up the states
    $stateProvider
        .state('loadServer', {
            url: "/loadServer",
            templateUrl: "templates/loadServer.html",
            controller: 'LoadServer'
        })
        .state('createServer', {
            url: "/createServer",
            templateUrl: "templates/createServer.html",
            controller: 'CreateServer'
        })
        .state('lessonList', {
            url: "/lessonList",
            templateUrl: "templates/lessonList.html",
            controller: 'LessonList'
        })
        .state('editLesson', {
            url: "/editLesson/:index",
            templateUrl: "templates/editLesson.html",
            controller: 'EditLesson',
            resolve: {
                lesson: function($stateParams, Server) {
                    return Server.getLessonByIndex($stateParams.index);
                }
            }
        })
        .state('createLesson', {
            url: "/createLesson",
            templateUrl: "templates/createLesson.html",
            controller: 'CreateLesson'
        });
})

.factory('Server', function($http) {
    var server = null;
    var errorMessage = '';
    var response = {};

    var _loadData = function(url) {
        var promise = $http.get(url).then(function(success) {
            // reset error message
            errorMessage = '';

            var data = success.data;

            // old format without uuids? -> convert to new format
            if (data.uuid == null) {
                data.uuid = uuid();
            }
            for (i = 0; i < data.lessons.length; ++i) {
                if (data.lessons[i].uuid == null) {
                    data.lessons[i].uuid = uuid();
                }
                for (j = 0; j < data.lessons[i].vocabulary.length; ++j) {
                    if (data.lessons[i].vocabulary[j].uuid == null) {
                        data.lessons[i].vocabulary[j].uuid = uuid();
                    }
                }

            }

            // Wrap the alternative translations into objects. This is a workaround for the current inability of AngularJS to bind to primitive types
            for (var i = data.lessons.length - 1; i >= 0; i--) {
                for (var j = data.lessons[i].vocabulary.length - 1; j >= 0; j--) {
                    var tempArray = [];
                    angular.forEach(data.lessons[i].vocabulary[j].alternativeTranslations, function(value, key) {
                        this.push({
                            text: value
                        });
                    }, tempArray);
                    data.lessons[i].vocabulary[j].alternativeTranslations = tempArray;
                };
            };

            console.log(angular.toJson(data));
            server = data;
            response.data = server;
            response.errorMessage = errorMessage;
            return response;
        }, function(error) {
            switch (error.status) {
                case 404:
                    errorMessage = "Es wurden keine Vokabeln unter dem angegeben URL gefunden. Bitte überprüfe den URL und versuche es nochmal.";
                    break;
                default:
                    errorMessage = "Es ist ein unbekannter Fehler beim Laden der Vokabeln aufgetreten! Der Server lieferte als Antwort: " + status + ".";
            }
            server = null;
            response.data = server;
            response.errorMessage = errorMessage;
            return response;
        });
        return promise;
    };

    var _getLessonByUuid = function(uuid) {
        for (var i = 0; i < server.lessons.length; i++) {
            if (server.lessons[i].uuid === uuid) {
                return server.lessons[i];
            }
        }
    };

    var _getLessonByIndex = function(index) {
        return server.lessons[index];
    };

    return {
        loadData: function(url) {
            return _loadData(url);
        },
        getData: function() {
            return server;
        },
        getErrorMessage: function() {
            return errorMessage;
        },
        getLessonByUuid: function(uuid) {
            return _getLessonByUuid(uuid);
        },
        getLessonByIndex: function(index) {
            return _getLessonByIndex(index);
        }
    };
})

.controller('NavBar', function($scope, Server) {
})

.controller('LoadServer', function($scope, $http, Server) {
    $scope.errorMessage = '';
    $scope.server = Server.getData();

    // Development-Constants. REMOVE FOR PRODUCTION
    $scope.url = "https://dl.dropboxusercontent.com/u/64100103/AndrVocJSON/albert.json";

    $scope.getData = function(url) {
        Server.loadData(url).then(function(response) {
            console.log(response);
            $scope.data.errorMessage = response.errorMessage;
            $scope.data.server = response.data;
        });
    };

})

.controller('LessonList', function($scope, Server) {
    $scope.data.server = Server.getData();
})

.controller('EditLesson', function($scope, Server, lesson) {
    console.log("EditLesson");
    $scope.lessonToEdit = lesson;
    console.log(lesson);
})

.controller('OrangeIronCtrl', function($scope, $http, Server) {
    $scope.data = {};
    $scope.data.server = Server.getData();
    console.log("OrangeIronCtrl " + $scope.data.server);

    // $scope.languages = [{
    //     name: 'Englisch',
    //     locale: 'en'
    // }, {
    //     name: 'Französisch',
    //     locale: 'fr'
    // }, {
    //     name: 'Spanisch',
    //     locale: 'es'
    // }];

    // $scope.lessonToEdit = null;

    // $scope.newAlternativeTranslations = [];
    // $scope.newVocabulary = [];
    // $scope.newWord = {};
    // $scope.newWords = [];

    // var currIndex = -1;
    // var isDebug = false;



    // $scope.createServer = function() {
    //     $scope.server = {
    //         uuid: uuid(),
    //         serverName: $scope.serverName,
    //         serverDescription: $scope.serverDescription,
    //         version: 1,
    //         lessons: []
    //     };
    //     resetFields();
    // };

    // $scope.addLesson = function() {
    //     $scope.server.lessons.push({
    //         uuid: uuid(),
    //         name: $scope.newLessonName,
    //         language: $scope.language.locale,
    //         version: 1,
    //         vocabulary: $scope.newVocabulary
    //     });
    //     $scope.server.version++;
    //     $scope.newLessonName = '';
    //     $scope.newOriginalWord = '';
    //     $scope.newCorrectTranslation = '';
    //     resetFields();
    // };

    // $scope.addTranslation = function() {
    //     $scope.newAlternativeTranslations.push({
    //         text: $scope.newAlternativeTranslation
    //     });
    //     $scope.newAlternativeTranslation = '';
    // };

    // $scope.addWord = function() {
    //     $scope.newWord = {
    //         uuid: uuid(),
    //         originalWord: $scope.newOriginalWord,
    //         correctTranslation: $scope.newCorrectTranslation,
    //         alternativeTranslations: $scope.newAlternativeTranslations
    //     };
    //     $scope.newVocabulary.push($scope.newWord);
    //     $scope.newWords.push($scope.newWord);
    //     $scope.newAlternativeTranslations = [];
    //     $scope.newWord = {};
    //     $scope.newOriginalWord = '';
    //     $scope.newCorrectTranslation = '';
    //     $('#newOriginalWord').focus();
    // };

    // $scope.editLesson = function(lesson) {
    //     var idx = $scope.server.lessons.indexOf(lesson);
    //     $scope.lessonToEdit = angular.copy($scope.server.lessons[idx]);
    //     currIndex = idx;
    // };

    // $scope.saveEditedLesson = function() {
    //     $scope.lessonToEdit.version++;
    //     $scope.server.lessons[currIndex] = $scope.lessonToEdit;
    //     $scope.server.version++;
    //     $scope.lessonToEdit = null;
    // };

    // $scope.cancelEditedLesson = function() {
    //     $scope.lessonToEdit = null;
    // };

    // $scope.showEditSection = function() {
    //     if ($scope.lessonToEdit) {
    //         return true;
    //     } else {
    //         return false;
    //     }
    // };

    // $scope.toggleDebug = function() {
    //     isDebug = !isDebug;
    // }

    // $scope.isDebugEnabled = function() {
    //     return isDebug;
    // }

    // $scope.saveData = function() {
    //     if (!showSave) {
    //         alert("Your browser does not support any method of saving JavaScript generated data to files.");
    //         return;
    //     }
    //     showSave(angular.toJson($scope.server), 'server.json', 'text/plain; charset=UTF-8');
    // };

    // uuid = function() {
    //     return UUIDjs.create().toString();
    // };

    // resetFields = function() {
    //     $scope.newAlternativeTranslations = [];
    //     $scope.newVocabulary = [];
    //     $scope.newWord = {};
    //     $scope.newWords = [];
    // }

    // // Defaults
    // $scope.language = {
    //     name: 'Englisch',
    //     locale: 'en'
    // };

})

.filter('stripAlternativeTranslations', ['$filter',
    function($filter) {
        return function(input) {
            if (input !== null) {
                var data = angular.copy(input);
                // flatten alternative translations arrays
                for (var i = data.lessons.length - 1; i >= 0; i--) {
                    for (var j = data.lessons[i].vocabulary.length - 1; j >= 0; j--) {
                        var tempArray = [];
                        angular.forEach(data.lessons[i].vocabulary[j].alternativeTranslations, function(value, key) {
                            this.push(value.text);
                        }, tempArray);
                        data.lessons[i].vocabulary[j].alternativeTranslations = tempArray;
                    };
                };
            }
            return $filter('json')(data);
        };
    }
]);
