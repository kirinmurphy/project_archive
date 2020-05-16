/* ----------------------------------------
To Do:
- write tests!


- change state of display type dropdown to all when more content is added
	but don't want to redisplay the unflagged items


---------------------------------------- */


(function($) {

	var $window = $(window);

	$.Article = function(article) {
		
		// set the article as a property of the instantiated object
		this.article = article;

		// creates specific keys on the Class with the observable properties of the object
		this.isSelected = ko.observable(article.isSelected);
		this.isStarred = ko.observable(article.isStarred);

		// set display value observable based on flag set
		this.displayIt = ko.observable(true);
	};


	$.ListViewModel = function(options) {

		this.settings = {

			// -- REQUIRED ------------- //
	        firstArticles:null, 			

	        // -- OPTIONAL ------------- //
	        url_loadMoreArticles: null, 

	        // -- DEFAULTS ------------- //
	        addInfiniteScroll: true,
	        text: {
	            selectAll: 'Select All',
	            deselectAll: 'Deselect All',
	            starAll: 'Star All',
	            unstarAll: 'Unstar All',
	            loading: 'Loading...',
	            showMoreItems: 'Show More Items',
	            showAll: 'Show All',
	            showChecked: 'Show Checked',
	            showStarred: 'Show Starred'
	        },
	        keyMap: {
	        	isChecked : 'isSelected',
	        	isStarred : 'isStarred'
	        },
	        delay: {
	        	infiniteScroll: 0
	        }
    	};


		// -- BEGIN INIT ----------------------------------------------------------------- //
    	// validate class loaded with required field
    	if ( !options.firstArticles && window.console ) { console.error('Your initial list has not been loaded.'); return false; }

    	// extend default settings with passed in option values
    	// first argument of true does deep copy and is required for extending nested properties 
		if ( options ) { $.extend(true,this.settings,options); }

		// pointer to the context of parent Class for use within nested functions
		var _this = this;

		// start the count of flagged items
		this.checkedCount = ko.observable(0);
		this.starredCount = ko.observable(0);

		// set a value for the unobserved version of the array.  we hold onto this in case we need to match original data against updated states
		this.unobservedLoadedArticles = this.settings.firstArticles.articles;

		// declare the observable array we are going to add our items to
		this.articles = ko.observableArray();

		// INIT LIST! - on init, we load the content availalbe from page load if exists
		this.initializeArticles(this.settings.firstArticles.articles);



		// -- LOADING ADDITIONAL CONTENT -------------------------------------------------------------- //
		// set a state of the list if we are in the process of loading more items
		// we make requests with click event as well as scroll dectection in window observers below
		this.requestingMoreArticles = ko.observable(false);



		// -- BUTTON TEXT ----------------------------------------------------------------------------- // 
        this.buttonTextShowMore = ko.computed(function() {
			return _this.requestingMoreArticles() ? _this.settings.text.loading : _this.settings.text.showMoreItems;
        });

        this.buttonTextCheckAll = ko.computed(function() {
			return _this.articles().length > _this.checkedCount() ? _this.settings.text.selectAll : _this.settings.text.deselectAll;
        });

        this.buttonTextStarAll = ko.computed(function() {
			return _this.articles().length > _this.starredCount() ? _this.settings.text.starAll : _this.settings.text.unstarAll;
        });




        // -- SHOW/HIDE FLAGGED ITEMS --------------------------------------------------------- //
        // set variable to hold selected display type value on load 
		this.selectedDisplayType = ko.observable();

        // Select option dropdown data for displaying all items or each flagged type
        this.displayType = [
            { name:this.settings.text.showAll, value:'all',  },
            { name:this.settings.text.showChecked, value:'checked' },
            { name:this.settings.text.showStarred, value:'starred' }
        ];    

        // observe change event on display type select option 
	    this.selectedDisplayType.subscribe(function(type){	        
	    	_this.showHideItems(type);
	    });



        // -- WINDOW OBSERVERS ----------------------------------------------------------------------- //
        // if we have a url to load more articles 
        if ( this.settings.addInfiniteScroll ) {

			var windowHeight = $window.height();
			$window
				.resize(function() {
					// on resize, reset the window height
					windowHeight = $window.height();
				})
				.scroll(function() {

					// -- Infinite scrolling ----------------------------------------------- //
					// if window height plus scroll position equals the document height, we're at the bottom of the doc
					if ( windowHeight + $window.scrollTop() === $(document).height() ) { 

						// so we fire getMoreArticles to... you know, get more articles
						_this.requestingMoreArticles(true);
						setTimeout(function() { _this.getMoreArticles(); }, _this.settings.delay.infiniteScroll);
					}
				});
        }
	};

	$.ListViewModel.prototype = {

		initializeArticles : function(array) {
			var _this = this;

			// update flagged counts and push initialized article object to ko's observable array
			$.each(array, function(index,article) {
				if ( article.isSelected ) {  _this.checkedCount(_this.checkedCount()+1);  }
				if ( article.isStarred ) {  _this.starredCount(_this.starredCount()+1);  }
				_this.articles.push( new $.Article(article) );
			});
		},

        getMoreArticles : function(args) {

        	var _this = this;

        	// make sure we have a base url to request more content
        	if ( !this.settings.url_loadMoreArticles && window.console ) { 
        		console.error("You have not set a URL to request more articles from."); return false; 
        	}

        	// we set the state of the list to currently requesting more content
        	this.requestingMoreArticles(true);

        	// create url from static url endpoint and dynamic url extension 
        	var url = ( args && args.urlExtension ) 
        		? this.settings.url_loadMoreArticles + args.urlExtension : this.settings.url_loadMoreArticles;

        	// request the new content
        	$.ajax({
        		url:url,
        		dataType: 'json',
        		success: function(data) {

        			// add articles to static article array
        			_this.unobservedLoadedArticles = _this.unobservedLoadedArticles.concat(data.articles);

        			// add articles to observable ko array
        			_this.initializeArticles(data.articles);

        			// turn off loading value
        			_this.requestingMoreArticles(false);

        		},
        		error: function() {  if ( window.console ) { console.error('File not loaded correctly from ' + url); }  }
        	});
        },

        // -- CHANGE ITEM STATES ------------------------------------------------------------ //
		toggleCheckedItem : function(item) {
			if ( item.isSelected() === true ) { this.checkedCount(this.checkedCount()-1);  } 
			else {  this.checkedCount(this.checkedCount()+1);  }

			// need to return true for some reason or else this will conflict with the checked binding
			return true;
		},

		toggleStarredItem : function(item) {
			if ( item.isStarred() === true ) { 
				item.isStarred(false);
				this.starredCount(this.starredCount()-1);
			} else { 
				item.isStarred(true); 
				this.starredCount(this.starredCount()+1);
			}
		},

		selectAll : function(){
			this.toggleAllItems({ activeCount: this.checkedCount, itemFlag: this.settings.keyMap.isChecked });
		},

		starAll : function() {
			this.toggleAllItems({ activeCount: this.starredCount, itemFlag: this.settings.keyMap.isStarred });
		},

		toggleAllItems : function(args){
			
			var _this = this;

			// declare variable for new on/off value 
			var newValue;

			// if there are more total items than active items (not all are active), turn on all items
			if ( this.articles().length > args.activeCount() ) {
				newValue = true;
				args.activeCount(this.articles().length);

			// if there are the same number of articles and active items, turn off all items
			} else {
				newValue = false;
				args.activeCount(0);
			}

			// for each article in the array, change the item state to the new on/off value
			// @fix - these iterations are expensive, what other ways can we bind this change to each element without looping this way?
			$.each(this.articles(), function(index,article) {
				article[args.itemFlag](newValue);
			});
		},
		showHideItems : function(type) {
	    	// loop through articles and change display property per item based on flagged conditions
	        $.each(this.articles(),function(index,article) {

	        	// set item to display if type is all 
	        	if ( type === 'all' 

	        		// or if type is set to true in the value for the article
	        		|| ( type === 'checked' && article.isSelected() )
	        		|| ( type === 'starred' && article.isStarred() ) 
	        	) {  article.displayIt(true)  } 

	        	// otherwise set item to hide
	        	else { article.displayIt(false); }
	        });			
		}
	};

})(jQuery);
