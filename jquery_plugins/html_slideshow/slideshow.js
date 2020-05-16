/* -----------------------------------------------------------------
$().buildSlideshow();
written by Kirin Murphy
www.codethings.net/projects/slideshow

ToDo:
- refactor logic for state change to mobile view
- make URL updating with pushstate configurable
- if urls change and cannot find an old link, set error message

------------------------------------------------------------------ */

(function($) {
	
	$.Slideshow = function($parent,settings) {

		// -- Persistent variables ---------------------------------------------------------------- //
		this.$parent = $parent;
		this.settings = settings;

		this.$body = $('body');

		this.$slides = $parent.find(this.settings.element_slide);
		this.slideQty = this.$slides.length;
		
		this.$menu = $('<div/>', { id:'menu' });
		this.$navDock;

		var _this = this;

		// -- Dynamic variables ------------------------------------------------------------------- //

		// set first slide as active slide by default, will be overwritten by url match or localstorage value
		// @fix - this only is done here because there is a scenario where the active slide is not set by the time it needs to be 
		this.$activeSlide = this.$slides.eq(0);

		// if settings include a table of contents, we use this variable when it gets built to reference the current chapter container
		// we use this to know what container to add each link to 
		this.$currentChapter;
		this.$currentChapterText = null;

		// if pagination or left right keys are pressed, we set a direction
		this.direction = null;

		// -- Init Events ------------------------------------------------------------------------ //

		// build a link menu for each slide
		this.$slides.each(function(index) {
			var $slide = $(this);
			_this.$menu.append( _this.buildMenuItem($slide,index) );
		});		

		// change menu section, on init we set the first menu section to display
		this.changeMenuSection();			

		// insert menu into into parent
		this.$parent.append(this.$menu);

		// if we have navDock options, create navDock and include controls
		if ( this.settings.addLeftRightButtons || this.settings.addShowHideMenuButton ) {

			this.$navDock = $('<footer>', { id:'navdock'});

			// add left and right buttons
			if ( this.settings.addLeftRightButtons === true ) {
				this.$navDock.append(_this.buildPagination());
			}

			// add show hide menu buttons
			if ( this.settings.addShowHideMenuButton === true ) {
				this.$navDock.append(this.addToggleMenuButton());
			}

			this.$parent.append(this.$navDock);
		}

		// adding keypress functionality
		this.bindLeftRightKeys();

		// set to fullscreen as default
		if ( this.settings.setToFullScreen ) {
			this.hideShowMenu();
		}



		// -- Set the active slide from URL first, if none then localstorage index, if none then the first one -- //
		// we declare a state variable for the url extension
		this.urlExtension;

		// on load, we check for the id from a url and if we find it we set the slide to that ID
		this.checkForIdFromURLAndGoToSlide({ onload:true });

		// if we did not set a urlExtension from the previous checkForIdFromURLAndGoToSlide function:
		if ( !this.urlExtension ) {

			// we check for presence of (localStorage) saved slide index from a users previous page session
			// if there is not one, we set the active slide index to 0 (the first one)
			var activeSlideIndex = localStorage[this.settings.localStorageKey] || 0;

			// get activeSlide element
			this.$activeSlide = this.$slides.eq(activeSlideIndex);


			console.log('activeSlideIndex',activeSlideIndex);

			// add activeSlide ID to the url and push URL state to history 
			this.addIdToURLAndChangeSlide(this.$activeSlide);
			this.checkForIdFromURLAndGoToSlide({ onload:true });
		}

		// -- WINDOW OBSERVER EVENTS ------------------------------------------------------------------- //
		var $window = $(window);

		// -- observer that fires when url string changes -------------------------- //
		// on popstate (back & forward button clicks) we look for the ID again from the url and go to it
		$window.on('popstate anchorchange hashchange', function(event) {
			_this.checkForIdFromURLAndGoToSlide({ onload:false });
		});

		// observer for window resize
		// @fix - antipatern thingie that uses setTimeout to avoid over processing of resize logic
		this.windowWidth;
		$window.resize(function() {
			_this.windowWidth = $window.width();
			_this.changeHideShowText(); 
		});
	};
	


	$.Slideshow.prototype = {
		addIdToURLAndChangeSlide : function($newSlide) {

			// push the current slide ID to the URL stack in the history - appends the URL with the current slideID 
			History.pushState(
				{ index: this.$slides.index($newSlide) }, null, '?' + $newSlide.attr('id')
			);

			// check if fullscreen menu exists and its visible, so we can remove it
			if ( this.checkFullScreenMenu() && this.$menu.is(':visible') ) { 

				this.$menu.hide();
				this.changeHideShowText();

				// @fix - weird scope here - dependencies
				this.$body.css('overflow-y','scroll');
			}
		},
		checkForIdFromURLAndGoToSlide: function(model) {

			// get and parse URL extension
			var url = History.getState().url;
			var urlParts = url.split("/?");
			this.urlExtension = urlParts.length > 1 ? urlParts[urlParts.length - 1] : null;


			// if we have an extension from the last URL state in the history stack 
			if ( this.urlExtension ) {
				
				// get new slide ID from the url extension and change it
				var $newSlide = $('#' + this.urlExtension);

				// if we don't have a newSlide (usually URL is no longer valid), set slide to first slide
				if ( $newSlide.length === 0 ) { $newSlide = this.$slides.eq(0); }

				this.changeSlide($newSlide);

			// if we don't have a url extension, and this is from a popstate (not onload)
			// we skip the first pushstate slide when pressing the the back button
			// because the page gets loaded and then dynamically sets the active slide
			// the first URL state in the stack has no url extension, no different than the previous back button 
			// @fix - need to validate for the presence of an id when building the items.
			} else if ( model && model.onload === false ) {  History.go(-1);  } 
		},
		changeSlide : function($newOne) {

			// if we have a current slide, hide it
			// @fix - better to run this condition on everytime to test for first time page load (with no active element)
			// or to set a default first active slide so that we don't have to run this condition everytime.

			if ( this.settings.changeType === 'horizSlide' && this.direction ) { 

				var activeSlideMovedPosition = this.direction == "next" ? "120%" : "-120%";
				var newSlideStartPosition = this.direction == "next" ? "-120%" : "120%"; 
				this.$activeSlide.animate({ "left":activeSlideMovedPosition }, function() {
					$(this).hide().css({ "left":"0" });
					$newOne.css({ "left":newSlideStartPosition}).show().animate({ "left":"0" });
					//setTimeout(function() { $newOne.fadeIn('10'); },500);
				});

			} else {
				this.$activeSlide.hide();
				$newOne.show();
			}
			

			// set active slide so we can find it later
			this.$activeSlide = $newOne; 

			// change nav link bound to new active slide
			this.$menu.find('a.' + this.settings.class_on).removeClass(this.settings.class_on);
			

			var $newLink = $newOne.data('link');
			$newLink.addClass(this.settings.class_on);

			// if the parent section is invisible, change the menu section 
			if ( !$newLink.closest('dd').is(':visible') ) {  this.changeMenuSection();  }

			// check to see if newLink is still on the page, if not move the scroll position to display the link
			// @fix - this only will work if menu is fixed position to the top of the window.  
			// how do we get offset of an ancestor
				var linkTopOffset = $newLink.offset().top;
				var menuScrollTop = this.$menu.scrollTop();
				var windowHeight = $(window).height();

				// console.log('linkTopOffset',linkTopOffset);

				if ( linkTopOffset < 0 ) {
					this.$menu.scrollTop(menuScrollTop + linkTopOffset );	
				
				} else if ( linkTopOffset > windowHeight ) {

					// console.log('windowhieght',windowHeight);
					// console.log('menuScrollTop',menuScrollTop);
					this.$menu.scrollTop(menuScrollTop + (linkTopOffset - windowHeight) + 40);
				}
			// -- End Scroll Detection ---------------------------------------------------------- //

			// set the index of the current slide to localstorage
			// when we reload the page it will auto go back to the current slide
			if ( localStorage !== undefined ) {
				localStorage[this.settings.localStorageKey] = this.$slides.index($newOne);
			}

			// change hide show menu text in case changing slide hid the menu 
			this.changeHideShowText();

			this.enableOrDisablePagination($newOne);

			// move content section back to the top of the page
			scroll(0,0);

		},
		buildMenuItem : function($slide, index) {

			var _this = this;

			// get header text for menu items
			var chapterTitleText = $slide.find(this.settings.element_slideChapter).text() || null;
			var slideTitleText = $slide.find(this.settings.element_slideTitle).text() || null;

			// format title strings, replace spaces with dashes and set everthing to lowercase
			var chapterIdText = chapterTitleText ? chapterTitleText.replace(/\ /g,"-").toLowerCase() : null;

			var titleIdText = slideTitleText ? slideTitleText.replace(/\ /g, "-").toLowerCase() : null;
			
			// if we have subtitle text, set ID to "title_subtitle", if not set ID to "title_titleIndex" (so all id's are unique)
			var id = ( chapterIdText ? chapterIdText : 'ch' + index ) + "_" + ( titleIdText ?  titleIdText : index );
			
			// remove all non alphanumeric characters except for underscore or hyphen
			id = id.replace(/([^\w\s_-])/g, '');

			// apply id to the slide
			$slide.attr('id',id);

			// if the slide is a new category, build a header
			//if (  $slide.data('newcategory') === true ) { 
			
			// -- CHAPTER TITLE --------------------------------------------------------------------------------- //
			// check to see if this slide's chapter title is the same as the previous one.  if not, make a new chapter
			if ( chapterTitleText && chapterTitleText !== this.currentChapterTitle ) {

				// add a flag to the slide to indicate a new chapter
				$slide.addClass(this.settings.class_newchapter);

				var $header = $('<dt/>', { html:chapterTitleText })
					.click(function() {  _this.fireMenuHeaderLink($(this));  })  

				// create section for links - assign to dynamic global variable so we know where to insert links
				this.$currentChapter = $('<dd/>');

				// create section, header and content section
				$('<dl/>')
					.append($header) 
					.append( this.$currentChapter )								
					.appendTo(this.$menu);
			
				// set current chapter of the slider to the new chapter title
				this.currentChapterTitle = chapterTitleText;
			}

			// if we have a chapter title, we add the link to the chapter element, if not we add it to the menu
			var $linkparent = chapterTitleText ? this.$menu.find(this.$currentChapter) : this.$menu;

			// -- Build Link for each slide ------------------------- //
			var $link = $('<a/>', { html:slideTitleText, href:'#' })

				// pushes slide id to the URL, and popstate will actually change the slide
				.click(function() {  _this.addIdToURLAndChangeSlide($slide); return false;  })

				// add the link to the current chapter ( if there is one!! )
				.appendTo(this.$menu.find($linkparent));

			// set first item on
			if ( index === 0 ) { $link.addClass(this.settings.class_on); } 

			// bind menu link to the slide element so we can find it later
			$slide.data('link',$link);
		},
		fireMenuHeaderLink : function($menuSection) {
			
			var $contentSection = $menuSection.next('dd');
			var contentIsHidden = !$contentSection.is(':visible');		

			// if not in fullscreen mode and menu is not visible, click the first option in the section
			if ( contentIsHidden &&  !this.checkFullScreenMenu() ) {
				$contentSection.find('a:first').click();
			
			// if in fullscreen mode and menu section is hidden 
			} else if ( contentIsHidden ) {
				this.$menu.find('dd').hide();
				$contentSection.show();
			
			// if in fullscreen and menu section is visible
			} else { $contentSection.hide(); }

		},
		changeMenuSection : function() {
			// collapse all menu sections but the active one
			this.$menu.find('dt').removeClass(this.settings.class_on);
			this.$menu.find('dd').hide();
			this.$menu.find('a.' + this.settings.class_on).closest('dd').show()
				.prev('dt').addClass(this.settings.class_on);

		},
		buildPagination : function() {

			var _this = this;

			this.$pagination = $('<div/>', { 'class':this.settings.class_pagination })
			
			this.$prevButton = $('<a/>', { href:'#', 'class':this.settings.class_prevButton, html:'' })
				.click(function() { _this.firePaginationButtons($(this)); return false; })
				.appendTo(this.$pagination);

			this.$nextButton = $('<a/>', { href:'#', 'class':this.settings.class_forwardButton, html:'' })
				.click(function() { _this.firePaginationButtons($(this)); return false; })
				.appendTo(this.$pagination);

			return this.$pagination;
		},
		firePaginationButtons : function($button) {

			var $newSlide = $button.hasClass('forward') ? this.$activeSlide.next() : this.$activeSlide.prev();
			this.direction = $button.hasClass('forward') ? "next" : "prev";

			this.checkForDisabledAndIfNotChangeSlide($newSlide,$button);

		},
		enableOrDisablePagination : function($currentSlide) {

			var slideIndex = this.$slides.index($currentSlide);
			
			// remove all disabled states
			this.$pagination.find('a').removeClass(this.settings.class_disabled);

			// check to see if we are on first or last slide and disable appropriate button
			if ( slideIndex === 0 ) { this.$prevButton.addClass(this.settings.class_disabled); }
			if ( slideIndex === this.slideQty - 1 ) { this.$nextButton.addClass(this.settings.class_disabled); }
		},
		bindLeftRightKeys : function() {

			var _this = this; 

			// bind left/right keypress events
			$(document).unbind('keydown').bind('keydown',function(event) {
				switch(event.keyCode) {
					case 37: // left
						_this.direction = "prev";
						_this.checkForDisabledAndIfNotChangeSlide( _this.$activeSlide.prev(), _this.$prevButton );
						break;
					case 39: // right
						_this.direction = "next";
						_this.checkForDisabledAndIfNotChangeSlide( _this.$activeSlide.next(), _this.$nextButton );
						break;
				}
			});
		},
		checkForDisabledAndIfNotChangeSlide : function($newSlide, $navButton) {
			if ( !$navButton.hasClass(this.settings.class_disabled) ) {  
				this.addIdToURLAndChangeSlide($newSlide);  
			}
		},


		// -- Menu hide/show/fullscreen methods -------------------------------------------------------------------- //
		addToggleMenuButton : function() {

			var _this = this;

			var toggleMenuText = this.$menu.is(':visible') ? this.settings.text_hideMenu : this.settings.text_showMenu;

			this.$menuToggle = $('<a/>', { id:'toggleMenu', text: toggleMenuText })
				.click(function() {  _this.hideShowMenu(); return false;  });

			return this.$menuToggle;

		},
		hideShowMenu: function() {

			this.$menu.toggle();
	        this.changeHideShowText();
	        
			// we get visible menu state and full screen after we toggle the menu
			var menuIsVisible = this.$menu.is(':visible');
			var fullScreenMenu = this.checkFullScreenMenu();

	        // set default overflow state (may be changed with below conditions)
			this.$body.css('overflow-y','scroll');

			// if we made the menu visible in fullscreenmenu mode
			if ( menuIsVisible && fullScreenMenu ) {
				this.$body.css('overflow-y','hidden');  
				this.$menu.focus();  

			// or if we hid the menu in fullscreenmenu mode
			} else if ( !menuIsVisible && fullScreenMenu ) {  this.$body.css('overflow-y','visible');  }

			// of if we made the menu visible in default mode
			else if ( menuIsVisible && !fullScreenMenu ) {  this.$body.removeClass('noLeftGutter');  }

			// or if we hid the menu in regular mode
			else if ( !menuIsVisible && !fullScreenMenu ) {  this.$body.addClass('noLeftGutter');  }

		},
		checkFullScreenMenu : function()  {
			return this.windowWidth < this.settings.width_mobileSize;
		},
		changeHideShowText : function() {

			if ( !this.settings.addShowHideMenuButtons ) { return false; }
			var menuToggleText = this.$menu.is(':visible') ? this.settings.text_hideMenu : this.settings.text_showMenu;
			this.$menuToggle.text(menuToggleText);
		}
	};

	$.fn.buildSlideshow = function(options) {
		
		var settings = {
			localStorageKey : 'slideshowCurrentSlide',

			addLeftRightButtons : true,
			addShowHideMenuButton: true,
			setToFullScreen: false,
			changeType: 'fadeIn',  //also horizSlide
			
			element_slide: 'article',
			element_slideChapter: 'h1',
			element_slideTitle: 'h2',
			text_hideMenu: 'Hide Menu',
			text_showMenu: 'Show Menu',
			class_disabled: 'disabled',
			class_on: 'on',
			class_newchapter: 'new-chapter',
			class_pagination: 'pagination',
			class_prevButton: 'prev',
			class_forwardButton: 'forward',
			width_mobileSize: 200

		};
		
		return this.each(function() {
			if ( options ) { $.extend(settings,options); }
			var menu = new $.Slideshow($(this), settings);
		});
	}
	
})(jQuery);





