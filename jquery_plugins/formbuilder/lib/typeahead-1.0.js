(function() {
	
	/* removes beginning and trailing characters */
    function trim(str) {  return str.replace(/^\s+|\s+$/g,"");  }
		
	$.fn.typeAhead = function(options) {
		var settings = {
		    addClearButton : true,
			placeholderMessage:'Filter List',
			insertType: 'insertBefore'  // either prependTo or insertBefore
		};	
		
		return this.each(function() {
			
			if ( options ) { $.extend(settings,options); }
			
			var $options = $(this);
			
			var $container = $('<div/>',{ 'class':'typeahead' })
				.append(
					$('<input/>', { type:'text'}).attr('placeholder',settings.placeholderMessage)
						.bind('keyup', function(e) {
							var $input = $(this);

                            // get typed in value, and # of characters 
                            var value = $input.val();
							var characters = value.length; 

                            // get regex version of input value to match to options
							var regExpValue = new RegExp(value,"gi");

							// find and hide all options initially (then re-display matches)
							$options.find('label').hide().each(function(){
								var $label = $(this);
								
								// get value of option items, trim first and last spaces if exist
								var itemText = trim( $label.find('span').text() );

                                // take only same amount of characters at the beginning of the word as in the input
                                // (so we don't match to the middle of the word)
								var matchableCharacters = itemText.slice(0,characters);

                                // if same first characters in option match regex value, display this option
								if ( matchableCharacters.match(regExpValue) !== null || value === '' ) { 
									$label.show(); 
								}								
							});
						})			
				);
				
				if ( settings.addClearButton === true ) {
    				$container.append(
                        // add clear button
    					$('<a/>', { href:'#', 'class':'clear', text:'clear' })
    						.click(function() {
    							$container.find('input').val('');
    							$options.find('label').show();
    						})
    				);
				}
				
				switch(settings.insertType) {
				    case 'insertBefore': 
    				    $container.insertBefore($options);
				        break;
				    case 'prependTo': 
    				    $container.prependTo($options);
        				break;
				}
				
		});	
	};
		
})(jQuery);
