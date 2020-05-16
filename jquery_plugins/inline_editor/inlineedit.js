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

	$.InlineEditor = function($target,settings) {
		this.$target = $target;
		this.settings = settings;

		var _this = this;
		
        // set fieldType from fieldTypeAttr (dom element attribute), or settings config
		var fieldTypeAttr = this.$target.data('fieldtype');
		if ( fieldTypeAttr ) {  this.fieldType = fieldTypeAttr; } 
		else if ( this.settings.fieldType ) {  this.fieldType = this.settings.fieldType; }
		else { this.fieldType = null; }

		// get and hide display value
		_this.$displayContainer = _this.$target.find(_this.settings.displayContainer);
		
		this.$target.click(function() {  
			var $this = $(this);
            
            // if we're not in edit mode, start edit mode
			if ( !$this.hasClass(_this.settings.class_editmode) ) {  

                // put us in edit mode and hide display container
				$this.addClass(_this.settings.class_editmode);
				_this.$displayContainer.hide();						

				// pull existing value from displayContainer to populate editField later
				_this.existingValue = _this.$displayContainer.text();

                // setup form settings and callbacks
				var formSettings = {
            		buildType : 'form',
            		addCancelButton: true,
            		addClearButton: false,
            		addFormLevelErrorMsg: false,
            		clearOnSubmitSuccess: false,
            		items : [
            			{ type:_this.fieldType, properties:{}  }
            		],
            		submitSuccessCallback : function(data) { 

                        // get new value from textbox
                        var newValue = data.inlineedit;

                        // if value is empty, and value is required, exit out of function 
                        if ( _this.settings.requiredField === true && newValue === '' ) { 
                            return false; 

                        // if value is the same as displayed text, provide message that error
                        } else if ( _this.$displayContainer.text() === newValue ) { 
                            alert(_this.settings.text_valueNotChanged); 
                            return false; 

                        } else {
                            // replace existing value and show viewState element
                            _this.$displayContainer.text(newValue);

                            // callback for successful submit 
                            _this.settings.submitSuccessCallback(newValue); 

                            _this.returnToDisplayState();
                        }
            		},
            		cancelButtonCallback : function() { _this.returnToDisplayState();  }
            	};
            	
            	if ( _this.fieldType === 'text' || _this.fieldType === 'textarea' ) {
            	    formSettings.items[0].properties = { 
    			        type:_this.fieldType, 
    			        name:'inlineedit', 
    			        value:_this.existingValue 
    			    } 
    			    
            	}

            	// if we have a checkbox, add other shizno
            	if ( _this.fieldType === 'checkbox' ) {
                    var formattedSelections = utils.preformatCSVString(_this.existingValue);
                    
                    var fieldOptionsKey = _this.settings.fieldOptions[$this.data('fieldoptions')];
                    
                    // if we have a string, it is a URL for an ajax call
                    if ( typeof fieldOptionsKey === 'string' ){

                        $.ajax({
                            url: fieldOptionsKey,
                            data: 'JSON',
                            success: function(data) { 
                                var options = data.options;
                                $.each(data.options, function(index,option) {
                                    var optionRegexMatch =  utils.getCommaWrappedRegexValue(option.label)                                   
                                    if ( formattedSelections.match(optionRegexMatch) !== null ) { 
                                        option.on = true;
                                    }
                                });
                                
                                formSettings.items[0].options = data.options;
                            },
                            error: function() { console.log('we errin?') }
                        });
                    }
                    
                    
                }

            	// create form 
            	$this.buildMeAFormOrSomething(formSettings);  					
			}
		});
	};
	
	$.InlineEditor.prototype = {
		// reset to view state on Update success or cancel click options below	
		returnToDisplayState : function() {
			this.$target.find('form').remove();
			this.$displayContainer.show();
			this.$target.removeClass(this.settings.class_editmode);				
		}
	};
	
	$.fn.doAnInlineEdit = function(options) {

        // test that dependencies are loaded
        // if ( !jQuery.fn.buildMeAFormOrSomething && options.debug === true) { 
        //     // if not pass error message and exit out of function so function doesn't run and break everything!
        //     if ( window.console ) { console.error('formbuilder.js not loaded yo'); }
        //     return false;
        // }
    
		var settings = {
			fieldtype : null,
			requiredField: true,
			class_editmode : 'editmode',
			class_editfield : 'editfield',
			displayContainer : 'span',
			fieldOptions: [],
			
			text_update : 'Update',
			text_cancel : 'Cancel',
			text_emptyValue: 'Please enter a value or delete this item',
			text_valueNotChanged: 'You didn\'t change anything dummy',
			submitSuccessCallback : function(editedValue){}
		};
		
		return this.each(function() {
			if ( options ) { $.extend(settings,options) }
			var inlineEditor = new $.InlineEditor($(this),settings);
		});
	};
	

})(jQuery);