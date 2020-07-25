window.PageClip = (function() {
  function PageClip($link, title) { this.init($link, title); };

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

    init: function($link, title) {

      this.$link = $link;
      this.title = title;

      this.href = this.$link.attr('href');

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

      this.isCommentClip = !!this.$link.find('[data-html2canvas-ignore="true"]').length;

      var commentClipClass = this.isCommentClip ? 'comment-clip' : '';

      this.$queueControl = $('<div/>', { 'class':'queue-control ' + commentClipClass })
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
      var headerHeight = 120;
      var vidHeight = this.isCommentClip ? 60 : 260;
      var postOffset = this.$link.offset().top - headerHeight - vidHeight;
      window.scrollTo(0, postOffset);
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
