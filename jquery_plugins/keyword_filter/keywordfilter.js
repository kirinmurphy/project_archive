// to do: bugfix: caps differences accounted for differently in regex matching than in tag building

var utils = {
	objectifyArray : function(array,setValue) {
	  var object = {};
	  for (var i=0;i<array.length;i++)  {  object[ array[i] ] = setValue;  }
	  return object;
	},
	arrayifyObject: function(object) {
		var arraygroup = [],
			array = [],
			key;

		for (key in object) {
			array = [ key,object[key] ];
			arraygroup.push(array);
		}
		return arraygroup;
	},
	sortEachArrayDescendingBySecondValue: function(a,b) {
	    var x = a[1], y = b[1];
	   	return ((x < y) ? 1 : ((x > y) ? -1 : 0));
	},
    trimSurroundingSpaces: function(str) {
		/* removes beginning and trailing characters */
		return str.replace(/^\s+|\s+$/g,"");
	},
	removeSingleSpacesBeforeOrAfterCommasInString: function(string) {
		return string.replace(/, /g,',').replace(/ ,/g,',');
	},
	preformatCSVString: function(string) {
		// we add beginning and trailing commas on master string so every tag has surrounding commas
		string = ',' + string + ',';

		// remove leading and trailing characters within master string
		return this.removeSingleSpacesBeforeOrAfterCommasInString(string);
	},
	getCommaWrappedRegexValue: function(string) {
		// we add surrounding comments to the string we are regex matching to a master set
		// all must start and end with commas so only thing that can be matched is full keyword (not characaters in a keyword)
		return new RegExp(',' + string + ',',"gi");
	}
};



(function($) {

	$.KeywordFilter = function($list,settings) {

		var _this = this;

		this.settings = settings;
		this.$list = $list;
		this.$items = this.$list.find(this.settings.itemSelector);
		this.itemQty = this.$items.length;

		// declaring default Display tag link, will be set dynamically () if one is set in config
		this.$defaultDisplayTag = null;

		// run method to get list of tags and return it to facetedTaglistVariable
		var facetedTagList = this.getFacetedTagList();
		this.buildTagMenu(facetedTagList);

		// -- CREATING TAGS ELEMENTS FOR EACH ITEM ----------------------------------------------- //
		if ( this.settings.addItemTags === true ) {
	    this.createItemLevelTags(facetedTagList);
		}


		// -- DROPDOWN FUNCTIONALITY ------------------------------------------------------------ //
		if ( this.settings.addDropdown ) { this.addDropdown(); }

		// or if dropdown not enabled, add taglist alone to container
		else { this.settings.$tagContainer.append(this.$tagList); }



		// -- ACTIVATE DEFAULT TAG - if defaultDisplayTag exists, make that Active Tag ---------- //
		if ( this.$defaultDisplayTag && this.$defaultDisplayTag.length === 1 ) {
			this.activate(this.$defaultDisplayTag, this.settings.defaultDisplayTag);

		// if no defaultDisplayTag, give showAll on class
		} else {  this.$showAll.addClass(this.settings.class_on);  }


		// -- AUTOCLICK tag from URL Extension ------------------------------------------------- //
		if ( this.settings.activateTagsFromUrlHash ) {

			// select keyword from default url
		    this.selectKeywordFromURL();

		    // observes hash change in URL and updates keyword based on new value from URL
			$(window).bind('anchorchange hashchange', function(event) {
				_this.selectKeywordFromURL();
			});
		}
	};

	$.KeywordFilter.prototype = {
		getFacetedTagList: function() {
			var _this = this;

			// -- GET TAGS from each DOM elements data-tags custom attribute ------------------------------------------- //
			var tagMasterString = '';

			// loop through each item and concat item's data-tags to a master string of tags
			this.$items.each(function(index) {
				// get the tags from the html data attribute
				var itemTags = $(this).data(_this.settings.dataBoundKey);

				console.log('boooo', itemTags)

				// if we have them
				if ( itemTags ) {

					// build a string of all the tag sets
					tagMasterString += itemTags;

					// if we are not at the end, add a comma between sets
					if ( index < _this.itemQty - 1 ) { tagMasterString += ','; }
				}
			});

			// remove leading and trailing characters within master string
			tagMasterString = utils.removeSingleSpacesBeforeOrAfterCommasInString(tagMasterString);

			// turn string into array
			var tagArray = tagMasterString.split(',');

			// -- CREATING TAG COUNTS - we make the tags keys in a hash, so we can assign counts to each of them ------ //
			// objectifyArray() turns array into an object, second argument returns 0 as the value
			// we set each value as 0 as a default before adding the keyword counts
			var tagKeys = utils.objectifyArray(tagArray, 0);

			// adds counts to keys in tagKeys
			$.each(tagArray, function(index,tag){  tagKeys[tag] += 1;  });

			// takes tagKeys oboject and retuns a nested array of [[ tag, tagQty ], [tag, tagQty], ... ]
			// then sort by descending frequency of tags
			var facetedTagList = utils.arrayifyObject(tagKeys)
				.sort(utils.sortEachArrayDescendingBySecondValue);

			return facetedTagList;
		},
		buildTagMenu: function(facetedTagList) {

			var _this = this;

			// -- CREATE Tag Menu Elements ------------------------------------------------------------------------- //
			// tag container
			this.$tagList = $('<div/>', { 'class':this.settings.class_taglist });

			// default link to show all items
			this.$showAll = $('<a/>', { href:'#', html:this.settings.text_showAll + ' <span>(' + this.itemQty + ')</span>'  })
				.appendTo(this.$tagList)
				.on('click', function() {
					_this.activate($(this));  return false;
				});

      this.menuElementIndex = {};
			// create a link for each tag in the set
			$.each(facetedTagList, function(index,tag) {

				var tagName = tag[0];
				var tagID = tagName.replace(/ /g,'-').replace(/\./g,'');

				var $link = $('<a/>', {
						id:tagID,
						href:'#',
						html:tagName + ' <span>(' + tag[1] + ')</span>'
					})
					.on('click', function() {
						if ( !$link.hasClass(_this.settings.class_on)  ) {
							_this.activate($link,tagName);
						}
						return false;
					});

				// if link is default display tag, set variable and add to list after ShowAll
				if ( _this.settings.defaultDisplayTag !== null
					&& _this.settings.defaultDisplayTag === tagName ) {

					_this.$defaultDisplayTag = $link;

					$link.prependTo(_this.$tagList);

				// if any other tag, add at end of list
				} else {  $link.appendTo(_this.$tagList);  }

        // we add menu link to index so we can get it later
        _this.menuElementIndex[tagName] = $link;

			});
			console.log('boooo2222', this.$tagList)

		},
		selectKeywordFromURL: function() {
    	// get url extension after the "##" in the URL
    	// @fix - could use has instead of href, which is better
      var URLExtension = window.location.href.split('##')[1];

      if ( URLExtension ) {

      	// replace dashes with spaces
      	// @fix - what if we have dashes in the keywords
        URLExtension = URLExtension.replace(/-/g,' ');

        // we look in a stored index of menu items and try to match the urlExtension to a key
        var $urlMenuItem = this.menuElementIndex[URLExtension];

        // if we have a match, trigger a click on this item
        if ( $urlMenuItem ) { $urlMenuItem.trigger('click'); }
      }
		},
    createItemLevelTags: function(facetedTagList) {

      var _this = this;

      this.$items.each(function(index) {

				var $item = $(this);
				var $itemTags = $('<div/>', { 'class':_this.settings.class_itemTags + ' clr' });

				// get tags for existing item
				var itemTags = utils.preformatCSVString( $item.data(_this.settings.dataBoundKey) );

				$.each(facetedTagList, function(index,item) {

					var tagName = item[0];

					// if link is default display tag, and hideDefaultDisplayItemTag is true, don't build link
					if ( _this.settings.defaultDisplayTag && _this.settings.defaultDisplayTag === tagName
						&& _this.settings.hideDefaultDisplayItemTag === true ) {
						return;
					}

					// get regex value of item in facetedTaglist
					var regExpTag = utils.getCommaWrappedRegexValue(tagName);

					// see if exists in itemTags
					if ( itemTags.match(regExpTag) !== null ) {

						// if exists, add a link for each tag to it's parent item and bind the activate events
						$('<a/>', { href:'#', html:tagName })
							.attr('data-tag',tagName)
							.appendTo($itemTags)
							.on('click', function() {
								_this.activateItemLevelTag($(this),tagName,item);
								return false;
							});
					}
				});

				// if there is a specified selector applied for itemTags, append to there
				if ( _this.settings.itemTagContainer
					&& $item.find(_this.settings.itemTagContainer).length > 0 ) {
					$item.find(_this.settings.itemTagContainer)
						.append($itemTags);

				// if none specified, just append to $item parent
				} else {  $item.append($itemTags);  }
			});
    },

    createItemLevelTag: function () {

    },
    activateItemLevelTag: function($itemTagLink,tagName) {

		var $tagMenuLink = null;

		// if this tag is already on, turn off by making ShowAll the link to activate below
		if ( $itemTagLink.hasClass(this.settings.class_itemTagOn) ) {
			$tagMenuLink = this.$showAll;
			tagName = null;

		// or tagMenuLink is tagName id of link in tagList
		} else {
			var tagID = tagName.replace(/ /g,'-').replace(/\./g,'');
			$tagMenuLink = this.$tagList.find('#' + tagID);
		}

		// activate items and set menu item if dropdown true
		this.activate( $tagMenuLink, tagName );

		if ( this.dropdownOk === true ) { this.makeActiveInDropdown( $tagMenuLink ); }
    },
		makeActiveInDropdown: function($activeOption) {
			// make a span with the active link content and put it in the dropdown trigger element
			this.$dropDownTrigger.html( $('<span/>', { html:$activeOption.html() }) );

			// show any previously hidden tags and hide active element
			// @fix - instead of display:block, show() on below line makes defaultDisplayTag switched to inline
			this.$tagList.find('a').css('display','block');
			$activeOption.hide();
		},
		activate: function($link, tagName) {
			var _this = this;

			// remove previous active state if any
			this.$tagList.find('.' + this.settings.class_on)
				.removeClass(this.settings.class_on);

			// add Dropdown capability, makeActiveInDropdown hides
			// menu option and puts tag in header of dropdown
			if (this.dropdownOk) { this.makeActiveInDropdown($link); }

			// makes current link active
			$link.addClass(this.settings.class_on);

			// if showAll, just show all, otherwise match tag to items' taglist
			if ( $link.is( this.$showAll ) ) {
				this.$items.show();

			} else {

				// REGEX STUFF for matching tag values
        // get typed in value, add surrounding commas so it gets matched as a whole word in the tags string
				var regExpValue = utils.getCommaWrappedRegexValue(tagName);

				console.log('this', this.$items);
				// find and hide all options initially (then re-display matches)
				this.$items.hide()
					.removeClass(_this.settings.class_activeItem)
					.each(function(index){
						var $item = $(this);
						console.log('bong', $item.data());

						// get CSV tag string from DOM element
						var csvString = $item.data(_this.settings.dataBoundKey)
						var tagSet = utils.preformatCSVString(csvString);

						console.log(tagSet, regExpValue)
            // if value exists in string display this option
						if ( tagSet.match(regExpValue) !== null ) {
							$item.addClass(_this.settings.class_activeItem).show();
						}
					});
			}

			// if we have itemTags, set active state of those item tags
			if ( this.settings.addItemTags === true ) {
				// remove any previous active classes
				_this.$items.find('.' + _this.settings.class_itemTags)
					.find('a.' + _this.settings.class_itemTagOn )
					.removeClass(_this.settings.class_itemTagOn);

				// add active class to clicked
				_this.$items.find('.' + _this.settings.class_itemTags)
					.find('[data-tag="' + tagName + '"]')
					.addClass(_this.settings.class_itemTagOn );
			}
			// execute external callback function that exposes the active list items
			this.settings.selectTagCallback(_this.$list
				.find('.' + this.settings.class_activeItem) );
		},

		addDropdown: function() {

			// -- ADD DROPDOWN functionality if activated ------------------------------------------------------- //
			// set dropdownOk boolean based on if selected and if script is loaded
			this.dropdownOk = jQuery.fn['dropDown'] && this.settings.addDropdown === true;

			// first checks if activated but script not loaded
			if ( this.settings.addDropdown === true
				&& jQuery.fn.dropDown === undefined
				&& window.console ) {
				console.error('Error: dropdown plugin script not loaded');

			// of if script is loaded
			} else if ( this.dropdownOk === true ) {

				this.$dropDownTrigger = $('<dt/>');
				var $dropDownContent = $('<dd/>')
					.append(this.$tagList);

				// build dropdown elements
				var $dropDown = $('<dl/>', { 'class':this.settings.class_tagDropdown })
					.append(this.$dropDownTrigger)
					.append($dropDownContent)
					.addClass('dropdown').dropDown();

				this.makeActiveInDropdown( $dropDownContent.find('a:first') );

				// add dropdown with taglist to container
				this.settings.$tagContainer.append($dropDown);
			}
		}
	};

	$.fn.keywordFilter = function(options) {

		var settings = {

			// required
			itemSelector : null,
			$tagContainer: null,

			// optional
			dataBoundKey: 'keywords',
			addItemTags: true,
			itemTagContainer: null,
			hideDefaultDisplayItemTag: true,
			defaultDisplayTag: null,

	    activateTagsFromUrlHash: true,
	    //autoclickURLSeparator: '#',
	    // autoclickURLSpaceReplace: '|',

	    // makes the list of keywords into a dropdown menu
	    // !!!! REQUIRES dropdown.js plugin !!!!!!
	    // available at - https://github.com/kirinmurphy/DropDown
			addDropdown: false,

			selectTagCallback: function($activeItems) {},

			// text & classes
			text_showAll: 'All Items',
			class_on: 'on',
			class_activeItem: 'activeItem',
			class_taglist: 'tagList',
			class_tagDropdown: 'tagDropdown',
			class_itemTags: 'itemTags',
			class_itemTagOn: 'on'
		};

		return this.each(function() {
			if (options) { $.extend(settings,options); }
			var tags = new $.KeywordFilter($(this),settings);
		});
	};

})(jQuery);