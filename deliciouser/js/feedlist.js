(function (window,google,$,ko) {

$.FeedList = function (options) {

  this.settings = {
    // required
    feedURL: null,
    feedCount: null,
    // optional
    feedUser: null,
    feedTags: null
  };

  // validate required fields
  if ( window.console ) {
    if (!options.feedURL) { console.error('You need to load a feedURL guy!'); return false; }
    if (!options.feedCount) { console.error('How many stuff you wanna load?'); return false; }
  }

  if ( options ) { $.extend(true,this.settings,options); }

  // -- SETTINGS ------------------------------- //
  this.initLoad = ko.observable(true);
  this.loading = ko.observable(true);
  this.articles = ko.observableArray();
  this.currentDate = null;

  this.initFilter();
  this.initUser();
  this.initFeed();
};

$.FeedList.prototype = {
  initFilter: function () {
    this.tags = ko.observableArray();
    this.tagIndex = {};
    this.sortOrderType = ko.observable("content");

    this.filterInput = ko.observable(this.settings.feedTag);
    this.isTyping = ko.observable(false);
    this.filtering = ko.observable(false);
    this.currentFilterValue = ko.observable(this.settings.feedTag);
    this.currentHilightIndex = 0;
    this.currentHilightedTag = ko.observable(null);
    this.matchedTags = ko.observable();
    this.displayedTagOptions = [];

    // @refactor - not prototype methods bc of argument from template, knockout solution?
    var _this = this;
    this.filterFromTagList = function (item) { _this.filterByTag(item.staticTag.title); };
    this.filterFromItemTag = function (tag) { _this.filterByTag(tag); };

    this.sortOrderType.subscribe(function (value) {
      _this.sortTags();
      _this.openFullList();
    });
  },

  initUser: function () {
    var _this = this;
    var savedUserName = window.localStorage[this.settings.localStorageKey.userName]
    var initFeedUser = savedUserName || this.settings.feedUser;
    this.feedUser = ko.observable(initFeedUser);
    this.feedUser.subscribe(function(){ _this.changeUser(); });
  },

  initFeed: function () {
    var _this = this;
    google.setOnLoadCallback(function() {
      _this.getTags();
      _this.getFeed(_this.settings.feedTag);
    });
  },

  getTags : function() {
    var _this = this;
    KM_utils.callGoogleAPI({
      feedURL: this.createTagUrl(),
      quantity: this.settings.tagListCount,
      successCallback: function (result) {
        _this.rawTagItems = result.feed.entries;
        _this.sortTags();
      }
    });
  },

  createTagUrl: function () {
    var feedURL = this.settings.feedURL + 'tags/';
    if ( this.feedUser() ) { feedURL += this.feedUser(); }
    return feedURL += "?count=" + this.settings.tagListCount;
  },

  sortTags : function() {
    var _this = this;
    this.tags.removeAll();
    this.rawTagItems.sort(function(a,b){ return _this.tagSortTest(a,b); });
    $.each(_this.rawTagItems,function(index,tag) { _this.pushNewTag(tag); });
  },

  tagSortTest: function (a, b) {
    a = a[this.sortOrderType()];
    b = b[this.sortOrderType()];
    if ( isNaN(a) || isNaN(b) ) { return this.sortByString(a, b); }
    else { return b - a; }
  },

  sortByString: function (a, b) {
    a = a.toLowerCase();
    b = b.toLowerCase();
    return a < b ? -1 : ( a > b ? 1 : 0 ); // +, - or 0
  },

  pushNewTag: function (tag) {
    var menuTag = new $.MenuTag(tag);
    this.tagIndex[tag.title] = tag.content;
    this.tags.push(menuTag);
  },

  getFeed: function (tag) {
    window.scroll(0,0);
    this.loading(true);
    this.currentFilterValue(tag);

    var _this = this;
    KM_utils.callGoogleAPI({
      feedURL: this.createFeedUrl(tag),
      quantity: this.settings.feedCount,
      successCallback: function (result) {
        _this.onFeedLoadSuccess(result.feed.entries);
      }
    });
  },

  createFeedUrl: function (tag) {
    var feedURL = this.settings.feedURL;
    if ( this.feedUser() ) { feedURL += this.feedUser(); }
    if ( tag ) { feedURL += '/' + tag; }
    return feedURL += '?count=' + this.settings.feedCount;
  },

  onFeedLoadSuccess: function (entries) {
    this.loading(false);
    this.initLoad(false);
    if ( this.currentHilightedTag() ) { this.resetCurrentTag(); }
    var _this = this;
    $.each(entries, function(index,article) { _this.pushNewEntry(article); });
  },

  resetCurrentTag: function () {
    this.currentHilightedTag().isHilighted(false);
    this.currentHilightedTag(null);
  },

  pushNewEntry: function (article) {
    var newArticle = new $.Article({ article: article, tagIndex: this.tagIndex });
    this.checkIfNewMonth(newArticle);
    this.articles.push(newArticle);
  },

  checkIfNewMonth: function(newArticle) {
    newArticle.isNewDate = ko.observable();
    isNewDate = !this.currentDate || this.currentDate !== newArticle.date
    newArticle.isNewDate(isNewDate)
    if ( isNewDate ) { this.currentDate = newArticle.date; }
  },

  resetFeed : function () {
    this.filterInput("");
    this.filtering(false);
    this.articles.removeAll();
    this.currentHilightedTag(null);
    this.getFeed();
  },

  filterByTag : function(tag) {
    this.isTyping(false);
    this.articles.removeAll();
    this.getFeed(tag);
    this.filterInput(tag);
    this.filtering(tag !== "");
  },


  // KEY PRESS EVENTS
  // *************************************************************
  keyPress: function (value, event) {
    // set so dropdown will open, otherwise clicking item tag will open it
    this.isTyping(true);
    this.keypressValue = value;
    var pressed = event.keyCode;

    if ( this.isEnterOrTab(pressed) ) { this.keypressEnterAndTab(); }

    else if ( this.escapedWhileFiltering(pressed) ) { this.resetFeed(); }

    else if ( this.movingDownTagList(pressed) ) { this.moveDownTagList(); }

    else if ( this.movingUpTagList(pressed) ) { this.moveIt({ direction:'up' }); }

    else if ( this.openingTagListWithDownArrow(pressed) ) { this.openFullList(); }

    else {  this.pressAnyCharacterKey(); }
  },

  // -- KEYPRESS CONDITIONALS -- //
  isEnterOrTab: function (pressed) {
    return pressed === 9 || pressed === 13;
  },

  escapedWhileFiltering: function (pressed) {
    return pressed === 27 && this.filtering;
  },

  movingDownTagList: function (pressed) {
    return pressed === 40 && this.currentHilightedTag();
  },

  movingUpTagList: function (pressed) {
    onNotFirstTag = this.currentHilightedTag() && this.currentHilightIndex > 0;
    return pressed === 38 && onNotFirstTag;
  },

  openingTagListWithDownArrow: function (pressed) {
    return pressed === 40 && this.filterInput().length === 0
  },

  // -- KEYPRESS CALLBACKS -- //
  keypressEnterAndTab: function () {
    if ( this.matchedTags() > 0 ) {
      var currentTagTitle = this.currentHilightedTag().staticTag.title
      this.filterByTag(currentTagTitle);
    } // @TODO - add UI response for else condition
  },

  moveDownTagList: function () {
    var stillMoreTags = this.displayedTagOptions.length - 1 > this.currentHilightIndex
    if ( stillMoreTags ) { this.moveIt({ direction:'down' }); }
  },

  openFullList: function () {
    // @refactor - already declared when this fired from keyPress fn,
    // but needed when clicking on arrow
    this.isTyping(true);
    this.displayedTagOptions = [];
    console.log('bbb', this.filterInput())
    // @fix - we set this here instead of by default because matchedTags(0)
    // will set error state on input box can probably do it cleaner
    this.matchedTags(0);

    var _this = this;
    $.each(this.tags(), function (index,tag) { _this.displayTag(tag); });
  },

  pressAnyCharacterKey: function () {
    var _this = this;

    this.currentHilightIndex = 0;
    this.matchedTags(0);
    this.displayedTagOptions = [];

    var characters = this.filterInput().length;
    var regExpValue = new RegExp(this.filterInput(),"gi");

    // loop through the tags to see if we should display each one
    $.each(this.tags(), function (index,tag) {
      _this.checkToDisplayTag(tag, characters, regExpValue);
    });

    $.each(this.articles(), function(index,article) {
      _this.checkToDisplayArticle(article, regExpValue);
    });

    // hide dropdown if there are no matched tags
    // @fix - isTyping is not the right semantic thing to change bc user is still typing
    // need to change this so method name is more accurate
    if ( this.matchedTags() === 0 ) { this.isTyping(false); }

    return true;
  },

  checkToDisplayArticle: function (article, regExpValue) {
    var articleText = KM_utils.trim(article.staticArticle.title);
    var itsAMatch = articleText.match(regExpValue) !== null;
    var showArticle =  itsAMatch || this.keypressValue === "";
    article.isDisplayed(showArticle);
  },

  checkToDisplayTag: function (tag, characters, regExpValue) {
    var tagText = KM_utils.trim(tag.staticTag.title);
    var matchableCharacters = tagText.slice(0,characters);
    var itsAMatch = matchableCharacters.match(regExpValue) !== null
    var showTag = itsAMatch || this.keypressValue === "";
    if ( showTag ) { this.displayTag(tag); }
    else { tag.isDisplayed(false); tag.isHilighted(false);  }
  },

  displayTag: function (tag) {
    this.displayedTagOptions.push(tag);
    this.matchedTags(this.matchedTags() + 1);
    tag.isDisplayed(true);
    if ( this.matchedTags() === 1 ) { this.setNewHilightedTag(tag); }
  },

  setNewHilightedTag: function (tag) {
    tag.isHilighted(true);
    this.currentHilightedTag(tag);
  },

  moveIt: function (args) {
    this.currentHilightedTag().isHilighted(false);
    adjustment = args.direction === 'down' ? 1 : -1;
    this.currentHilightIndex = this.currentHilightIndex + adjustment;
    this.activateNextTagFromMove()
  },

  activateNextTagFromMove: function (nextTag) {
    nextTag = this.displayedTagOptions[this.currentHilightIndex]
    this.setNewHilightedTag(nextTag);
    this.filterInput(nextTag.staticTag.title);
  },

  changeUser : function() {

    this.loading(true);
    this.currentFilterValue("");

    this.tags.removeAll();
    this.tagIndex = {};
    this.getTags();

    this.resetFeed();

    // set the new feed userName to the localStorage variable
    window.localStorage[this.settings.localStorageKey.userName] = this.feedUser();
  }
};

})(window,google,jQuery,ko);


