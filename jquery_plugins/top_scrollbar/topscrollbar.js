/*****************************************************************************************
**  Topscroller Plugin - adds top horizontal scroller if lower is created but not on screen
**  Written By Kirin Murphy and Charlie Jackson
**  inspired from code sample written here - //http://jsfiddle.net/TBnqw/1/  
********************************************************************************************/

(function($) {
	
	$.IfYouAbsolutelyHaveToUseAHorizontalScrollbar = function($parent,settings) {
		
		this.settings = settings;
        this.$parent = $parent;
		
		// define contentWrap, if settings.contentWrap null default to child div
		this.$contentWrap = ( this.settings.contentWrap === null ) 
			? this.$parent.children('div').eq(0) : this.settings.contentWrap; 
		
		this.$target = this.$contentWrap;
		
		// build topscroll elements
		this.$topScrollInner = $('<div/>').attr('class',this.settings.topScrollOverflowedElement)
			.css('height','10px');
		
		this.$topScroll = $('<div/>').attr('class',this.settings.class_topScroll)
			.css({  
				'overflow-x':'auto', 
				'overflow-y':'hidden', 
				'height':'20px', 
				'width':'100%' 
			})
			.hide()
			.append(this.$topScrollInner)
			.prependTo(this.$parent);

		// configure scroller 
		this.checkScroller();
		
		if ( this.settings.initCallback !== undefined && this.settings.initCallback !== null ) {
			this.settings.initCallback();

			// resets topscrollInner height to child height if something was added to topscrollInner on callback
			var topScrollChildHeight = this.$topScrollInner.children().outerHeight(true);
			var topScrollInnerHeightCSS = topScrollChildHeight > 15 ? topScrollChildHeight : 15;
			this.$topScrollInner.css('height', topScrollInnerHeightCSS + 'px' )
			
			this.checkScroller();

		}

		// if we want to magnetize and plugin exists, run plugin
		if ( this.settings.magnetize === true && jQuery().magnetize ) { 
			this.$target.magnetize({ magnetSelector: this.$topScroll });
		}
	};

	$.IfYouAbsolutelyHaveToUseAHorizontalScrollbar.prototype = {
		checkScroller : function() {

			// reacquire the target since it could have been changed since the last call
			this.$target = this.$contentWrap;

			// if target doesn't exist exit out of function
			if (!this.$target || this.$target.length == 0) { return };

			// get overflowed element of target, must be only element inside of target
			var $overflowedElement = this.$target.children().eq(0);
			
			// get width of elements
			var overflowedWidth = parseInt($overflowedElement.outerWidth(true));
			var maxWidth = parseInt(this.$target.width());

			// set width of topscroll inner element
			this.$topScrollInner.css('width', overflowedWidth + 'px');

			// get height properties
			var windowHeight = $(window).height();
			var overflowedHeight = 
				parseInt($overflowedElement.outerHeight(true)) + 
				parseInt(this.$topScroll.outerHeight(true)) + 
				this.$target.offset().top - 
				$(window).scrollTop();

			// set scroll conditions
			if ( this.settings.hideTopIfBottomVisible === true ) {
				if (overflowedWidth > maxWidth && overflowedHeight > windowHeight) {
					this.moveScrollers();
					this.topScroll.css('overflow-x','auto')
				} else {
					this.$topScroll.hide();
				}
			} else {
				if ( overflowedWidth > maxWidth ) {
					this.moveScrollers();
					if ( overflowedHeight > windowHeight ) { this.$topScroll.css('overflow-x','auto'); }
					else { this.$topScroll.css('overflow-x','hidden') };
				} else {
					this.$topScroll.hide();
				}
			} 

			//$('.topscroller_wrap').unbind('magnetize').magnetize({ 'magnetinnerclass': '.topscroller' });
		},
		moveScrollers : function(){
			this.$topScroll.show().scrollLeft(this.$target.scrollLeft());

			var moveTheSecondWhenTheFirstIsScrolled = function($scroller, $mover) {
				$scroller.scroll(function() { $mover.scrollLeft($scroller.scrollLeft()) });
			};

			moveTheSecondWhenTheFirstIsScrolled(this.$target, this.$topScroll);
			moveTheSecondWhenTheFirstIsScrolled(this.$topScroll, this.$target);				
		}
	}

    $.fn.addTopScrollbar = function(options) {

        var settings = {

			// config
			hideTopIfBottomVisible: false,
			magnetize : true,
			initCallback : null,

			// selectors
            contentWrap: null, 
            class_topScroll: 'topscroller',
            topScrollOverflowedElement: 'topscrollinner'

        };

        return this.each(function() {

	        if (options) { $.extend(settings, options) }
	
			var $this = $(this);

            if ( $this.data('topScrollOn') !== true ) {
                var newScroller = new $.IfYouAbsolutelyHaveToUseAHorizontalScrollbar($this, settings);
                $this.data('topScrollOn', true);
				$(window).resize(function(){ newScroller.checkScroller(); });
				$(window).scroll(function(){ newScroller.checkScroller(); });
            }
        });
    }

})(jQuery);

