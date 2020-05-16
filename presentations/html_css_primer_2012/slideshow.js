
(function($) {
	
	$.Slideshow = function($parent,settings) {

		// -- Persistent variables ------------------------------------ //
		this.$parent = $parent;
		this.settings = settings;

		this.$body = $('body');

		// settings.menuContainer can be a string of a selector '#sidebar' or a jQuery element (jquerified again in case of string)
		// optional : if not supplied, menu container is set to the parent
		this.$menuContainer = this.settings.menuContainer ? $(this.settings.menuContainer) : this.$parent;

		this.$slides = $parent.find(this.settings.slideElement);
		this.slideQty = this.$slides.length;
		
		this.$menu = $('<div/>', { id:'menu' });
		this.$navDock;

		var _this = this;

		// -- Dynamic variables ----------------------------------- //
		// set first slide as active slide by default, will be overwritten by url match or localstorage value
		// @fix - this only is done here because there is a scenario where the active slide is not set by the time it needs to be 
		this.$activeSlide = this.$slides.eq(0);

		// -- Init Events ------------------------------------- //

		// build a link menu for each slide
		this.$slides.each(function(index) {
			_this.$menu.append( _this.buildMenuItem($(this),index) );
		});		

		// change menu section, on init we set the first menu section to display
		this.changeMenuSection();

		// insert menu into into parent
		this.$menuContainer.append(this.$menu);

		// if we have navDock options, create navDock and include controls
		if ( this.settings.addLeftRightButtons || this.settings.addShowHideMenuButton ) {

			this.$navDock = $('<footer>', { id:'navdock'});

			// add left and right buttons
			if ( this.settings.addLeftRightButtons === true ) {
				this.$navDock.append(_this.buildLeftRightButtons());
			}

			// add show hide menu buttons
			if ( this.settings.addShowHideMenuButton === true ) {
				this.$navDock.append(this.addToggleMenuButton());
			}

			this.$body.append(this.$navDock);
		}

		// adding keypress functionality
		this.bindLeftRightKeys();



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

			// add activeSlide ID to the url and push URL state to history 
			this.addIdToURLAndChangeSlide(this.$activeSlide);
			this.checkForIdFromURLAndGoToSlide({ onload:true });
		}

		// on popstate (back & forward button clicks) we look for the ID again from the url and go to it
		$(window).on('popstate anchorchange hashchange', function(event) {
			_this.checkForIdFromURLAndGoToSlide({ onload:false });
		});

		// -- End Init Events ------------------------------------- //

	};
	
	$.Slideshow.prototype = {
		addIdToURLAndChangeSlide : function($newSlide) {

			// push the current slide ID to the URL stack in the history - sets the URL to current slideID 
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
			
			// parse URL extension
			var url = History.getState().url;
			var urlParts = url.split("/?");
			this.urlExtension = urlParts.length > 1 ? urlParts[urlParts.length - 1] : null;

			// if we have an extension from the last URL state in the history stack 
			if ( this.urlExtension ) {
				
				// get new slide from the url extension and change it
				var $newSlide = $('#' + this.urlExtension);
				this.changeSlide($newSlide);

			// if we don't have a url extension, and this is from a popstate (not onload)
			// we skip the first pushstate slide when pressing the the back button
			// because the page gets loaded and then dynamically sets the active slide
			// the first popstate change is with no url extension, no different than the previous back button 
			// @fix - need to validate for the presence of an id when building the items.
			} else if ( model && model.onload === false ) {  History.go(-1);  } 
		},
		changeSlide : function($newOne) {

			// if we have a current slide, hide it
			// @fix - better to run this condition on everytime to test for first time page load (with no active element)
			// or to set a default first active slide so that we don't have to run this condition everytime.
			this.$activeSlide.hide();
			$newOne.show(); 

			// set active slide so we can find it later
			this.$activeSlide = $newOne; 

			// change nav link bound to new active slide
			this.$menu.find('.on').removeClass('on');
			var $newLink = $newOne.data('link');
			$newLink.addClass('on');

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

			// if the parent section is invisible, change the menu section 
			if ( !$newLink.closest('dd').is(':visible') ) {  this.changeMenuSection();  }

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
			var h1text = $slide.find('h1').text() || null;
			var h2text = $slide.find('h2').text() || null;

			// add unique id of h1 & h2 titles to each slide
			var h1IdText = h1text ? h1text.replace(/\ /g,"-").toLowerCase() : null;
			var h2IdText = h2text ? h2text.replace(/\ /g, "-").toLowerCase() : null;
			
			// if we have h2 text, set ID to h1 + h2 text, if no h2 text, set ID to h2
			var id = h2IdText ? h1IdText + "_" + h2IdText : h1IdText;
			
			// remove all non alphanumeric characters except for underscore or hyphen
			id = id.replace(/([^\w\s_-])/g, '');

			// apply id to the slide
			$slide.attr('id',id);

			// if the slide is a new category, build a header
			if (  $slide.data('newcategory') === true ) { 
				
				var $header = $('<dt/>', { html:h1text })
					.click(function() {  _this.fireMenuHeaderLink($(this));  })  

				// create section, header and content section
				$('<dl/>')
					.append($header) 
					.append( $('<dd/>') )								
					.appendTo(this.$menu);
			}

			// -- Build Link for each slide ------------------------- //
			var $link = $('<a/>', { html:h2text, href:'#' })

				// should be a better way to do this - maintaining state of existing section?
				// @fix - current dd is set in each if statement
				.appendTo(this.$menu.find('dl:last dd'))

				// pushes slide id to the URL, and popstate will actually change the slide
				.click(function() {  _this.addIdToURLAndChangeSlide($slide); return false;  });

			// set first item on
			if ( index === 0 ) { $link.addClass('on'); } 

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
			this.$menu.find('dd').hide();
			this.$menu.find('.on').closest('dd').show();

		},
		buildLeftRightButtons : function() {

			var _this = this;

			this.$pagination = $('<div/>', { 'class':'pagination' })
			
			this.$prevButton = $('<a/>', { href:'#', 'class':'prev', html:'&lt;' })
				.click(function() { _this.fireLeftRightButtons($(this)); return false; })
				.appendTo(this.$pagination);

			this.$nextButton = $('<a/>', { href:'#', 'class':'forward', html:'&gt;' })
				.click(function() { _this.fireLeftRightButtons($(this)); return false; })
				.appendTo(this.$pagination);

			return this.$pagination;
		},
		fireLeftRightButtons : function($button) {

			var $newSlide = $button.hasClass('forward') ? this.$activeSlide.next() : this.$activeSlide.prev();

			this.checkForDisabledAndIfNotChangeSlide($newSlide,$button);

		},
		enableOrDisablePagination : function($currentSlide) {

			var slideIndex = this.$slides.index($currentSlide);
			
			// remove all disabled states
			this.$pagination.find('a').removeClass('disabled');

			// check to see if we are on first or last slide and disable appropriate button
			if ( slideIndex === 0 ) { this.$prevButton.addClass('disabled'); }
			if ( slideIndex === this.slideQty - 1 ) { this.$nextButton.addClass('disabled'); }
		},
		bindLeftRightKeys : function() {

			var _this = this; 

			// bind left/right keypress events
			$(document).unbind('keydown').bind('keydown',function(event) {
				switch(event.keyCode) {
					case 37: // left
						_this.checkForDisabledAndIfNotChangeSlide( _this.$activeSlide.prev(), _this.$prevButton );
						break;
					case 39: // right
						_this.checkForDisabledAndIfNotChangeSlide( _this.$activeSlide.next(), _this.$nextButton );
						break;
				}
			});
		},
		checkForDisabledAndIfNotChangeSlide : function($newSlide, $navButton) {
			if ( !$navButton.hasClass('disabled') ) {  this.addIdToURLAndChangeSlide($newSlide);  }
		},


		// -- Menu hide/show/fullscreen methods --------------------------------------- //

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
			return this.$menu.css('right').replace('px','') == '0';
		},
		changeHideShowText : function() {
			var menuToggleText = this.$menu.is(':visible') ? this.settings.text_hideMenu : this.settings.text_showMenu;
			this.$menuToggle.text(menuToggleText);
		}
	};

	$.fn.buildSlideshow = function(options) {
		
		var settings = {
			localStorageKey : 'slideshowCurrentSlide',
			addLeftRightButtons : true,
			addShowHideMenuButton: true,
			slideElement: 'article',
			text_hideMenu: 'Hide Menu',
			text_showMenu: 'Show Menu'
		};
		
		return this.each(function() {
			if ( options ) { $.extend(settings,options); }
			var menu = new $.Slideshow($(this), settings);
		});
	}
	
})(jQuery);





