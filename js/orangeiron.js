var orangeIronManager = angular.module('orangeIronManager', ['ngAnimate']);

function OrangeIronCtrl($scope, $http) {

	$scope.languages = [{name:'Englisch', locale:'en'}, {name:'Französisch', locale:'fr'}, {name:'Spanisch', locale:'es'}];

	$scope.server = {};
	$scope.lessonToEdit = null;

	$scope.newAlternativeTranslations = [];
	$scope.newVocabulary = [];
	$scope.newWord = {};
	$scope.newWords = [];

	var currIndex = -1;
	var isDebug = false;

	$scope.getData = function(url) {
		$http.get(url).success(function(data) {
			if (data.uuid == null) {
				// old format without uuids -> convert to new format
				for (i = 0; i < data.lessons.length; ++i) {
					data.lessons[i].uuid = uuid();
					for (j = 0; j < data.lessons[i].vocabulary.length; ++j) {
						data.lessons[i].vocabulary[j].uuid = uuid();
					}
				}
			}
	    $scope.server = data;
	  });
	};

	$scope.createServer = function() {
		$scope.server = {uuid:uuid(), serverName:$scope.serverName, serverDescription:$scope.serverDescription, version:1, lessons:[]};
		resetFields();
	};

	$scope.addLesson = function() {
		$scope.server.lessons.push({uuid:uuid(), name:$scope.newLessonName, language:$scope.language.locale, version:1, vocabulary:$scope.newVocabulary});
		$scope.server.version++;
		$scope.newLessonName = '';
		$scope.newWords =  [];
	};

	$scope.addTranslation = function() {
		$scope.newAlternativeTranslations.push($scope.newAlternativeTranslation);
		$scope.newAlternativeTranslation = '';
	};

	$scope.addWord = function() {
		$scope.newWord = {uuid:uuid(), originalWord:$scope.newOriginalWord, correctTranslation:$scope.newCorrectTranslation, alternativeTranslations:$scope.newAlternativeTranslations};
		$scope.newVocabulary.push($scope.newWord);
		$scope.newWords.push($scope.newWord);
		resetFields();
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
		isDebug=!isDebug;
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
		$scope.newAlternativeTranslations =[];
		$scope.newVocabulary = [];
		$scope.newWord = {};
		$scope.newWords = [];
	}

	// Defaults
	$scope.language = {name:'Englisch', locale:'en'};

	// Development-Constants. REMOVE FOR PRODUCTION
	$scope.url="https://googledrive.com/host/0B5pL2OLIkCeiN00xdnVyRGszTmM/uuid.json"
}