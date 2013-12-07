function OrangeIronCtrl($scope, $http) {

	$scope.server = {};
	$scope.lessons = [];

	$scope.newAlternativeTranslations = [];
	$scope.newVocabulary = [];
	$scope.newWord = {};
	$scope.newWords = [];

	$scope.getData = function() {
		$http.get('https://googledrive.com/host/0B5pL2OLIkCeiN00xdnVyRGszTmM/albert2.json').success(function(data) {
	    $scope.server = data;
	    $scope.lessons = data.lessons;
	  });
	}

	$scope.addLesson = function() {
		$scope.server.lessons.push({name:$scope.newLessonName, version:1, vocabulary:$scope.newVocabulary});
		$scope.newLessonName = '';
	}

	$scope.addTranslation = function() {
		$scope.newAlternativeTranslations.push($scope.newAlternativeTranslation);
		$scope.newAlternativeTranslation = '';
	}

	$scope.addWord = function() {
		$scope.newWord = {originalWord:$scope.newOriginalWord, correctTranslation:$scope.newCorrectTranslation, alternativeTranslations:$scope.newAlternativeTranslations};
		$scope.newVocabulary.push($scope.newWord);
		$scope.newWords.push($scope.newWord);
		$scope.newOriginalWord = '';
		$scope.newCorrectTranslation = '';
		$scope.newAlternativeTranslations = [];
		$scope.newAlternativeTranslation = '';
	}
}