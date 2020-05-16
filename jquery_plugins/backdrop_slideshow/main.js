



$.BackdropSlideshow = function($target, settings) {  

	this.container = $target;
	this.settings = settings;

	this.init();  
};

$.BackdropSlideshow.prototype = {

    init: function() {  

		var _this = this;
			
		// image elements
		this.imageWrap = this.container.find(this.settings.imageWrap);
		this.images = this.imageWrap.find('img');
		this.imageQty = this.images.length;

		// content elements
		this.rotatingcontentWrap = this.container.find(this.settings.rotatingcontentWrap);
		this.rotatingcontent = this.rotatingcontentWrap.find(this.settings.contentItemWrap);
		this.rotatingcontentQty = this.rotatingcontent.length;
		
		this.slideIndex = 1;

		/* -- run -- */
		this.images.eq(0).show();
		this.rotatingcontent.eq(0).show();

		// clear timeout @fix - why are we doing this here? 
		clearTimeout(this.timer); 
		
		this.buildNavLinks();

		// mouseover and mouseleave stop and restart the autoCycle 
		this.container
			.mouseover(function() { 	clearTimeout(_this.timer); 	})
			.mouseleave(function() {
				_this.timer = setTimeout(function() {  _this.goNext();  }, _this.settings.delay)
			});
    },
	buildNavLinks : function() {
		
		var _this = this;
		
		this.$navlinkWrap = $('<div/>').addClass('ss_navlinks clr')
		
		// create nav button for each slide
		for ( var i = 0; i < this.imageQty; i++ ) { 
			var $navlink = $('<a/>',{ html : i+1, href : '#' });
			
			// set first slide to on
			if ( i === 0 ) { $navlink.addClass(this.settings.class_on); };

			// set last slide class so we know when we're at the end
			if ( i + 1 === this.imageQty ) {  $navlink.addClass(this.settings.class_next)  }
			
			$navlink.appendTo(this.$navlinkWrap);
		}
		
		// add navlink to container and bind click event 
		this.$navlinkWrap.click(function(event) {
		
			var $wrap = $(this);
			var $clicked = $(event.target);
		
			// if clicked item is not currently on, change slide to associated link
			if ( $clicked.is('a') && !$clicked.hasClass(_this.settings.class_on)  ) {  
				var linkEq = $wrap.find('a').index($clicked);
				var activeImageEq = _this.images.index(_this.imageWrap.find('img:visible')  )
				_this.changeSlide(linkEq, linkEq + 1);
			}
			return false;
		})
		.appendTo(this.container);
	
		// if autoCycle is set to true, run method
		if ( this.settings.autoCycle === true ) { this.autoCycle(); }
	
	},
	autoCycle : function() {
		var _this = this;
		this.timer = setTimeout(function() {  _this.goNext();  }, _this.settings.delay)
	},
	changeSlide : function(nextSlide, changeIndexTo) {

		// change image
		this.imageWrap.find('img:visible')
			.add( this.rotatingcontentWrap.find(this.settings.contentItemWrap + ':visible')  ) 
			.fadeOut(this.settings.fadeOutSpeed);
			
		// change content panel
		this.rotatingcontent.eq(nextSlide)
			.add(this.images.eq(nextSlide))
			.stop(true,true).fadeIn(this.settings.fadeInSpeed);
		
		// remove on class for existing nav button and add it to new one
		this.$navlinkWrap.find('.' + this.settings.class_on).removeClass(this.settings.class_on);
		this.$navlinkWrap.find('a').eq(nextSlide).addClass(this.settings.class_on);

		// change current slide index
		this.slideIndex = changeIndexTo;
		
	},
	goNext : function() {
		
		// determines if next slide is available or we are at the end of the list and have to start back at 0
		var isNotLast = ( this.slideIndex !== this.imageQty )  ? true : false; 
		var nextSlide = ( isNotLast === true ) ? this.slideIndex : 0;
		var changeIndexTo = ( isNotLast === true ) ? this.slideIndex + 1  : 1;
		
		this.changeSlide(nextSlide, changeIndexTo); 
		
		if ( this.settings.autoCycle === true ) {  this.autoCycle();  }
	}	
};

$.fn.backdropSlideshow = function(options) {

	var settings = { 

		autoCycle: true,
		fadeOutSpeed : 100,
		fadeInSpeed : 900,
		delay: 5000,
		
		class_on: 'on',
		class_last: 'last',
		
		imageWrap : '.ss_images',
		rotatingcontentWrap: '.ss_rotatingcontent',
		navlinkWrap: '.ss_navlinks',
		contentItemWrap : 'li'
	}
	
    return this.each(function() {
					   
		if (options) { $.extend(settings,options) };
		var backdropslideshow = new $.BackdropSlideshow($(this), settings);
    });

};






