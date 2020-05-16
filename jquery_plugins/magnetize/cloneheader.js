(function($) {
	
	$.fn.cloneHeader = function(options) {
		
		var settings = {
			$appendTo : null,
			'callback': function() {}
		};
		

		return this.each(function() {
			if (options) { $.extend(settings,options) }

			var $this = $(this);
			var $thead = $this.find('thead');
			
			var $newTable = $('<table/>')
				.append($thead.clone())

				$thead.hide();
			
			// if settings.appendTo is declared, thead is inserted into appendTo container
			if ( settings.$appendTo !== undefined && settings.$appendTo !== null ) {
				$newTable.appendTo(settings.$appendTo)
			// if not, thead is insert before existing table
			} else {
				$newTable.insertBefore($this);				
			}
			
			//console.log('appendTo',settings.appendTo)
		});
	}
	
})(jQuery)