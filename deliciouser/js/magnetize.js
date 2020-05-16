(function($) {

    $.fn.magnetize = function(options) {

        var settings = {
            magnetSelector: null,
            headerSelector: null,
            magnetJump: 10
        };

        return this.each(function() {

            if (options) { $.extend(settings, options); };
            
			// container that includes magnet and optional header
            var $parent = $(this);

			var $header = settings.headerSelector !== null ? $parent.find(settings.headerSelector) : null;

            var $magnet = $parent.find(settings.magnetSelector);
            var magnetOffset = parseInt($magnet.offset().top);
			
			// wrap the magnet in an outer container
			// we will use this to preserve the magnet space in the parent container when the magnetInner is docked
			$magnet.wrap('<div/>');
			var $magnetWrapper = $magnet.parent();

			// gets left and right offset of magnet parent so we can set the left right positioning of the docked element
			var getMagnetOffset = function(){
				var windowWidth = parseInt($(window).width());
				var magnetWidth = $parent.outerWidth();
	            var magnetLeftOffset = parseInt($parent.offset().left);
	
				return {
					left : parseInt($magnet.offset().left),
		            right : windowWidth - (magnetLeftOffset + parseInt(magnetWidth))
				};
			};

            $(window).scroll(function() {

                var $window = $(this);
                var windowTopOffset = $window.scrollTop();

				// if header !== null, baseline height is header height, if null, is 0 (top of window)
                var baselineHeight = ($header === null || !$header.hasClass('docked')) ? 0 : $header.outerHeight(true);

				// differential is offset height when docking should start
                var differential = magnetOffset - baselineHeight;

				// if window offset plus jump height is greater than magnet offset minus the baseline height
                if ((windowTopOffset + settings.magnetJump) > differential) {
                    if (!$magnet.hasClass('docked') && $magnet.is(':visible')) {
                        
						// set height of wrapper to  so content below stays in same place
						$magnetWrapper.css('height',$magnet.outerHeight(true) + 'px');
                        
						// class used to assign status and use for any style changes 
						$magnet.addClass('docked');

						// get magnet left and right offsets for positioning
						var offset = getMagnetOffset();

                        $magnet.css({
                            'position': 'fixed',
                            'top': baselineHeight,
                            'left': offset.left + 'px',
                            'right': offset.right + 'px',
                            'z-index': 10000000,
							'width': 'auto'
                        });
                    };
                } else {
                    $magnet.removeClass('docked').css({ 'position': 'static', 'width': 'auto' });
                    $magnetWrapper.css('height', $magnet.is(':visible') ? $magnet.outerHeight(true) : 'auto');
                }
            })
			.resize(function() {
				
				// if magnetInner has class docked, on window resize update left/right positioning of magnet
				if ( $magnet.hasClass('docked') ) {
					var offset = getMagnetOffset();
					$magnet.css({
						left : offset.left + 'px',
						right: offset.right + 'px'
					});
				}
			});
        });
    }

})(jQuery);