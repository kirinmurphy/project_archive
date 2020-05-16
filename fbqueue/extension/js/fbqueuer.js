window.FBQueuer = (function() {
  function FBQueuer() { this.init(); };

  FBQueuer.prototype = {
    user: {  // defaults
      viewMode: 'maximized',
      autoQueueAll: false,
      firstTime: true
    },

    session: {
      activeClip: null,
      domLoaded: false,
      pendingQueueItems: []
    },

    ui: {
      $cliplist: '.cliplist',
      $backButton: '.back-button',
      $nextButton: '.next-button',
      $playerContainer: '.player-container',
      $refreshMessage: '.refresh-message'
    },

    events: [
      ['click', '.back-button', 'goToPrevClip'],
      ['click', '.next-button', 'goToNextClip'],
      ['click', '.open-settings', 'openSettingsPanel'],
      ['click', '.close-settings', 'closeSettingsPanel'],
      ['click', '[data-set-view-mode]', 'triggerResize'],
      ['click', '.auto-queue-control input:checkbox', 'toggleAutoQueueFromCheckbox'],
      ['click', '.maximize-from-min', 'maximize'],
      ['click', '.refresh-message a', 'refreshPage']
    ],

    init: function () {
      this.loadSavedSettings();
      this.bindLinkObserver();

      var _this = this;
      document.addEventListener("DOMContentLoaded", function(event) {
        if ( _this.user.firstTime ) { _this.loadIntroPopup(); }
        _this.loadMediaPlayer();
      });
    },

    loadIntroPopup: function () {
      var _this = this;
      var introPopup = new window.FBQueueIntroPopup({
        onLoad: function() { _this.saveSettings('firstTime', false); },
        parentScope: this
      })
    },

    // -- SETUP QUEUE CONTROLS ON LINKS ----------//
    bindLinkObserver: function() {
      var _this = this;

      var observer = new MutationSummary({
        callback: handleLinkChanges,
        queries: [{ attribute: 'href' }]
      });

      function handleLinkChanges (changeSummaries) {
        changeSummaries[0].added.forEach(function(newEl) {
          _this.checkIfValidLink($(newEl));
        });

        changeSummaries[0].removed.forEach(function(removedEl) {
          _this.tearDownRemovedFBLink($(removedEl));
        });
      };
    },

    checkIfValidLink: function ($link) {
      var href = $link.attr('href');
      var urlMatches = href.match(/youtube.com/gi) || href.match(/youtu.be/gi);
      var hasTheRightKid = $link.find('.uiScaledImageContainer').length;
      if ( urlMatches && hasTheRightKid ) { this.addQueueControlToFBLink($link); }
    },

    addQueueControlToFBLink: function($link) {
      var pageClip = new window.PageClip($link);
      $link.data('pageClip', pageClip);

      if ( this.user.autoQueueAll ) { this.autoQueue(pageClip); }

      var _this = this;
      pageClip.$playTrigger.on('mousedown', function() {
        _this.addClipToPlaylist(pageClip, true);
      });

      pageClip.$queueTrigger.on('mousedown', function() {
        _this.addClipToPlaylist(pageClip);
      });
    },


    // -- MANAGING PLAYLIST ITEMS ----------------- //
    loadMediaPlayer: function () {
      var _this = this;
      var templateUrl = chrome.extension.getURL('/templates/player.html');
      $.get(templateUrl, function(data) { _this.playerTemplateLoaded(data); });
    },

    playerTemplateLoaded: function (data) {
      this.session.domLoaded = true;
      this.$el = $('<div/>', { 'class':'clip-container', html:data });
      this.$el.attr('data-view-mode', this.user.viewMode);

      this.bindElements();
      this.bindEvents();
      this.bindSavedSettingsToViewControls();
      this.addPendingClipsToPlaylist();
      this.bindToPage();
    },

    bindToPage: function() {
      var _this = this;
      $('body').append(this.$el)
        .attr('data-dom-loaded', true)
        .on('keydown', function(event) { _this.onKeyPress(event); });
    },

    autoQueue: function (pageClip) {
      if ( this.session.domLoaded ) { this.addClipToPlaylist(pageClip, false); }
      else { this.session.pendingQueueItems.push(pageClip); }
    },

    addPendingClipsToPlaylist: function () {
      var _this = this;
      $.each(this.session.pendingQueueItems, function (index, pendingQueueItem) {
        _this.addClipToPlaylist(pendingQueueItem, false);
      });
      this.session.pendingQueueItems = [];
    },

    addClipToPlaylist: function(pageClip, playNow) {
      var _this = this;
      pageClip.isQueued = true;

      this.insertClip(pageClip, playNow);

      pageClip.$queueLink.on('click', function(event) {
        event.preventDefault();
        _this.triggerClipFromPlaylist(pageClip);
      });

      pageClip.$removeLink.on('click', function() {
        _this.removeClipFromPlayer(pageClip);
      });

      $('body').attr('data-q-active', true);
      this.$el.show();
    },

    insertClip: function (pageClip, playNow) {
      pageClip.buildQueueItem();
      var existingClipCount = this.ui.$cliplist.find('li').length;
      var playNext = playNow && existingClipCount
      if ( playNext ) { this.insertClipAfterActiveClipAndPlay(pageClip); }
      else { this.insertClipAtTheEnd(pageClip, playNow); }
    },

    insertClipAtTheEnd: function (pageClip, playNow) {
      this.ui.$cliplist.append(pageClip.$queueItem);
      this.setNavStates();
      this.turnOnIfFirstClip(pageClip, playNow);
    },

    insertClipAfterActiveClipAndPlay: function (pageClip) {
      var $activeClip = this.ui.$cliplist.find('.active');
      pageClip.$queueItem.insertAfter($activeClip);
      this.playClip(pageClip);
    },

    removeClipFromPlayer: function (pageClip) {
      if ( pageClip.$queueItem.hasClass('active') ) {
        this.resetActiveClipStateWhenRemoved(pageClip);
      }

      pageClip.$queueItem.remove();
      pageClip.unQueue();
      this.setNavStates();
    },

    tearDownRemovedFBLink: function ($removedLink) {
      var pageClip = $removedLink.data('pageClip');
      if ( pageClip ) { pageClip.tearDownQueueableLink(); }
    },


    // -- ACTIVATING / DEACTIVATING CLIPS ------------- //
    turnOnIfFirstClip: function (pageClip, playNow) {
      var newClipCount = this.ui.$cliplist.find('li').length;
      if ( newClipCount == 1 ) { this.turnOnFirstClip(pageClip, playNow); }
    },

    turnOnFirstClip: function (pageClip, playNow) {
      if ( playNow === false ) { this.turnOnButDontPlay(pageClip); }
      else { this.playClip(pageClip); }
    },

    turnOnButDontPlay: function(pageClip) {
      this.turnOnQueueItem(pageClip);
      pageClip.$queueItem.addClass('stopped');

    },

    triggerClipFromPlaylist: function (pageClip, event) {
      var $clip = pageClip.$queueItem
      var stopClip = $clip.hasClass('active') && !$clip.hasClass('stopped')
      if ( stopClip ) { this.stopClip(pageClip); }
      else { this.playClip(pageClip); }
    },

    playClip: function(pageClip) {
      this.turnOnQueueItem(pageClip);
      this.insertYoutubePlayer(pageClip);
      var _this = this;
      setTimeout(function() { _this.closeSettingsPanel(); }, 900);
    },

    turnOnQueueItem: function(pageClip, isStopped) {
      if ( this.session.activeClip ) { this.stopClip(); }
      this.session.activeClip = pageClip;
      this.ui.$cliplist.find('.active').removeClass('active stopped');
      this.session.activeClip.$queueItem.addClass('active');
      this.checkIfNeedToScroll();
      this.setNavStates();
    },

    insertYoutubePlayer: function (pageClip) {
      $('<div/>', { id:'fbqPlayer'}).appendTo(this.ui.$playerContainer);

      var _this = this;
      new YT.Player('fbqPlayer', {
        videoId: pageClip.code,
        playerVars: { 'autoplay': 1, 'origin':'https://www.youtube.com' },
        events: {
          'onStateChange': function(event) { _this.onVideoPlayerChange(event); }
        }
      });
    },

    onVideoPlayerChange: function (event) {
      if (event.data === 0) { this.goToNextClip(); }
    },

    stopClip: function () {
      this.session.activeClip.$queueItem.addClass('stopped');
      this.setNavStates();
      // @refactor - now that we have the YT player object,
      // we can change this to pause (dont' remove the video)
      this.ui.$playerContainer.html('');
    },

    resetActiveClipStateWhenRemoved: function(pageClip) {
      var clipIsNotTheOnlyOne = this.ui.$cliplist.find('li').length > 1;
      if ( clipIsNotTheOnlyOne ) { this.forceJumpToNextClip(pageClip); }
      else { this.stopClip(); }
    },

    forceJumpToNextClip: function (pageClip) {
      var $nextClip = pageClip.$queueItem.next();
      var $newClip = $nextClip.length ? $nextClip : this.ui.$cliplist.find('li:first');
      var newClip = $newClip.data('pageClip');
      this.playClip(newClip);

      // little code smell here. activate clip both marks it selected and turns it on
      // if player was stopped, we just want to mark it as selected,
      // so this reverts the on off state (while keeping it selected)
      // need to separate responsibilities
      var wasStopped = pageClip.$queueItem.hasClass('stopped');
      if ( wasStopped ) { this.stopClip(newClip); }
    },

    checkIfNeedToScroll: function() {
      // @refactor - not sure why, but when on first element
      // .position() returns a weird large number.
      // band-aid until can figure out why that happens
      if ( this.ui.$cliplist.find('li').length == 1 ) { return; }

      var listHeight = this.ui.$cliplist.outerHeight();
      var activeItemOffset = this.session.activeClip.$queueItem.position().top;
      var clipHeight = this.session.activeClip.$queueItem.outerHeight();
      var overscrollOffset = activeItemOffset + clipHeight - listHeight;

      if ( overscrollOffset > 0 ) { this.scrollToView(overscrollOffset); }
      if ( activeItemOffset < 0 ) { this.scrollToView(activeItemOffset); }
    },

    scrollToView: function (offset) {
      this.ui.$cliplist.animate({ scrollTop: "+=" + offset }, 150);
    },


    // -- PLAYLIST NAVIGATION -------------------- //
    goToPrevClip: function () {
      var $prevClip = this.ui.$cliplist.find('.active').prev();
      this.setPrevNextClipIfExists($prevClip);
    },

    goToNextClip: function () {
      var $nextClip = this.ui.$cliplist.find('.active').next();
      this.setPrevNextClipIfExists($nextClip);
    },

    setPrevNextClipIfExists: function ($clip) {
      if ( $clip.length ) { this.playClip($clip.data('pageClip')); }
    },

    setNavStates: function () {
      // @refactor - using this.session.activeClip returns null on first query
      var $activeQueueItem = this.ui.$cliplist.find('.active');
      var backDisabledState = true;
      var nextDisabledState = true;

      if ( $activeQueueItem.length ) {
        backDisabledState = $activeQueueItem.prev('li').length ? false : true;
        nextDisabledState = $activeQueueItem.next('li').length ? false : true;
      }

      this.ui.$backButton.prop('disabled', backDisabledState);
      this.ui.$nextButton.prop('disabled', nextDisabledState);
    },

    onKeyPress: function (event) {
      if ( !$(event.target).is('body') ) { return false; }
      switch ( event.keyCode ) {
        case 37: this.goToPrevClip(); break;
        case 39: this.goToNextClip(); break;
      }
    },


    // -- SETTINGS STUFF ------------------------ //
    bindSavedSettingsToViewControls: function () {
      this.bindResizeInputs();
      var $autoQueueCheckbox = this.$el.find('.auto-queue-control input:checkbox');
      $autoQueueCheckbox.prop('checked', this.user.autoQueueAll);
    },

    bindResizeInputs: function () {
      var resizeToggleMatcher = '[data-set-view-mode="' + this.user.viewMode + '"]';
      this.$el.find(resizeToggleMatcher).find('input:radio').prop('checked', true);
    },

    triggerResize: function ($trigger) {
      var resizeType = $trigger.attr('data-set-view-mode');
      if ( this.user.viewMode === resizeType ) { return; }
      this.setViewMode(resizeType);
      this.$el.attr('data-settings-open', false);
    },

    maximize: function () {
      this.setViewMode('maximized');
      this.bindResizeInputs();
    },

    setViewMode: function(resizeType) {
      this.saveSettings('viewMode', resizeType);
      this.$el.attr('data-view-mode', this.user.viewMode);
    },

    toggleAutoQueueFromCheckbox: function ($trigger) {
      isChecked = $trigger.prop('checked');
      this.saveSettings('autoQueueAll', isChecked);
      if ( isChecked ) { this.ui.$refreshMessage.fadeIn(); }
    },

    setAutoQueue: function (state) {
      this.saveSettings('autoQueueAll', state);
      var $autoQueueCheckbox = this.$el.find('.auto-queue-control input:checkbox');
      $autoQueueCheckbox.prop('checked', this.user.autoQueueAll);
    },

    refreshPage: function ($trigger, event) {
      event.preventDefault();
      window.location.reload();
    },

    openSettingsPanel: function () {
      this.$el.attr('data-settings-open', true);
    },

    closeSettingsPanel: function () {
      this.$el.attr('data-settings-open', false);
    },

    loadSavedSettings: function () {
      var _this = this;
      chrome.storage.sync.get("project", function(obj) {
        if ( obj.project ) { $.extend(true, _this.user, obj.project); }
      });
    },

    saveSettings: function (prop, value) {
      settingPassedIn = arguments.length === 2
      if ( settingPassedIn ) { this.user[prop] = value; }
      chrome.storage.sync.set({'project': this.user });
    },


    // -- UTILITIES ------------------------ //
    bindElements: function () {
      var _this = this;
      $.each(this.ui, function(key,value) {
        _this.ui[key] = _this.$el.find(value);
      })
    },

    bindEvents: function () {
      var _this = this;
      $.each(this.events, function(index, binding) {
        _this.$el.find(binding[1]).on(binding[0], function(event) {
          _this[binding[2]]($(this), event);
        });
      });
    }
  };

  return FBQueuer;
})();

window.fbqueuer = new window.FBQueuer();
