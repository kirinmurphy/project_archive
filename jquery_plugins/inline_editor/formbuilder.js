//////////////////////////////////////////////////////
//// 
////  $().buildMeAFormOrSomething();
////   author: Kirin Murphy, www.codethings.net 
////   
//////////////////////////////////////////////////////




// console.clear();
(function($) {
	
	$.FormBuilder = function($parent,settings) {
		
		this.$parent = $parent;
		this.settings = settings;
		
		switch (this.settings.buildType) {
			case 'form' : this.$parent.append(this.buildForm()); break;
			case 'group' : this.$parent.append(this.buildGroup(settings)); break;
			case 'item' : this.$parent.append(this.buildItem(settings.item)); break;
		}
		this.settings.initCallback();	
	};
	
	$.FormBuilder.prototype = {
		buildForm : function() {
			var _this = this;

			// create form element
			this.$form = $('<form/>').attr('class',this.settings.class_form);
			
			// apply form level settings
			if ( this.settings.formID ) { this.$form.attr('id',this.settings.formID) }
			if ( this.settings.formHeader ) { 
				 $('<' + this.settings.elementType_formHeader + '/>', { html:this.settings.formHeader })
					.appendTo(this.$form);  
			}
			
			// if groups exist, build form items in parent groups 
			if ( this.settings.groups ) {   
				$.each(this.settings.groups,function(index,group) {				
					_this.$form.append(  _this.buildGroup(group)  );
				});

			// if not, build form items in one set
			} else if ( this.settings.items ) {
				this.buildItems(this.settings.items,this.$form);
			}
			
			// add submit options
			this.$form.append(_this.buildSubmitActions());
			
			return this.$form;
		},
		buildGroup : function(group) {
			var $group = $('<' + this.settings.elementType_groupContainer + '/>');

			// add header to group
			if ( group.header ) { $('<' + this.settings.elementType_groupHeader + '/>', { html:group.header }).appendTo($group);  }

			// add form items to group container
			this.buildItems(group.items,$group);

			return $group;
		},
		buildItems : function(items,$parent) {
			var _this = this;
			$.each(items,function(index,item) {				
				$parent.append(  _this.buildItem(item)  );
				// reset setNested after building each item
				_this.setNested = false;
			});			
		},
		buildItem : function(item){
			var _this = this;

			// PROPERTIES object used for text and textarea elements in addProperties() and createFormRow() methods
			// need to overwrite item properties each time
			this.properties = {};
			if ( item.properties ) { this.properties = item.properties; }

			switch(item.type) {
				case 'text':
				 	var $input = $('<input/>');
					this.addProperties($input);
					this.addTextFocusKeyEvents($input);
					return this.createFormRow().append($input);
					break;

				case 'textarea' : 
					var $textarea = $('<textarea/>');
					this.addProperties($textarea);
					this.addTextFocusKeyEvents($textarea);
					return this.createFormRow().append($textarea);
					break;

				case 'select' : 
					return this.buildSelectDropdown(item);
					break;
				
				case 'checkbox' : 
					var $formRow = this.createFormRow(item.type);
					
					if ( item.properties.className ) { $formRow.addClass(item.properties.className)  }
					
					return $formRow.append(this.buildClickset(item)); 
					break;

				case 'radio' :  
					return this.createFormRow()
						.append(this.buildClickset(item)); 
					break;
					
				case 'guideline' : 
					return $('<div/>', { html:item.html }).attr('class',this.settings.class_guideline);
					break;
					
				case 'html' : 
					return this.createFormRow().append(item.html);
					break;
			}
		},
		buildSelectDropdown : function(item) {

			var _this = this;
			
			var $select = $('<select/>');
			this.addProperties($select);

			var $formItem = this.createFormRow()
				.append($select);

			// loop through each options item and build markup
			$.each(item.options,function(index,option) {
										
				var $option = $('<option/>', { html:option.label })
					.appendTo($select)
					.click(function(){
						
						var $this = $(this);
						
						// find html element for nested set bound to this option when nested set was created
						var $nestedSet = $option.data('nestedSet');

						// if no nested options or nested options are hidden, hide all visible nested options
						if ( $nestedSet === undefined || $nestedSet.is(':hidden') ) {
							$formItem.children('.' + _this.settings.class_nestedSet).hide();
						}
						
						// if nested options are hidden, show them
						if ( $nestedSet !== undefined && $nestedSet.is(':hidden') ) {  $nestedSet.show();  }
					});

				// add option value and settings
				if ( option.value ) {  $option.attr('value',option.value)  }
				if ( option.disabled ) { $option.attr('disabled','disabled') }
				
				// CHILD ELEMENTS --------------------------------------------------------
				// once nested elements get built below, insertNestedSet adds element to container
				var insertNestedSet = function($nestedElement) {
					
					$nestedElement.attr('class',_this.settings.class_nestedSet)
						.hide()
						.appendTo($formItem);

					// bind option to its nestedSet for to find later on click event
					$option.data('nestedSet',$nestedElement);														
				};
											
				// if option has children, create nested items then append to container div
				if ( option.children !== undefined ) {
					
					// create nested group container
					var $nestedGroup = $('<div/>');
					
					// loop through items in children arrays and add to group
					$.each(option.children, function(index,item) {
						$nestedGroup.append(_this.buildItem(item));
					});

					// add nested group to parent container
					insertNestedSet($nestedGroup);
					 
				// or if option has single child
				} else if ( option.child !== undefined ) {

					// create nested items 
					var $nestedItem = _this.buildItem(option.child);

					// add nested item to parent container
					insertNestedSet($nestedItem);
				} 						

				// apply selected state	and display nestedSet for selected item
				if ( option.on === true ) { 
					$option.attr('selected','selected'); 
					if ( $option.data('nestedSet') !== undefined ) { $option.data('nestedSet').show(); }
				}

			});
			return $formItem;

		},
		buildClickset : function(item) {

			var _this = this;
			var $list = $('<div/>').attr('class',this.settings.class_clickset);
			
			// add min required to element 
			if ( item.properties.minRequired !== undefined && item.properties.minRequired !== null ) {
				$list.data('minRequired',item.properties.minRequired);
			}
			
			// @fix - ??? used?
			if ( item.label ) {
				$('<div/>', { html:item.label }).addClass('header')
					.appendTo($list);
			}
            // console.log('iterm',item);
            // console.log('iterm.options',item["options"]);
			// debugger;
			
			$.each(item.options,function(index,option) {

				// create input and bind click event 
				var $option = $('<input/>', { type:item.type } )
					.click(function() {
						var $this = $(this);

						// maxSelectable validation for checkboxes
						if ( item.type === 'checkbox' && item.properties.maxSelectable !== undefined 
							&& item.properties.maxSelectable !== null && item.properties.maxSelectable > 0 ) {
							
							// find qty selected (need to traverse to inputs with nestedSets differently because of the common container s)
							var qtySelected = $list.children('label').find('input:checked')
								.add( $list.children('.' + _this.settings.class_hasNested).children('label').find('input:checked') )
								.length;

							// if qtySelected is higher than max limit
							// @fix integrate msg with buildErrorMsg method
							if ( qtySelected > item.properties.maxSelectable ) {
								$option.prop('checked',false);
								alert('you can only select a maximum of ' + item.properties.maxSelectable + ' item(s).' );
								return false;
							}
						}

						// toggle hide/showing of nested elements if hideNested is true
						if ( item.properties.hideNested === true ) {
						
							// find if option has nested selections
							var $nextElement = $this.closest('label').next('.' + _this.settings.class_nestedSet);

							// if checkbox and nextElement exists, hide/show nested item
							if ( item.type === 'checkbox' && $nextElement.length > 0 ) { $nextElement.toggle();	}	

							// if radio, hide all others before showing
							else if ( item.type === 'radio' ) {

								// if no nested element or if nested element is hidden, hide all other nested elements
								if ( $nextElement.length === 0 || $nextElement.is(':hidden') ) {
									$this.closest('.' + _this.settings.class_formItem)
										.children().children('div')
										.children('.' + _this.settings.class_nestedSet).hide();								
								}

								// if nested element is hidden, show it
								if ( $nextElement.is(':hidden') ) { $nextElement.show(); } 
							}
						}
					});

				// apply option attributes
				if ( option.on === true ) { $option.attr('checked','checked') }				
				if ( item.type === 'radio' ) { $option.attr('name',item.properties.name) }
				
				// create label
				var $label = $('<label/>', { html:'<span>' + option.label + '</span>' })
					.prepend($option);
					
				// CHILD ELEMENTS --------------------------------------------------------
				// once nested elements get built below, insertNestedSet adds element to container
				var insertNestedSet = function($nestedElement) {
					// hide nested items if option is active
					if ( item.properties.hideNested === true && ( option.on === undefined || option.on !== true )  ) { 
						$nestedElement.hide(); 
					}

					// create container to wrap label and its nested set and append to option list
					$('<div/>').attr('class',_this.settings.class_hasNested)
						.append($label)
						.append($nestedElement)
						.appendTo($list);
				};

					
				// if option has children, run buildItem() for each item & append to container
				if ( option.children !== undefined ) {

					var $nestedGroup = $('<div/>').attr('class',_this.settings.class_nestedSet);

					// create nested items from children 
					$.each(option.children, function(index,item) {
						$nestedGroup.append( _this.buildItem(item) );
					});

					// add nested set to option container
					insertNestedSet($nestedGroup);
						
				} else if ( option.child !== undefined ) {

					// sets nested flag to true, next time formrow is created, will apply a nested class
					// need to do this because this.buildItem method below calls this.buildFormRow, which needs this flag, 
					// but we don't want to have to pass the state through the functions
					// @fix - how do we do this without the global variable?  Just pass it through the model?  What is better practice?
					_this.setNested = true;
					
					// create nested items by recursively looping through buildItem
					var $nestedItem = _this.buildItem(option.child);

					// revert this global value back to false after nested sets are built 
					_this.setNested = false;
					
					// add nested set to option container
					insertNestedSet($nestedItem);

				// NO CHILDREN if option has no child/children, just add label and option to option list
				} else {
					// _this.setNested = false;  // @fix - where should this state change happen, on the else or after it's done
					$list.append($label);												
				}		
			});
			
			if ( jQuery.fn.typeAhead && item.properties.typeahead === true ){
				$list.typeAhead({ insertType:'prependTo' });
			}
			
			return $list; 			
		},
		addTextFocusKeyEvents : function($input) {
			var _this = this;
						
			$input.keydown(function(event){  

				var errorType = null;
				var limit = null;
				
				// remove any existing error messages
				$input.next('.'+_this.settings.class_itemErrorMsg).remove();				

				// Always Allow backspace and delete
		        if ( event.keyCode == 46 || event.keyCode == 8 ) { // do nothing
				
				// KEYPRESS VALIDATION, also done on submit in case of text pasted in
				// Ensure not more than maxCharacters are entered 
				} else if ( $input.data('maxChar') && $input.val().length + 1 === $input.data('maxChar') ) {
					errorType = 'maxChar';
					limit = $input.data('maxChar');

				// if numeric only	
		        // } else if ( $input.data('validate') === 'numeric' && ( event.keyCode < 48 || event.keyCode > 57 ) ) { 
				// 	errorType = 'notANumber';
		        } 

				// if error on keypress, do this
				if ( errorType !== null ) {
					event.preventDefault();
					var $errorMsg = _this.buildErrorMsg(errorType,limit);
					$errorMsg.insertAfter($input);
					// fade out errorMsg after a certain time frame
					setTimeout(function() { $errorMsg.fadeOut(500,function() { $(this).remove(); }); },2000);
				
				// if no errors and enter key was pressed, submit form
				} else if ( event.keyCode === 13 ) {
					_this.$submitButton.click();
				}
			});
		},
		addProperties : function($element) {

			// common attributes
			if ( this.properties.type && this.properties.type !== 'textarea' ) { $element.attr('type',this.properties.type) }
			if ( this.properties.name ) { $element.attr('name',this.properties.name); }
			if ( this.properties.className ) { $element.addClass(this.properties.className); }
			if ( this.properties.id ) { $element.attr('id',this.properties.id); }
			if ( this.properties.title ) { $element.attr('title',this.properties.title); }
			if ( this.properties.disabled === true || this.properties.disabled === 'disabled' ) 
				{ $element.attr('disabled','disabled'); }			

			// for text elements only
			if ( $element.is('input[type="text"]') || $element.is('textarea')) {
				if ( this.properties.validate ) { $element.data('validate',this.properties.validate);  }
				if ( this.properties.maxChar ) { $element.data('maxChar',this.properties.maxChar);  }

				if ( this.properties.value ) { $element.val(this.properties.value); }
				if ( this.properties.placeholder ) { $element.attr('placeholder',this.properties.placeholder); }
				
				// required accepted for select and radio as well, but applied differently than text inputs
				if ( this.properties.required === true || this.properties.required === 'required' )  
					{ $element.attr('required','required'); }	
			}

			// for select elements only
			if ( $element.is('select') ) {
				if ( this.properties.multiple ) { $element.attr('multiple','multiple'); }
				if ( this.properties.size && this.properties.multiple === true ) { $element.attr('size',this.properties.size); }
				if ( this.properties.required === true ) { $element.data('required',true); }				
			}
		},
		createFormRow : function(type) {
			var $formrow = $('<div/>').attr('class',this.settings.class_formItem + ' clr')
			if ( this.properties.label ) {  
			    var $label = $('<label/>', { html:this.properties.label }).appendTo($formrow);  
			    if ( type === 'checkbox' || type === 'radio' ) { $label.addClass(this.settings.class_clicksetHeader); }
			}

			// check if currently building nested element
			if ( this.setNested === true ) { $formrow.addClass(this.settings.class_nestedSet); }		
			
			return $formrow;
		},
		buildSubmitActions : function() {

			var _this = this;
			
			var $submitActions = $('<div/>').attr('class',this.settings.class_submitActions + ' clr')

			// add submit button
			this.$submitButton = $('<button/>', { type:'button', html:this.settings.text_submitButton })
				.attr('class', this.settings.class_submitButton)
				.click(function(){  _this.validateForm(); return false;  })
				.appendTo($submitActions);

			// add clear button			
			if ( this.settings.addClearButton === true ) {
				$('<button/>', { type:'button', html:this.settings.text_clearButton })
					.attr('class', this.settings.class_clearButton)
					.click(function(){
						_this.resetErrorStates();
						_this.$form
							.find('input').val('').end()
							.find('textarea').val('');	
						return false;						
					})
					.appendTo($submitActions);
			}

			// add cancel button
			if ( this.settings.addCancelButton === true ) {	
				$('<button/>', { type:'button', html:this.settings.text_cancelButton })
					.attr('class',this.settings.class_cancelButton)
					.click(function() {
						_this.settings.cancelButtonCallback(_this);
						return false;
					})
					.appendTo($submitActions);
			}			
			return $submitActions;
		},
		resetErrorStates : function() {
			this.$form
				.removeClass( this.settings.class_errorState )
				.find('.' + this.settings.class_errorState).removeClass(this.settings.class_errorState).end()
				.find('.' + this.settings.class_itemErrorMsg).remove().end()
				.find('.' + this.settings.class_formErrorMsg).remove();			
		},
		buildErrorMsg : function(errorType,limit) {

			var html = this.settings['errormsg_' + errorType];

			// text replace %limit% with number passed into message @fix : too specific 
			if ( limit !== undefined && limit !== null ) {  html = html.replace('%limit%',limit );  }
			
			return $('<div/>', { html: html })
				.attr('class', this.settings.class_itemErrorMsg);	
		},
		validateForm : function() {

			var _this = this;
			var inputVals = {};
			var formErrors = false;

			this.resetErrorStates();

			// iterate through input and textarea elements to test for errors
			// -- TEXT and TEXTAREA form validation
			this.$form.find('input[type="text"]:visible')
				.add(this.$form.find('textarea:visible'))
				.each(function(){
					var $input = $(this);
					var itemHasError = false;
					var errorType = null;
					var limit = null;

					// -- VALIDATION RULES: Checks all test conditions and sets error type -----------------
					// if multiple rules apply, only sets errorType for first fail condition

					// required field 
					if ( $input.attr('required') === 'required' && ( $input.val() === '' || $input.val() === $input.attr('placeholder') ) ) { 
						errorType = 'requiredField'; 
					
					// THESE next two are run on keydown event as well, but done here in case the text is pasted in
					// Ensure not more than maxCharacters are entered 
					} else if ( $input.data('maxChar') && $input.val().length + 1 > $input.data('maxChar') ) {
						errorType = 'maxChar';
						limit = $input.data('maxChar');

					// not a number
					} else if ( $input.data('validate') === 'numeric' && isNaN($input.val()) ) {
						errorType = 'notANumber';
					}
					// -- end validation checks -------------------------------------------------------------
					
					// IF ITEM HAS ERROR : adds error classes and messaging, and applies form level error state							
					if ( errorType !== null ) { 
						$input.parent().addClass(_this.settings.class_errorState);
						_this.buildErrorMsg(errorType,limit).insertAfter($input);
						formErrors = true; 
					
					// IF ITEM HAS NO ERROR, add input name:value data to inputVals object 
					} else if ( $input.val() !== '' ) {  inputVals[$input.attr('name')] = $input.val();  };
				});
				
			// -- CHECKBOX validation ------------------------------------------------
			this.$form.find('.' + this.settings.class_clickset + ':visible')
				.each(function(){
					var $clickset = $(this);
					var errorType = null;
					var limit = null;
					
					// get number of options selected and min required
					// find qty selected (need to traverse to inputs with nestedSets differently because of the common containers )
					var optionsSelected = $clickset.children('label').find('input:checked')
						.add( $clickset.children('.' + _this.settings.class_hasNested).children('label').find('input:checked')  )
						.length;
						
					var minRequired = $clickset.data('minRequired');
					
					// min required validation
					if ( minRequired !== undefined && minRequired !== null &&  optionsSelected < minRequired ) {
						errorType = 'notEnoughSelected';
						var limit = minRequired;
					} 
					
					if ( errorType !== null ) {
						$clickset.addClass(_this.settings.class_errorState);
						_this.buildErrorMsg(errorType,limit).prependTo($clickset);
						formErrors = true;
					} else {
						console.log('need to add checkboxes to post');
					}
					
				});
				
			// -- SELECT validation ------------------------------------------------
			this.$form.find('select:visible').each(function() {
				var $select = $(this);
				var errorType = null;
				var limit = null;
				
				var selectedVal = $select.find('option:selected').val();
				
				if ( selectedVal === 'unselected' && $select.data('required') === true ) {
					errorType = 'requiredField';
				} else if ( selectedVal !== null && selectedVal !== undefined && selectedVal !== 'unselected' ) {
					inputVals[$select.attr('name')] = selectedVal;
				}
				
				if ( errorType !== null) { 
					$select.parent().addClass(_this.settings.class_errorState);
					_this.buildErrorMsg(errorType).insertAfter($select);
					formErrors = true;
				}
				
			})

			// -- IF FORM HAS ERRORS : test if form passed validation & return callback for success or error
			if ( formErrors === true ) {  
				
				// add error class to form
				this.$form.addClass(this.settings.class_errorState);

				// add form level error message
				if ( this.settings.addFormLevelErrorMsg === true ) {
					
					// if the form has a header, put form level error after header
					var $formHeader = this.$form.children(this.settings.elementType_formHeader);
					if ( $formHeader.length === 1 ) {  this.buildErrorMsg('formMsg').insertAfter($formHeader);  } 
				
					// otherwise, prepend to top of form
					else {  this.$form.prepend( _this.buildErrorMsg('formMsg'));  }
				}
				
				// error callback
				this.settings.submitErrorCallback(); 

			// IF FORM HAS NO ERRORS - success callback with inputValue object
			} else {  
				this.settings.submitSuccessCallback(inputVals);  
				if ( this.settings.clearOnSubmitSuccess === true ) {
					this.$form.find('input:text')
						.add(this.$form.find('textarea'))
						.val('');
				}
			}
		}
	};
	
	$.fn.buildMeAFormOrSomething = function(options) {
		
		var settings = {
			
			// form defaults
			buildType : 'form',   // 'form', 'group' or 'item' - defaults to 'form' if no value supplied
			formID : null,
			addClearButton : true,
			addCancelButton: false,
			clearOnSubmitSuccess : true,
			addFormLevelErrorMsg : true,

			// callbacks
			initCallback : function() {},
			submitSuccessCallback : function(data){},
			submitErrorCallback : function(){},
			cancelButtonCallback : function() {instance},

			// default markup elements
			elementType_formHeader : 'h3',
			elementType_groupContainer : 'fieldset',
			elementType_groupHeader : 'legend',
			
			// classes
			class_form : 'form',
			class_formItem : 'formitem',
			class_errorState : 'error',
			class_itemErrorMsg : 'errorMsg',
			class_formErrorMsg : 'formErrorMsg',
			class_submitActions : 'submitActions',		
			class_submitButton : 'submit',
			class_clearButton : 'clear',
			class_nestedSet : 'nested',
			class_clicksetHeader : 'clicksetHeader',
			class_cancelButton: 'cancel',
			class_guideline: 'guideline',
			class_hasNested: 'hasNested',
			class_clickset: 'clickset',

			// form text
			text_submitButton : 'Submit',
			text_clearButton : 'Clear',
			text_cancelButton: 'Cancel',
			
			// error messaging
			errormsg_formMsg : 'Please check the items below',
			errormsg_requiredField : 'This field is required',
			errormsg_notEnoughSelected : 'You must select at least <strong>%limit%</strong> item(s)',
			errormsg_maxChar : 'Phrase can only be <strong>%limit%</strong> characters long.',
			errormsg_notANumber : 'Gotta be a number yo'
		};

		return this.each(function(){
			if ( options ) { $.extend(settings,options); }
			var newForm = new $.FormBuilder($(this), settings);
		});
	};
	
})(jQuery);