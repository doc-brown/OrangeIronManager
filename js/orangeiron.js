function OrangeIronCtrl($scope, $http) {

	$scope.server = {};
	$scope.lessons = [];

	$scope.getData = function() {
		$http.get('https://googledrive.com/host/0B5pL2OLIkCeiN00xdnVyRGszTmM/albert2.json').success(function(data) {
	    $scope.server = data;
	    $scope.lessons = data.lessons;
	  });
	}
}