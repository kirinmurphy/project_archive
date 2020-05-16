//////////////////////////////////////////////////////
//// 
////  $.StretchyScroller();
////  $().colorizeList();
////   author: Kirin Murphy, www.codethings.net 
////   
//////////////////////////////////////////////////////

(function($) {
	
	$.fn.colorizeList = function(colorSetting) {

		return this.each(function() {

			var shadeNum = (colorSetting === 'dark' ? 0 : (colorSetting === 'light') ? 2 : 1)

			var firstRedDigit = shadeNum;
			var firstGreenDigit = shadeNum;
			var firstBlueDigit = shadeNum;

			if ( colorSetting === 'lightRed' ) { firstRedDigit++; }
			else if ( colorSetting === 'lightGreen' ) { firstGreenDigit++ }
			else if ( colorSetting === 'lightBlue' ) { firstBlueDigit++ }
			else if ( colorSetting === 'red' ) { firstRedDigit++; firstGreenDigit--; firstBlueDigit--; }
			else if ( colorSetting === 'green' ) { firstGreenDigit++; firstRedDigit--; firstBlueDigit--; }
			else if ( colorSetting === 'blue' ) { firstBlueDigit++; firstRedDigit--; firstGreenDigit--; }
			else if ( colorSetting === 'darkRed') { firstGreenDigit--; firstBlueDigit--; }
			else if ( colorSetting === 'darkGreen') { firstRedDigit--; firstBlueDigit--; }
			else if ( colorSetting === 'darkBlue' ) { firstRedDigit--; firstGreenDigit--; }

			var getRandomNumber = function(digits) {
				return (Math.random()*1000000 + '').substring(0,digits);
			};

			$(this).children().each(function() {							
				var RGB = 'rgb(' + firstRedDigit + '' + getRandomNumber(2) + ' ,' 
					+ firstGreenDigit + '' + getRandomNumber(2) + ' ,' 
					+ firstBlueDigit + '' + getRandomNumber(2) + ')'
				$(this).css('backgroundColor', RGB);	
			});													
			
		});
	};
	
})(jQuery);