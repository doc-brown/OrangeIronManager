function OrangeIronCtrl($scope, $http) {

	$scope.server = {};
	$scope.lessons = [];
	$scope.editLesson = {};

	$scope.newAlternativeTranslations = [];
	$scope.newVocabulary = [];
	$scope.newWord = {};
	$scope.newWords = [];

	currIndex = 0;

	$scope.getData = function() {
		$http.get('https://googledrive.com/host/0B5pL2OLIkCeiN00xdnVyRGszTmM/albert2.json').success(function(data) {
	    $scope.server = data;
	    $scope.lessons = data.lessons;
	  });
	};

	$scope.createServer = function() {
		$scope.server = {uuid:uuid(), serverName:$scope.serverName, serverDescription:$scope.serverDescription, version:1, lessons:[]};
	};

	$scope.addLesson = function() {
		$scope.server.lessons.push({uuid:uuid(), name:$scope.newLessonName, version:1, vocabulary:$scope.newVocabulary});
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
		$scope.newOriginalWord = '';
		$scope.newCorrectTranslation = '';
		$scope.newAlternativeTranslations = [];
		$scope.newAlternativeTranslation = '';
	};

	$scope.editLesson = function(index) {
		$scope.editLesson = $scope.lessons[index];
		currIndex = index;
	};

	$scope.saveEditedLesson = function(index) {
		$scope.editLesson.version++;
		$scope.server.lessons[currIndex] = $scope.editLesson;
		$scope.server.version++;
	};

	uuid = function() {
		return UUIDjs.create().toString();
	};
}