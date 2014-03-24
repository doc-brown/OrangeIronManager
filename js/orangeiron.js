/***
 *      ____                         ____              __  ___
 *     / __ \_______ ____  ___ ____ /  _/______  ___  /  |/  /__ ____  ___ ____ ____ ____
 *    / /_/ / __/ _ `/ _ \/ _ `/ -_)/ // __/ _ \/ _ \/ /|_/ / _ `/ _ \/ _ `/ _ `/ -_) __/
 *    \____/_/  \_,_/_//_/\_, /\__/___/_/  \___/_//_/_/  /_/\_,_/_//_/\_,_/\_, /\__/_/
 *                       /___/                                            /___/
 */
var orangeIronManager = angular.module('orangeIronManager', ['ngAnimate'])

.controller('OrangeIronCtrl', function($scope, $http) {
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

    $scope.errorMessage = '';

    $scope.server = null;
    $scope.lessonToEdit = null;

    $scope.newAlternativeTranslations = [];
    $scope.newVocabulary = [];
    $scope.newWord = {};
    $scope.newWords = [];

    var currIndex = -1;
    var isDebug = false;

    $scope.getData = function(url) {
        $http.get(url).success(function(data) {
            // reset error message
            $scope.errorMessage = '';

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

            $scope.server = data;
        }).error(function(data, status, headers, config) {
            switch (status) {
                case 404:
                    $scope.errorMessage = "Es wurden keine Vokabeln unter dem angegeben URL gefunden. Bitte überprüfe den URL und versuche es nochmal.";
                    break;
                default:
                    $scope.errorMessage = "Es ist ein unbekannter Fehler beim Laden der Vokabeln aufgetreten! Der Server lieferte als Antwort: " + status + ".";
            }
        });
    };

    $scope.createServer = function() {
        $scope.server = {
            uuid: uuid(),
            serverName: $scope.serverName,
            serverDescription: $scope.serverDescription,
            version: 1,
            lessons: []
        };
        resetFields();
    };

    $scope.addLesson = function() {
        $scope.server.lessons.push({
            uuid: uuid(),
            name: $scope.newLessonName,
            language: $scope.language.locale,
            version: 1,
            vocabulary: $scope.newVocabulary
        });
        $scope.server.version++;
        $scope.newLessonName = '';
        $scope.newOriginalWord = '';
        $scope.newCorrectTranslation = '';
        resetFields();
    };

    $scope.addTranslation = function() {
        $scope.newAlternativeTranslations.push({
            text: $scope.newAlternativeTranslation
        });
        $scope.newAlternativeTranslation = '';
    };

    $scope.addWord = function() {
        $scope.newWord = {
            uuid: uuid(),
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

    $scope.editLesson = function(lesson) {
        var idx = $scope.server.lessons.indexOf(lesson);
        $scope.lessonToEdit = angular.copy($scope.server.lessons[idx]);
        currIndex = idx;
    };

    $scope.saveEditedLesson = function() {
        $scope.lessonToEdit.version++;
        $scope.server.lessons[currIndex] = $scope.lessonToEdit;
        $scope.server.version++;
        $scope.lessonToEdit = null;
    };

    $scope.cancelEditedLesson = function() {
        $scope.lessonToEdit = null;
    };

    $scope.showEditSection = function() {
        if ($scope.lessonToEdit) {
            return true;
        } else {
            return false;
        }
    };

    $scope.toggleDebug = function() {
        isDebug = !isDebug;
    }

    $scope.isDebugEnabled = function() {
        return isDebug;
    }

    $scope.saveData = function() {
        if (!showSave) {
            alert("Your browser does not support any method of saving JavaScript generated data to files.");
            return;
        }
        showSave(angular.toJson($scope.server), 'server.json', 'text/plain; charset=UTF-8');
    };

    uuid = function() {
        return UUIDjs.create().toString();
    };

    resetFields = function() {
        $scope.newAlternativeTranslations = [];
        $scope.newVocabulary = [];
        $scope.newWord = {};
        $scope.newWords = [];
    }

    // Defaults
    $scope.language = {
        name: 'Englisch',
        locale: 'en'
    };

    // Development-Constants. REMOVE FOR PRODUCTION
    $scope.url = "https://dl.dropboxusercontent.com/u/64100103/AndrVocJSON/albert.json"
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
