(function (window,google,$,ko) {

  // load google's feeds module
  google.load("feeds", "1");

  // utility functions
  window.KM_utils = {
    trim : function (string) {
      return string.replace(/^\s+|\s+$/g, "");
    },
    callGoogleAPI: function (args) {
      var feed = new google.feeds.Feed(args.feedURL);
      feed.setNumEntries(args.quantity);

      feed.load(function (result) {
        if (!result.error && !result.feed.blockfeed) {
          args.successCallback(result);
        } else if (window.console) {
          console.error('Unable to load URL : ' + args.feedURL);
        }
      });
    }
  };

  $.MenuTag = function (tag) {
    this.staticTag = tag;
    this.isDisplayed = ko.observable(true);
    this.isHilighted = ko.observable(false);
  };


  $.Article = function (args) {
    var _this = this;
    this.staticArticle = args.article;

    var dateArray = args.article.publishedDate.split(" ");

    this.date = dateArray[2] + " " + dateArray[3];

    // if the requesting function passes a tagIndex (object of all tag name:qty kvps)
    // sort descending item tags by highest number of tags
    if ( args.tagIndex ) {
      this.staticArticle.categories.sort(function(a,b) {

        // if values are undefined, we give them a property of one
        // @fix - this is not a perm fix, problem is that all values are not supplied in tag list
        // so may be inconsistent between item level tags and account level tags
        var x = args.tagIndex[a] || 1,
            y = args.tagIndex[b] || 1;

        return y - x;
      });
    }

    // set isDisplayed to true, may set to false if doesn't match typeahead
    this.isDisplayed = ko.observable(true);
  };
})(window,google,jQuery,ko);
