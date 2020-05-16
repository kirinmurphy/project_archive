window.MOVE = angular.module('MOVE', {});

MOVE.directive('bpmCounter', [function () {
  return {
    restrict: "EA",
    scope: { bpm: '=' },
    transclude: true,
    template: '<div ng-click="reset()" ng-transclude></div></div>',
    link: function (scope, element, attrs) {
      scope.reset = function () { scope.fullQuarterNoteIndex = 0; };
    },
    controller: ['$scope', '$interval', function ($scope, $interval) {

      var _this = this;

      var secondsPerBeat = 60 / $scope.bpm;
      var beatInterval = secondsPerBeat * 1000; // ms/beat
      var quarterNoteInterval = beatInterval / 4;
      $scope.fullQuarterNoteIndex = 0;

      this.quarterNoteCount = 0;
      this.beatCount = 0;
      this.barCount = 0;
      this.barSetCount = 1;

      $interval(incrementThatShit, quarterNoteInterval);

      function incrementThatShit () {
        var onWholeBeat = $scope.fullQuarterNoteIndex % 4 === 0;
        if ( onWholeBeat ) { updateBeatCount(); }
        _this.quarterNoteCount = $scope.fullQuarterNoteIndex % 4 + 1;
        $scope.fullQuarterNoteIndex++;
      };

      function updateBeatCount () {
        var onBar = $scope.fullQuarterNoteIndex / 4 % 4 === 0;
        _this.beatCount = onBar ? 1 : _this.beatCount + 1;
        if ( onBar ) { updateBarCount(); }
      };

      function updateBarCount () {
        var limit = 4;
        var atLimit = _this.barCount === limit;
        _this.barCount = atLimit ? 1 : _this.barCount + 1;
        if ( atLimit ) { _this.barSetCount++; }
      };

      this.isActiveBeat = function (index, elementsPerBar, patternMap) {
        return isOn(_this.beatCount, index, elementsPerBar, patternMap);
      }

      this.isActiveQuarterNote = function (index, elementsPerBeat, patternMap) {
        return isOn(_this.quarterNoteCount, index, elementsPerBeat, patternMap);
      }

      function isOn (count, index, elementsPer, patternMap) {
        var itIsOn = count === (index) * 4 / elementsPer + 1;
        return itIsOn && isPlayed(index, patternMap);
      }

      function isPlayed (index, patternMap) {
        var hasMap = patternMap.length;
        var playedNote = hasMap && patternMap[index][0] === true;
        return !hasMap || playedNote;
      }
    }]
  };
}]);

MOVE.directive('looper', [
  function () {
    return {
      restrict: "EA",
      transclude: true,
      require: '?^bpmCounter',
      scope: {
        elementsPerBeat: '=',
        elementsPerBar: '=',
        patternMap: '=',
        countPerBeat: '='
      },
      templateUrl: 'template-looper',
      link: function (scope, element, attrs, bpmCounterCtrl) {

        scope.counter = bpmCounterCtrl;

        scope.patternMap = scope.patternMap || [];

        scope.getNumber = function (num) { return new Array(num); };
      }
    };
  }
]);
