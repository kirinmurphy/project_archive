//////////////////////////////////////////////////////
//// 
////  $().dropDown();
////   author: Kirin Murphy, www.codethings.net 
////   
//////////////////////////////////////////////////////

(function($) {

    $.fn.dropDown = function(options) {

        var settings = {
            trigger: 'click',						// click or mouseenter
			selector_dropdownGroup : '.dropdownGroup',		// group of dropdowns that have hover 
            displayType: 'show',  						// show or fadeIn 
			fitToScreen: true,  						// if true, shrinks to avaialbe height and adds scrollbars
			spaceFromDropdownToTrigger:5,				// additional px spacing between elements
            fadeInSpeed: 40,
            fadeOutSpeed: 40,
            
            gutter_leftRight: 5
        }

        return this.each(function() {
            if (options) { $.extend(settings, options) };

            var $dropDown = $(this);
            var $dropDownTrigger = $dropDown.find('dt');
            var $dropDownWindow = $dropDown.find('dd');

            var activateDD = function() { // activate dropdown
                // Height of dropdown page elements
                var dropDownOffset = parseInt($dropDown.offset().top);
                var dropDownTriggerHeight = parseInt($dropDownTrigger.outerHeight(true));
                var windowHeight = $(window).height();

                // determine if position should be above or below
                var setBelow = (windowHeight * .70 > dropDownOffset) ? true : false;
                var topPositioning = (setBelow === true) ? dropDownTriggerHeight + settings.spaceFromDropdownToTrigger : 'auto';
                var bottomPositioning = (setBelow === true) ? 'auto' : dropDownTriggerHeight + settings.spaceFromDropdownToTrigger;
                $dropDownWindow.css({ 'top': topPositioning, 'bottom': bottomPositioning });				

                // If height exceeds max size of so long list doesn't scroll off the page
				if ( settings.fitToScreen === true ) {
	                var belowMaxHeight = windowHeight - dropDownOffset - dropDownTriggerHeight - 20;
	                var aboveMaxHeight = dropDownOffset - $(window).scrollTop() - 15;
	                var maxHeight = (setBelow === true) ? belowMaxHeight : aboveMaxHeight;
	                $dropDownWindow.css({ 'overflow': 'auto', 'max-height': maxHeight });
				}
				
				// -- Left Right Rules ------------------------------------------ //
			
			    // we have to show but not show bc offset works differently.  
				$dropDownWindow.css('visibility','hidden').show();

                // LR Stuff
                var leftOffset = $dropDownWindow.offset().left;
                
                if ( leftOffset < settings.gutter_leftRight ) { 
                    var leftCSS = $dropDownWindow.css('left').replace('px','');
                    if ( leftCSS !== 'auto' ) {
                        var adjustedMargin = settings.gutter_leftRight - leftOffset;
                        $dropDownWindow.css('margin-left',adjustedMargin);                        
                    }
                }
                
                var rightOffset = leftOffset + $dropDownWindow.outerWidth(true); 
                var dropDownWindowWidth = $dropDownWindow.width();
                var windowWidth = $(window).width();

                if ( rightOffset > windowWidth - settings.gutter_leftRight ) {
                    var rightCSS = $dropDownWindow.css('right').replace('px','');
                    if ( rightCSS !== 'auto' ) {
                        var adjustedMargin = settings.gutter_leftRight - ( windowWidth - rightOffset);
                        $dropDownWindow.css('margin-right', adjustedMargin);
                    }
                }

                $dropDown.addClass('on')
                $dropDownWindow.stop(true, true).css('visibility','visible');
            }

            var closeOpenDD = function() { //hide other menus
                // @fix - scope this to only dropdown dl's
				$('dl.on').removeClass('on').find('dd').hide(); 
            }

            var deactivateDD = function() {  // hide current menu
				$dropDownWindow.stop(true, true).delay(500)
					.fadeOut(settings.fadeOutSpeed, function() {
						$(this).closest('dl').removeClass('on');
					});
            }

			// trigger dropdown 
            $dropDownTrigger.live(settings.trigger, function() {
                var $this = $(this);

                if (!$this.hasClass('disabled') && $this.next().is('dd')) {
                    if (!$this.closest('dl').hasClass('on')) {  
						closeOpenDD();  
						activateDD();  
					} else {  deactivateDD();  }
                    return false;
                }
            });

            // hover over trigger, if within a parentDropDownGroup  becomes click instead of mouseover 
            $dropDownTrigger.mouseenter(function() {
                var $this = $(this);

				var $parentDropDownGroup = $this.closest(settings.selector_dropdownGroup);
                if ( $parentDropDownGroup.length > 0 && $parentDropDownGroup.find('dl.on').length > 0
					&& !$this.closest('dl').hasClass('on') && !$this.closest('dl').hasClass('disabled')) {
						closeOpenDD();  
						activateDD();
                }
            });

            // deactivate after delay, if mouse leaves dropdown window
            $dropDown.mouseleave(function() {  deactivateDD();  });

            // deactivate dropdown if link in dd is clicked
            $dropDownWindow.find('a').live('click', function() {  deactivateDD();  });

            // reactivate dropdown if hovering back onto it
            $dropDownWindow.live('mouseenter', function() {  activateDD();  });		
        });
    };

})(jQuery);

$(document).ready(function(){
	$('.dropdownGroup dl, .dropdown').dropDown();
});