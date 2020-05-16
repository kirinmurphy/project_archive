
(function($) {
	
    // $.Class = function($parent,settings) {
    //  this.$parent = $parent;
    //  this.settings = settings;
    //  
    //  // do stuff...
    //  
    //  this.prototypeMethod(); 
    // };
    // 
    // $.Class.prototype = {
    //  prototypeMethod : function() {}
    // };

	$.fn.makeSomeDots = function(options) {
		
		var settings = {
		    stagger: true,
		    qty: 1400,
		    dotSize: 23,
		    leftSpacing: 16,
		    topSpacing: 11
		};
		
		return this.each(function() {
			if ( options ) { $.extend(settings,options); }
            var $container = $(this);
            var containerWidth = $container.outerWidth(true)
                - parseInt($container.css('margin-left'))
                - parseInt($container.css('margin-right'));

            var dotHorizSpace = settings.dotSize + settings.leftSpacing;
            var numberOfDotsInARow = parseInt( containerWidth / dotHorizSpace );
            
            var $wrapper = $('<div/>', { 'class':'clr' });

            for ( var i = 1; i <= settings.qty; i++ ) {
                var $em = $('<em/>')
                    .css('height',settings.dotSize + 'px')
                    .css('width', settings.dotSize + 'px')
                    .css('margin-right', settings.leftSpacing)
                    .css('margin-bottom', settings.topSpacing)
                    .appendTo($wrapper);

                if ( settings.stagger === true ) {
                    if ( i % ( numberOfDotsInARow) === 0  ) { $em.css('margin-right',0) }
                    if (i === 1 || i % ( numberOfDotsInARow * 2 ) === 1 ) { $em.css('margin-left',settings.leftSpacing);  }
                }
            }
            $wrapper.appendTo($container);
		});
	}
	
})(jQuery);


