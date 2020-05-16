$.BackdropSlideshow = function($el, settings) {
  this.$el = $el;
  this.settings = settings;
  return this.init();
};

$.BackdropSlideshow.prototype = {
  interval: null,
  events: [
    ['mouseenter', '', 'stopCycling'],
    ['mouseleave', '', 'autoCycle'],
    ['click', '.ss_navlinks span', 'checkIfOkToActivate'],
    ['click', '.ss_step.back', 'goBack'],
    ['click', '.ss_step.next', 'goNext'],
    ['click', '.ss_images_wrap', 'openImgInNewWindow']
  ],
  init: function() {
    this.ui = {
      $contentWrap: this.$el.find(this.settings.selector_contentWrap),
      $contentSlides: this.$el.find(this.settings.selector_contentSlide),
      $imageWrap: this.$el.find(this.settings.selector_imageWrap),
      $imageSlides: this.$el.find(this.settings.selector_imageWrap + ' img')
    };
    this.session = {
      totalSlides: this.ui.$imageSlides.length,
      currentSlideIndex: 0
    };
    this.bindEvents(this.$el, this.events);
    this.setupNavOptions();
    this.initializeImages();
    return this.startSlideshow();
  },
  startSlideshow: function() {
    this.changeSlide(0);
    if (this.settings.autoCycle) {
      return this.autoCycle();
    }
  },
  initializeImages: function() {
    setTimeout(((function(_this) {
      return function() {
        return _this.setImagesSizeAttr();
      };
    })(this)), 200);
    return $(window).on('resize', (function(_this) {
      return function() {
        return _this.setImagesSizeAttr();
      };
    })(this));
  },
  setImagesSizeAttr: function() {
    this.outerHeight = this.ui.$imageWrap.outerHeight(true);
    return this.ui.$imageSlides.each((function(_this) {
      return function(index, image) {
        return _this.setImageSizeAttr($(image));
      };
    })(this));
  },
  setImageSizeAttr: function($image) {
    var imageHeight;
    imageHeight = $image.outerHeight();
    return $image.attr('data-size', this.getImageSizeAttr(imageHeight));
  },
  getImageSizeAttr: function(imageHeight) {
    if (imageHeight > this.outerHeight) {
      return 'bigger';
    }
    if (imageHeight < this.outerHeight) {
      return 'smaller';
    }
  },
  setupNavOptions: function() {
    if (this.settings.addStepNav) {
      this.addStepLinks();
    }
    if (this.settings.addIndexNav) {
      return this.buildIndexLinksContainer();
    }
  },
  addStepLinks: function() {
    this.addStepLink('&lsaquo;', this.settings.class_backlink);
    return this.addStepLink('&rsaquo;', this.settings.class_nextlink);
  },
  addStepLink: function(html, className) {
    return $('<span/>', {
      'html': html,
      'class': className
    }).appendTo(this.$el);
  },
  buildIndexLinksContainer: function() {
    var $navlinkWrap;
    $navlinkWrap = $('<div/>', {
      'class': this.settings.class_navlinkWrap
    });
    this.buildIndexLinks($navlinkWrap);
    this.$el.append($navlinkWrap);
    return this.$indexlinks = $navlinkWrap.find('span');
  },
  buildIndexLinks: function($container) {
    return this.ui.$imageSlides.each((function(_this) {
      return function(index, item) {
        return $container.append(_this.buildIndexLink(index));
      };
    })(this));
  },
  buildIndexLink: function(index) {
    var $navlink;
    $navlink = $('<span/>', {
      html: index + 1
    });
    if (index === 0) {
      $navlink.addClass(this.settings.class_on);
    }
    return $navlink;
  },
  checkIfOkToActivate: function($clicked) {
    var okToActivate;
    okToActivate = !$clicked.hasClass(this.settings.class_on);
    if (okToActivate) {
      return this.activateFromLink($clicked);
    }
  },
  activateFromLink: function($link) {
    var linkIndex;
    linkIndex = this.$indexlinks.index($link);
    return this.changeSlide(linkIndex);
  },
  autoCycle: function() {
    return this.interval = setInterval(((function(_this) {
      return function() {
        return _this.goNext();
      };
    })(this)), this.settings.delay);
  },
  stopCycling: function() {
    return clearInterval(this.interval);
  },
  goBack: function(event) {
    var isFirst, manualChange, prevSlideIndex;
    isFirst = this.session.currentSlideIndex === 0;
    prevSlideIndex = isFirst ? this.session.totalSlides - 1 : this.session.currentSlideIndex - 1;
    manualChange = !!event;
    return this.changeSlide(prevSlideIndex, true);
  },
  goNext: function(event) {
    var isLast, manualChange, nextSlideIndex;
    isLast = this.session.currentSlideIndex + 1 === this.session.totalSlides;
    nextSlideIndex = isLast ? 0 : this.session.currentSlideIndex + 1;
    manualChange = !!event;
    return this.changeSlide(nextSlideIndex, manualChange);
  },
  changeSlide: function(newSlideIndex, manualChange) {
    manualChange = manualChange || null;
    this.hideCurrentSlides(manualChange);
    this.showNextSlides(newSlideIndex, manualChange);
    return this.session.currentSlideIndex = newSlideIndex;
  },
  showNextSlides: function(newSlide, manualChange) {
    var $nextElements;
    $nextElements = this.ui.$contentSlides.eq(newSlide).add(this.ui.$imageSlides.eq(newSlide));
    if (manualChange) {
      $nextElements.show();
    } else {
      $nextElements.fadeIn(this.settings.fadeInSpeed);
    }
    if (this.$indexlinks) {
      return this.$indexlinks.eq(newSlide).addClass(this.settings.class_on);
    }
  },
  hideCurrentSlides: function(manualChange) {
    var $contentSlide, $currentElements;
    $contentSlide = this.ui.$contentWrap.find(this.settings.selector_contentSlide).filter(':visible');
    $currentElements = this.ui.$imageWrap.find('img:visible').add($contentSlide);
    if (manualChange) {
      $currentElements.hide();
    } else {
      $currentElements.fadeOut(this.settings.fadeOutSpeed);
    }
    if (this.$indexlinks) {
      return this.$indexlinks.removeClass(this.settings.class_on);
    }
  },
  openImgInNewWindow: function($trigger, event) {
    var currentImage;
    currentImage = $trigger.find('img:visible').attr('src');
    return window.open(currentImage, '_blank');
  },
  bindEvents: function($scope, eventBindings) {
    return $.each(eventBindings, (function(_this) {
      return function(index, binding) {
        return $scope.on(binding[0], binding[1], function(event) {
          return _this[binding[2]]($(event.currentTarget), event);
        });
      };
    })(this));
  }
};

$.fn.backdropSlideshow = function(options) {
  var settings;
  settings = {
    autoCycle: true,
    addStepNav: false,
    addIndexNav: false,
    fadeOutSpeed: 100,
    fadeInSpeed: 900,
    delay: 5000,
    class_on: 'on',
    class_last: 'last',
    class_backlink: 'ss_step back',
    class_nextlink: 'ss_step next',
    class_navlinkWrap: 'ss_navlinks clr',
    selector_imageWrap: '.ss_images',
    selector_contentWrap: '.ss_contentSlides',
    selector_contentSlide: 'li'
  };
  return this.each(function() {
    var instance;
    if (options) {
      $.extend(settings, options);
    }
    return instance = new $.BackdropSlideshow($(this), settings);
  });
};

// ---
// generated by coffee-script 1.9.0