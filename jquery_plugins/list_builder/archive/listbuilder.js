// LISTBUILDER - list generation tool
// written by kirin murphy - codethings.net

(function($) {

	$.ListBuilder = function($parent,settings) {

		this.$parent = $parent;
		this.settings = settings;
				
		var _this = this;
		
		this.$listwrap = $('<div/>', {'class': this.settings.class_portfolioInner });

		// get URL string if applicable, and remove any trailing hashes accepted with ## as the delimiter
		var URLparts = window.location.href.split('#');
		console.log('urlparts',URLparts);

		// if the 2nd value in the array is an empty string that means we are starting with a '##' 
		// which is reserved for different functionality, so for this purpose, url hash is set to 0
		var URLHash = URLparts.length > 1 && URLparts[1] !== '' ? URLparts[1] : null;

        console.log('urlhash-almost-after',URLHash);

		// if URLHash is not null, we check to see if ther is a '##' following the first flter string
        console.log('urlhash-after',URLHash);
		
		// loop through each section of the list		
		$.each(this.settings.list.groups, function(index,group) {
			
			var $section = $(_this.settings.element_section);

			$.each(group.projects, function(index,project) {

				// if the item has a conditional URL requirement for display, we check the url and if the string doesn't match, don't display it.
                // if there is no URLHash but we have a property for showWithURLExtension - do nothing
                if ( !URLHash && project.showWithURLExtension ) { } 
                
                // if there is a URLHash and a flag for the project to showWithURLExtension, and the two values dont match - do nothing
                else if ( URLHash && project.showWithURLExtension && project.showWithURLExtension !== URLHash ) { } 
                
                // otherwise, show the element
                else {  
                	var $article = $(_this.buildItem(index,project));
                	$section.append($article);  
                	if ( _this.settings.completedItemCallback ) { _this.settings.completedItemCallback({$article: $article});  }
                }
			});

			// if there are elemeents in this section, and group.name exists show it
			if ( $section.children().length > 0 && group.name ) {
				$section.prepend(  $(_this.settings.element_sectionHeader, { text:group.name })  );
			}

			$section.appendTo(_this.$listwrap);
		});

		// -- Completed list events --------------------------------------------------- //
		// we make available some return controls to the plugin so user can present them how they wish

		var model = {
		    $parent: this.$parent,
		    settings: this.settings,
		    $listwrap: this.$listwrap,
		    listConfig: this.settings.list.configuration,
		    returnControls: {}
		};

        // creates external list controls that are available to a callback, user must add elements to the page in the callback, 
        // allows user to place the elements anywhere on the page
        // @fix - make a default that displays the list controls in a set place, and add configuration option to return these controls outside of the list
		if ( this.settings.templates ) {
			model.returnControls.$templateLinks = this.setTemplates(this.settings.templates);
		}
		
		model.returnControls.$showSelected = this.buildShowSelectedOptions();

		// fire callback and return callback data
		this.settings.completedListCallback(model);
		
		this.$listwrap.appendTo(this.$parent);		
	};
	
	$.ListBuilder.prototype = {
		buildItem : function(index,item) {
			
			var _this = this;

			// run init fn on each 
			if ( typeof(this.settings.buildItemInitCallback) == 'function' ) { 
			    var itemInitObject = this.settings.buildItemInitCallback(item); 
			}

			var $article = $(this.settings.element_listitem);

			// if we have tags for this item add it to keyword custom attribute concatenated with 'data-'
			// tags is an array so we join the array into a comma seprated string first
			if ( item.tags ) {  $article.attr('data-' + this.settings.customattribute_keywords, item.tags.join(','));  }
		
			// -- Item Selection Options ---------------------------------------------------------- //
			// add list's select options of selecting, starring, and dragging to option
			if ( this.settings.addSelect === true || this.settings.addStarring === true 
				|| this.settings.addDragAndDrop === true || this.settings.addRemove === true ) {

				var $selectOptions = $('<div/>', { 'class':this.settings.class_selectOptions + ' clr' });

				// -- adding select option -------------------- //
				if ( this.settings.addSelect === true ) {
					$('<div/>', { 'class':this.settings.class_selectItem })
						.append( 
							$('<input/>', { type:'checkbox' }).prop('checked',item.isSelected === true ? true : false ) 
								.click(function() {  _this.selectItem($(this),$article);  })
						)
						.appendTo( $selectOptions );
					
					if ( item.isSelected === true ) { 
						$article.addClass(this.settings.class_isChecked) 
					} 
				}

				// -- add starring opton --------------------- //
				if ( this.settings.addStarring === true ) {
					var $star = $('<div/>', { 'class':this.settings.class_starItem, text:'☆' })
						.click(function() {  _this.starItem($(this),$article);  });

					if ( item.isStarred === true ) { 
						$star.addClass(this.settings.class_isStarred); 
						$article.addClass(this.settings.class_isStarred);
					}
						
					$star.appendTo($selectOptions);
				}
				
				// -- add remove option ---------------------- //
				if ( this.settings.addRemove === true ) {
					$('<div/>', { 'class': this.settings.class_removeItem, html: 'x' })
						.click(function() {  _this.removeItem($removeItem, item);  })
						.appendTo($selectOptions);
				}
								
				$selectOptions.appendTo($article);

				// -- add drag and drop --------------------- // 
				if ( this.settings.addDragAndDrop === true ) {

				}
			}
			
			// Add thumbnail
			// if item has an image thumbnail, we add it after the select options 
			if ( item.imgLink && item.imgLink !== '' ) {
				$('<div/>', { 'class':this.settings.class_imgWrap })
					.append( $('<img/>', { src:item.imgLink })  )
					.appendTo($article);
			}
			
			// -- UNIQUE CONTENT --------------------------------------------------------------- //
			// we use a custom builder that returns specific HTML or jQuery element to append to article
			$article.append(
				this.settings.customBuilder({	
					$article: $article,
					item: item,
					settings: this.settings
				})
			);
			
			// add to parent
			return $article;
		},
		selectItem: function($checkbox,$article) {
			var isSelected = $checkbox.is(':checked') ? true : false;
			$article.toggleClass(this.settings.class_isChecked);
			this.settings.selectItemCallback(isSelected);
		},
		starItem: function($star,$article) {
			$star.toggleClass(this.settings.class_isStarred);
			$article.toggleClass(this.settings.class_isStarred);
			
			var isStarred = $star.hasClass(this.settings.class_isStarred) ? true : false;
			this.settings.starItemCallback(isStarred);
		},
		removeItem: function($article, item) {

			$article.children().hide();
			
			var $removeInfo = $('<div/>', { 'class':this.settings.class_removed, 
				html:'You have removed <strong>' + item.name + '</strong> from this list.' })
					.append( $('<a/>', { text:'Undo', href:'#' })
					 	.click(function() { 
					 	    $removeInfo.remove(); 
					 	    $article.children().fadeIn(400); 
					 	})
					)
					.append( $('<a/>', { text:'Remove From All Future Searches', href:'#' })  )
					.appendTo($article);
		},
	    setTemplates: function(templates) {
		    
			var _this = this;
			
			// build string of relevant classes, when control is toggled removes all template classes with this string before re-applying
			// we explicity remove specific classes instead of overwriting to allow element to accept other unrelated classes
			this.stringOfTemplateClasses = '';
			$.each(templates, function(index,template) { 
				if ( index > 0 ) { _this.stringOfTemplateClasses += ' ' }
				_this.stringOfTemplateClasses += template.class; 
			})
		
			var $templates = $('<div/>', { 'class':this.settings.class_templates });

		    $.each(templates, function(index,template){ 
		        var $link = $('<a/>', { href:'#', text:template.label  })
		            .appendTo($templates)
		            .click(function() {  _this.changeTemplate($link,template);  });

		        // if link is set by default in parent html, activate and disable link
		        if ( _this.$parent.hasClass(template.class) ) { $link.addClass('on disabled'); }
		    });

		    return $templates;
	    },
	    changeTemplate: function($link,template) {
            if ( !$link.hasClass(this.settings.class_state_on)  ) { 
                $link.parent()
                    .find('.' + this.settings.class_state_on + '.' + this.settings.class_state_disabled)
                    .removeClass(this.settings.class_state_on)
                    .removeClass(this.settings.class_state_disabled);
                    
                $link.addClass('on disabled');
                this.$parent.removeClass(this.stringOfTemplateClasses)
					.addClass(template.class);
            }
	    },
	    buildShowSelectedOptions: function() {

	    	var _this = this;

	        // -- hide/Show options ---------------------------------------------------------------- //
		    var selectOptions = [
		        { 'class':'showStarred', 'targetClass':'isStarred', 'label':'Show Starred', 'hideLabel':'Show All' },
		        { 'class':'showChecked', 'targetClass':'isChecked', 'label':'Show Checked', 'hideLabel':'Show All' }
		    ];
		    
		    var $selectOptions = $('<div/>', { 'class':'selectOptions'  });
		    
		    $.each(selectOptions, function(index,option) {
		        var $link = $('<a/>', { href:'#', text:option.label, 'class':option.class })
		            .appendTo($selectOptions)
		            .click(function() {
			            var $this = $(this);
			            
	                    var $articles = _this.$listwrap.find('article');
			            if ( !$this.hasClass('on') ) {    		                
			                $articles.not('.' + option.targetClass).hide();
			                $this.text(option.hideLabel);
			                
			            } else {
			                $articles.fadeIn(100);
			                $this.text(option.label);
			            }

			            $this.toggleClass('on');

			            return false;
		            });
		    });

		    return $selectOptions;
	    }
	};

	$.fn.listBuilder = function(options) {
		
		var settings = {

			// required
			list : null,            // pass in the initial data set
			customBuilder: null,    // load a custom function that builds the unique elements of the list

			// config
			addSelect: false,
			addStarring: false,
			addDragAndDrop: false,
			addRemove: false,

            buildItemInitCallback: null,

			// callbacks
			selectItemCallback: function(isSelected) {},    // isSelected : boolean
			starItemCallback: function(isStarred) {},       // isStarred : boolean
			
			completedListCallback: function(model) {},
    		// model = {
    		//     $parent: jQueryElement,          // plugin target selector
    		//     $listwrap: jQueryElement,        // list container 
    		//     returnControls: {                // set of controls (jQuery elements) that can be appended anywhere 
    		//       $templateLinks : jQueryElement // menu of template links options    
    		//    }              
    		// };

			templates: [],
            // Builds a toggle menu of view options which apply classes on the plugin target selector for unique styling 
            // If default page template has no unique class, pass in '' for the default class option
            // If default page template has a unique class, must be added to plugin target on load or before running the plugin
		    //  [   { class:'', label:'Default Template' }, { class:'template2Class', label:'Template 2' }, ...  ]
			
            // transitions
			speed_slideDown : 500,
			speed_slideUp : 400,
            
            // HTML
            element_section : '<section/>',
            element_sectionHeader: '<h2/>',
            element_listitem: '<article/>',

			// attributes
			customattribute_keywords: 'keywords',

			class_state_on: 'on',
			class_state_disabled: 'disabled',
			class_selectOptions: 'selectOptions',
			class_selectItem: 'selectItem',
			class_removeItem: 'removeItem',
			class_starItem: 'starItem',
			class_isStarred: 'isStarred',
			class_isChecked: 'isChecked',
			class_portfolioInner: 'inner',
			class_imgWrap: 'imgWrap',
			class_removed: 'removedInfo',
			class_templates: 'templates'
		};
		
		return this.each(function() {
			if ( options ) { $.extend(settings,options); }
			
			// create new instance of ListBuilder passing through target of plugin  
			// we assign instance to a variable as a precaution to ensure javascript garbage collects this data 
			// in crappy browsers there is a risk of memory leaks using 'new' without assinging it to a variable
			var newList = new $.ListBuilder($(this), settings);
		});
	}
	
})(jQuery);


