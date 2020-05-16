window.PageClip = (function() {
  function PageClip($link) { this.init($link); };

  PageClip.prototype = {
    isQueued: false,

    possibleURLBeforeStrings: [
      'watch%3Fv%3D',
      'watch?v=',
      'tu.be%2F',
      'tu.be/',
      'watch%253Fv%253D',
      'tube.com%2Fattribution_link%3Fa%3D',
      'tube.com/attribution_links?a='
    ],

    init: function($link) {

      this.$link = $link;
      this.href = this.$link.attr('href');

      this.$post = this.$link.closest('._6m2');
      this.$post = this.$post.length ? this.$post :
        this.$link.closest('.UFIComment.UFIComponent')

      this.addQueueControl();
    },

    addQueueControl: function () {
      var _this = this;

      this.$playTrigger = $('<button/>', {
        'class':'play-trigger', html: '&#x25b6;'
      });

      this.$queueTrigger = $('<button/>', {
        'class':'queue-trigger', html: '&#x2b;'
      });

      this.$alreadyQueuedMessage = $('<div/>', {
        'class':'already-queued', text: 'QUEUED'
      }).hide();

      this.$queueControl = $('<div/>', { 'class':'queue-control' })
        .append(this.$playTrigger)
        .append(this.$queueTrigger)
        .append(this.$alreadyQueuedMessage)
        .insertAfter(this.$link);
    },

    buildQueueItem: function () {
      var _this = this;

      this.disableQueueButtons();
      this.populateLinkAttributes();

      this.$queueLink = $('<a/>', { 'class':'play-video',
        href:this.cleanHref, text:this.title
      });

      this.$jumpToPost = $('<span/>', { 'class':'jump-to-post' })
        .on('click', function() { _this.jumpToPost(); });

      this.$removeLink = $('<span/>', { 'class':'remove-clip' });

      this.$actions = $('<div/>', { 'class':'actions' })
        .append(this.$jumpToPost)
        .append(this.$removeLink);

      this.$queueItem = $('<li/>')
        .data('pageClip', this)
        .append(this.$queueLink)
        .append(this.$actions);

      return this.$queueItem;
    },

    jumpToPost: function () {
      var hasStickyHeader = $('body').find('.stickyHeaderWrap').length
      var dynamicSpace = hasStickyHeader ? 100 : 55;
      var postOffset = this.$post.offset().top - dynamicSpace;
      $('body').animate({ scrollTop: postOffset }, 300);
    },

    disableQueueButtons: function() {
      this.$queueControl.find('button').hide();
      this.$alreadyQueuedMessage.show();
    },

    enableQueueButtons: function() {
      this.$queueControl.find('button').show();
      this.$alreadyQueuedMessage.hide();
    },

    populateLinkAttributes: function () {
      this.code = this.getYoutubeCode(this.href);
      this.cleanHref = 'https://www.youtube.com/watch?v=' + this.code;
      this.title = this.$post.find('._6m6 a').text();
    },

    getYoutubeCode: function () {
      for (var i=0, l=this.possibleURLBeforeStrings.length; i<l; i++) {
        var endString = this.href.split(this.possibleURLBeforeStrings[i])[1];
        if (endString) {
          var youtubeCode = endString.split('&')[0].split('%')[0];
          return (youtubeCode || 'no_code');
        }
      }
    },

    unQueue: function() {
      this.enableQueueButtons();
      this.isQueued = false;
    },

    tearDownQueueableLink: function () {
      if ( this.isQueued ) { this.$jumpToPost.remove(); }
    }
  };

  return PageClip;
})();
