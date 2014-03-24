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
            url: "/editLesson/:uuid",
            templateUrl: "templates/editLesson.html",
            controller: 'EditLesson',
            resolve: {
                lesson: function($stateParams, Server) {
                    return Server.getLessonByUuid($stateParams.uuid);
                }
            }
        })
        .state('createLesson', {
            url: "/createLesson",
            templateUrl: "templates/createLesson.html",
            controller: 'CreateLesson'
        })
        .state('output', {
            url: "/output",
            templateUrl: "templates/output.html",
            controller: 'Output'
        });
})

.factory('UUID', function() {
    return {
        create: function() {
            return UUIDjs.create().toString();
        }
    }
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

    var _addLesson = function(newLesson) {
        server.lessons.push(newLesson);
        server.version++;
    };

    var _createServer = function(newServer) {
        server = newServer;
    };

    var _updateLesson = function(oldLesson, newLesson) {
        newLesson.version++;
        var index = server.lessons.indexOf(oldLesson);
        server.lessons[index] = newLesson;
        server.version++;
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
        },
        addLesson: function(newLesson) {
            _addLesson(newLesson);
        },
        createServer: function(newServer) {
            _createServer(newServer);
        },
        updateLesson: function(oldLesson, newLesson) {
            _updateLesson(oldLesson, newLesson);
        }
    };
})

.controller('OrangeIronCtrl', function($scope, $http, Server) {
    $scope.data = {};
    $scope.data.server = Server.getData();
})

.controller('NavBar', function($scope, Server) {})

.controller('CreateServer', function($scope, Server, UUID) {
    $scope.createServer = function() {
        Server.createServer({
            uuid: UUID.create(),
            serverName: $scope.serverName,
            serverDescription: $scope.serverDescription,
            version: 1,
            lessons: []
        })
        $scope.data.server = Server.getData();
    };
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

.controller('EditLesson', function($scope, $state, Server, UUID, lesson) {
    // create a deep copy of the lesson object, so we have to explicitly save the changes we made
    $scope.lessonToEdit = angular.copy(lesson);

    $scope.addTranslation = function() {
        $scope.newAlternativeTranslations.push({
            text: $scope.newAlternativeTranslation
        });
        $scope.newAlternativeTranslation = '';
    };

    $scope.newAlternativeTranslations = [];
    $scope.newWord = {};

    $scope.addWord = function() {
        $scope.newWord = {
            uuid: UUID.create(),
            originalWord: $scope.newOriginalWord,
            correctTranslation: $scope.newCorrectTranslation,
            alternativeTranslations: $scope.newAlternativeTranslations
        };
        $scope.lessonToEdit.vocabulary.push($scope.newWord);
        $scope.newAlternativeTranslations = [];
        $scope.newWord = {};
        $scope.newOriginalWord = '';
        $scope.newCorrectTranslation = '';
        $('#newOriginalWord').focus();
    };

    $scope.removeWord = function(word) {
        $scope.lessonToEdit.vocabulary.splice($scope.lessonToEdit.vocabulary.indexOf(word), 1);
    };

    $scope.saveEditedLesson = function() {
        Server.updateLesson(lesson, $scope.lessonToEdit);
        $state.go('lessonList');
    };

    $scope.cancelEditedLesson = function() {
        $state.go('lessonList');
    };
})

.controller('CreateLesson', function($scope, Server, UUID) {
    $scope.languages = [{
        name: 'Englisch',
        locale: 'en'
    }, {
        name: 'Französisch',
        locale: 'fr'
    }, {
        name: 'Spanisch',
        locale: 'es'
    }];

    // Default
    $scope.language = {
        name: 'Englisch',
        locale: 'en'
    };

    $scope.newAlternativeTranslations = [];
    $scope.newVocabulary = [];
    $scope.newWord = {};
    $scope.newWords = [];

    $scope.addLesson = function() {
        Server.addLesson({
            uuid: UUID.create(),
            name: $scope.newLessonName,
            language: $scope.language.locale,
            version: 1,
            vocabulary: $scope.newVocabulary
        });
        $scope.newLessonName = '';
        $scope.newOriginalWord = '';
        $scope.newCorrectTranslation = '';
        $scope.newWords = [];
    };

    $scope.addTranslation = function() {
        $scope.newAlternativeTranslations.push({
            text: $scope.newAlternativeTranslation
        });
        $scope.newAlternativeTranslation = '';
    };

    $scope.addWord = function() {
        $scope.newWord = {
            uuid: UUID.create(),
            originalWord: $scope.newOriginalWord,
            correctTranslation: $scope.newCorrectTranslation,
            alternativeTranslations: $scope.newAlternativeTranslations
        };
        $scope.newVocabulary.push($scope.newWord);
        $scope.newWords.push($scope.newWord);
        $scope.newAlternativeTranslations = [];
        $scope.newWord = {};
        $scope.newOriginalWord = '';
        $scope.newCorrectTranslation = '';
        $('#newOriginalWord').focus();
    };
})

.controller('Output', function($scope) {
    $scope.saveData = function() {
        if (!showSave) {
            alert("Your browser does not support any method of saving JavaScript generated data to files.");
            return;
        }
        showSave(angular.toJson($scope.data.server), 'server.json', 'text/plain; charset=UTF-8');
    };
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
