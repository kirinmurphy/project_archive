//////////////////////////////////////////////////////
//// 
////  $.tooltip();
////   author: Kirin Murphy, www.codethings.net 
////   
//////////////////////////////////////////////////////


$.fn.tooltip = function(options) {
		
	var settings = {
		// configuration
		triggerEvent : 'mouseenter',  // 'click' or 'mouseenter'
		$tooltipDOMElement: null,  	// HTML DOM element already loaded on page 
		tooltipURL: null,         	// -OR- Ajax URL for dynamically loaded content 
		ajaxLoadType: 'html',   	// 'html', 'JSON' or 'image' required for tooltipURL 
		buildItemsFromJSON : function(data) {}, // required for JSON, must return HTML string or jQuery DOM Object 

		// classes
		commonTooltipClass: 'tooltip', 	// tooltip group that hides all other common tooltips on trigger event
		uniqueTooltipClass : null,  	// unqie class to style tooltips differently if part of same tooltip group 
		indicatorClass: 'loading', 		// apply class to trigger during its load delay 

		// position adjustments
		addedHorizOffset: 10,   	// Horizontal Distance Away(+) or Closer(-) to trigger 
		addedTopOffset: -15,    	// Vertical distance Down (+) or Up (-) from top of trigger 
		topGutter : 15,				// Minimum space between tooltip and top of screen 
		bottomGutter: 10,       	// Minimum space between tooltip and bottom of screen 
		horizGutter: 10,        	// Minimum space between tooltip and L/R edge of screen 
		setToOverflow: true,		// sets max height of tooltip to max window height (minus top & bottom gutters)
		setToFixedPosition: false,	// sets tooltip fixed on the screen (true) fixed on the page (false) 
		
		// time values
		loadDelay: 500,			// time between trigger event and tooltip getting loaded 
		displayTime: 1000,  	// time tooltip gets displayed after the mouse leaves the trigger or tooltip
		fadeOutSpeed: 300 		// time to fade out tooltip 
	};

	return this.each(function() {

	    if (options) { $.extend(settings, options) };

		var $trigger = $(this);

		// setTimeouts assiged to these variables, used to apply clearTimeout to them after certain events
	    var displayTimeout = null;
		var hideTimeout = null;

		// fn to hide tooltip after the alloted display time.  
		var hideTooltip = function($element) {
			hideTimeout = setTimeout(function() {
				$element.stop(true,true).fadeOut(settings.fadeOutSpeed);
			},settings.displayTime)
		};

		// for either triggerEvent, mouse-ing back over the trigger clears the existing hide timeout
		$trigger.bind('mouseenter', function() {
			if ( hideTimeout !== null ) { clearTimeout(hideTimeout);  }							
		});

		// bind trigger element with trigger event of mouseenter or click 
		$trigger.bind(settings.triggerEvent, function() {

			// find currently displayed tooltip if one exists
			var $activeTooltip = $('.' + settings.commonTooltipClass + ':visible');
		
			// if trigger tooltip is the same as active tooltip, exit out of function
			if  ( $activeTooltip.length > 0 && $trigger.data('tooltip') !== undefined 
				&& $activeTooltip[0] === $trigger.data('tooltip')[0] ) {
					return;
			} 
		
			// add highlight class to trigger
			$trigger.addClass(settings.indicatorClass);
			
			// set load delay, if mouseenter load delay is passed from settings, if click, load delay is none
			var loadDelay = ( settings.triggerEvent === 'mouseenter' ) ? settings.loadDelay : 0 ;
		
			// display tooltip functions run after delay, timeout gets cancelled on mouseleave
	        displayTimeout = setTimeout(function() {

				// once tooltip is BUILT or FOUND below, display it
	            var displayTooltip = function($tooltip) {

	                // tooltip gets appended to body before being positioned so we can access its width/height properties
					$tooltip.hide().appendTo($('body'));

	                /* X Positioning */
	                var tooltipWidth = parseInt($tooltip.outerWidth(true));
	                var windowWidth = parseInt($(window).width());
	                var leftOffset = parseInt($trigger.offset().left);
	                var dynamicLeftPosition = leftOffset - tooltipWidth - settings.addedHorizOffset;
	                var leftPosition = (dynamicLeftPosition > settings.horizGutter) ? dynamicLeftPosition : settings.horizGutter;
	                var dynamicRightPosition = leftOffset + $trigger.outerWidth(true) + settings.addedHorizOffset;
	                var maxRightPosition = windowWidth - tooltipWidth - settings.horizGutter;
	                var rightPosition = (dynamicRightPosition + tooltipWidth + settings.horizGutter < windowWidth) 
						? dynamicRightPosition : maxRightPosition;
	                var xPosition = (leftOffset - settings.addedHorizOffset > windowWidth - dynamicRightPosition) 
						? leftPosition : rightPosition;

	                /* Y Positioning */
	                var tooltipHeight = parseInt($tooltip.outerHeight(true));
	                var yOffset = parseInt($trigger.offset().top + settings.addedTopOffset);
	                var yScrollOffset = parseInt($(window).scrollTop());
	                var windowHeight = parseInt($(window).height());
	                var bottomVerticalOffset = tooltipHeight + yOffset;
	                var maxYPosition = yScrollOffset + windowHeight - tooltipHeight - settings.bottomGutter;
	                var yPosition = (yScrollOffset + windowHeight > bottomVerticalOffset + settings.bottomGutter) 
						? yOffset : maxYPosition;

					// if fixed to screen, we have to subtract scrollTop height from top positioned height
					// @fix - a little reversed to add the value first and then subtract later, needs cleanup
					if ( settings.setToFixedPosition ) { yPosition -= yScrollOffset }

					// if yPosition is less than topGutter, make yPosition same as topGutter
					yPosition = ( yPosition > settings.topGutter ) ? yPosition : settings.topGutter;

					// get vertical height values of padding and border 
					var verticalHeightAdjustment = parseInt($tooltip.css('padding-top')) 
						+ parseInt($tooltip.css('padding-bottom'))
						+ parseInt($tooltip.css('border-bottom-width'))
						+ parseInt($tooltip.css('border-top-width'));
				
					// if tooltip is larger than window size and setToOverflow is true - resize height and apply overflow
					var availableHeight = windowHeight - settings.bottomGutter - settings.topGutter;
					if ( settings.setToOverflow === true ) {
						$tooltip.css({ 
							'max-height':availableHeight - verticalHeightAdjustment,
							'overflow-y':'auto',
							'overflow-x':'hidden'   
						});
					} 
				
					// if active tooltip is currently displayed, hide it
					if  ( $activeTooltip.length > 0 ) { $activeTooltip.hide();  }
					
					// set CSS position as absolute or fixed.
					var CSSposition = ( settings.setToFixedPosition === false ) ? 'absolute' : 'fixed';
				


					// add positioning, fadeIn tooltip, and bind hover events
	                $tooltip.css({ position:CSSposition, top: yPosition + 'px', left: xPosition + 'px' })
						.fadeIn(100, function(){
							// removes loading class from trigger after fade is done
							$trigger.removeClass(settings.indicatorClass);
						})
	                    .mouseenter(function() {
							if ( hideTimeout !== null ) { clearTimeout(hideTimeout); }
	                        $tooltip.stop(true, true).show();
	                    }).mouseleave(function() {
							clearTimeout(hideTimeout);
	                        hideTooltip($tooltip);
	                    });
	            };

				// once tooltip gets assigned below, sets up tooltip with user properties and runs display function
				var prepareNewTooltip = function($tooltip, $trigger) {
				
					$tooltip.addClass(settings.commonTooltipClass);
					
					// add optional unique class to tooltip 
					if ( settings.uniqueTooltipClass ) { $tooltip.addClass(settings.uniqueTooltipClass); }

					// bind elements together so they can get to each other later
					$tooltip.data('cell', $trigger)
			        $trigger.data('tooltip', $tooltip);

			        displayTooltip($tooltip);
				};	                    

	            /* -- FIND or BUILD TOOLTIP from trigger ------------------------------------- */
				/* if tooltip already exists */
	            if ($trigger.data('tooltip') !== undefined) {  

	                displayTooltip($trigger.data('tooltip'));

				/* or if DOM element */
	            } else if (settings.$tooltipDOMElement !== null && settings.$tooltipDOMElement !== undefined ) {  	
					prepareNewTooltip(settings.$tooltipDOMElement, $trigger);

				// or if ajax
				} else if ( settings.tooltipURL && settings.tooltipURL !== '' )  {
					
					var $tooltip = $('<div/>');
					
					switch (settings.ajaxLoadType) {
						case 'html' : 
							// load external html and run success function
			                $tooltip.extendedload(settings.tooltipURL, function() {
								// if no html gets loaded, revert state 
								if ($tooltip.html() === '') {
			                    	$trigger.removeClass(settings.indicatorClass);
			                        $tooltip.remove();

								// or display tooltip
								} else {  prepareNewTooltip($tooltip, $trigger);  }

							}, { queueName: 'hoverbox' });
							break;

						case 'image' : 
							$('<img/>').attr('src',settings.tooltipURL)
								.load(function() {  
									$(this).appendTo($tooltip); 						
									prepareNewTooltip($tooltip,$trigger);
								});
							break;

						case 'json' : 
							$.ajax({
								type: "GET",
								url: settings.tooltipURL,
								dataType: "json",
								success: function (data) {
									// use external callback function that accepts JSON and returns markup and append to $tooltip
									$tooltip.append(settings.buildItemsFromJSON(data));
									prepareNewTooltip($tooltip, $trigger);
								}
							});
							break;
					}

				// or if nothing gets loaded 
				} else { return false; }
				/* -------------------------------------------------------------------------- */

	        }, loadDelay);
	
			// need to return false if triggerEvent is click
			return false;

	    }).mouseleave(function() {

			// clear any timeout of tooltips waiting to be displayed
			clearTimeout(displayTimeout);

			$trigger.removeClass(settings.indicatorClass);

			// if tooltip exists, set to hide
			if ( $trigger.data('tooltip') !== undefined ) {  hideTooltip($trigger.data('tooltip'));  }
	    });

	});

};


