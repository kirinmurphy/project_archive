window.FBQueueIntroPopup = (function(settings) {

  function FBQueueIntroPopup(settings) {
    this.init(settings);
    this.settings = settings;
  };

  FBQueueIntroPopup.prototype = {
    events: [
      ['click', '.frame[data-frame="player-size"] button', 'setPlayerSize'],
      ['click', '.frame[data-frame="auto-add-option"] button', 'setAutoAddState'],
      ['click', '.frame .option button', 'advanceFrame'],
      ['click', '.refresh-message a', 'refreshPage'],
      ['click', '.close-popup', 'closePopup']
    ],

    session: {
      autoAdding: false
    },

    init: function (settings) {
      var _this = this;
      var templateUrl = chrome.extension.getURL('/templates/intro_popup.html');
      $.get(templateUrl, function(data) { _this.introPopupLoaded(data); });
    },

    closePopup: function($trigger, event) {
      var _this = this;
      this.$el.fadeOut(200, function() { _this.$el.remove(); });
    },

    introPopupLoaded: function (data) {
      $('body').append(data);
      this.settings.onLoad();
      this.$el = $('.intro-frame');
      this.$popup = this.$el.find('.intro-popup');
      this.bindEvents(this.$el, this.events);
      this.bindImages();
    },

    bindImages: function () {
      this.$el.find('[data-img]').each(function(index, item) {
        var $imgWrap = $(item);
        var urlString = $imgWrap.attr('data-img');
        var url = chrome.extension.getURL("images/" + urlString)
        $('<img/>', { src:url }).appendTo($imgWrap);
      });
    },

    setPlayerSize: function ($trigger, event) {
      this.settings.parentScope.triggerResize($trigger);
    },

    setAutoAddState: function ($trigger, event) {
      var stateString = $trigger.attr('data-auto-add');
      var state =  stateString == "true" ? true : false;
      this.settings.parentScope.setAutoQueue(state);
      this.session.autoAdding = state;
      this.$popup.attr('data-auto-adding', state);
    },

    refreshPage: function ($trigger, event) {
      event.preventDefault();
      window.location.reload();
    },

    advanceFrame: function ($trigger, event) {
      var $nextFrame = $trigger.closest('.frame').next('.frame');
      if ( $nextFrame.length ) { this.jumpToFrame($nextFrame); }
      else { this.closePopup(); }
    },

    jumpToFrame: function($frame) {
      this.$el.find('.frame:visible').hide();
      var frameLabel = $frame.attr('data-frame');
      this.$popup.attr('data-on-frame', frameLabel);
      $frame.fadeIn(200);
      this.checkIfFinalFrame($frame);
    },

    checkIfFinalFrame: function($frame) {
      if ( $frame.next('.frame').length ) { return false; }
      if ( this.session.autoAdding ) { this.$el.find('.refresh-message').show(); }
      this.closeAfterDelay();
    },

    closeAfterDelay: function () {
      var _this = this;
      var hideDelay = this.session.autoAdding ? 3000 : 1000;
      setTimeout(function() { _this.closePopup(); }, hideDelay);
    },

    bindEvents: function($scope, eventBindings) {
      var _this = this;
      eventBindings.forEach(function(binding) {
        $scope.on(binding[0], binding[1], function(event) {
          _this[binding[2]]($(event.currentTarget), event);
        })
      });
    }
  };

  return FBQueueIntroPopup;
})();
