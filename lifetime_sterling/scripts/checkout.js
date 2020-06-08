// JavaScript Document

(function($) {

	$.fn.fadeHide = function() {
		return this.each(function() {
					$(this).css({ opacity:1 }).animate({ opacity:0 }, 'fast', function() {    $(this).hide();    });
		});
	}	

	$.fn.fadeShow = function() {
		return this.each(function() {
					$(this).css({ opacity:0 }).show().animate({ opacity:1 });
		});
	}	

})(jQuery);



	//$('.shipto_multiple .select_address select').removeAttr("disabled");

var checkoutPages = { 
	cart: [false,false,false],
	billing_address: [true,false,false],
	shipping_address: [true,true,false],
	shipping_method: [true,true,false],
	payment_method:[true,true,true]
};


// -- Displays right hand modules on the page dynamically based on T/F of above data set.  
function showModules(loadPage) {

	var modules = checkoutPages[loadPage],
		order = $('#order_summary'),
		billing = $('#selected_billing'),
		shipping = $('#selected_shipping'),
		speed = 800,
		speed2 = 150;

	(modules[0] == true ) ? order.fadeIn(speed) : order.fadeOut(speed2);
	(modules[1] == true ) ? billing.fadeIn(speed) : billing.fadeOut(speed2);
	(modules[2] == true ) ? shipping.fadeIn(speed) : shipping.fadeOut(speed2);
		
}


function replicate(listitem,list,qty) {  //replicates list items 
	
	var firstrow = $(listitem + ':first',list),
		cartItems = $(list);
	
	for (i = 0; i < (qty - 1); i++) {  
		var row = firstrow.clone(true);
		cartItems.append(row);	
	}

}


	$(document).ready(function() {

	// -- Loads Cart Step first (default page), loads remaining pages after window.load below -------------- 
		$('#cart').load('checkout_cart.html',function() {
			replicate('.array_item','#cart_items',3);
			$('.array_item:odd').addClass('odd');			
		});

		replicate('li','.jcskin_sm',18); // adding multipe items to scroller

	// -- Change Checkout Steps ------------------------------ 
		$('#checkout_steps a').click(function(){
				
			var object = $(this),
				title = object.attr('title'),
				currentTab = object.attr('href'),
				loadPage = currentTab.replace('#','');
			
			if ( currentTab == "" ) { return false; };

			if ( !object.hasClass('active') ) {
				$('#checkout_steps a').removeClass('active');
				$(this).addClass('active');   
				$('.checkout_page.active').fadeOut(function() {	
					showModules(loadPage);
					$(this).removeClass('active');					   
					$(currentTab).fadeShow().addClass('active'); 
					$('h2').text(title);
				 });
			};	
			return false;												
		});



	// -- Toggle forms in checkout steps ------------------------------ 
		$('div.options input','.checkout_page').live('click',function() {
				
				var option = $(this),
					id = $("#" + option.val()),
					forms = option.closest('.checkout_page').find('form');

				forms.fadeOut(300); 
				id.fadeIn(1000); 
		});
		
		



	// -- Shipping to Multiple Addresses ------------------------------ 
		$('#shipto_multiple .select_address a').live('click', function() { 
			
			var drawerbutton = $(this),
				drawer = drawerbutton.closest('.array_item').find('.addl_address');
						
			if ( !$(this).hasClass('visible') ) {
				drawerbutton.addClass('visible').text('Hide Address Form').prev().attr("disabled", "disabled");
				drawer.fadeShow();
				
			} else {
				drawerbutton.removeClass('visible').text('Enter Another Address').prev().removeAttr("disabled");
				drawer.fadeHide();
	
			}
			return false;
		}); 


		$('#shipto_multiple .close').live('click', function() {
			$(this).closest('.addl_address').fadeHide();
			$(this).closest('.array_item').find('.select_address a').removeClass('visible')
					.text('Enter Another Address').prev().removeAttr("disabled");							  		
		});


	// -- Display Gift Message Tex Box  ------------------------------ 
		$('.include_gift_msg input').live('click', function() {
			
			var drawer = jQuery(this).closest('.include_gift_msg').find('.enter_gift_msg');
														 
			if (  jQuery(this).is(':checked')  ) { drawer.fadeShow();	 } 
			else { drawer.fadeHide(); }
			
		});
		
	






		$('input[type="text"]').focus(function() {
			var watermark = $(this).attr('value');						   
			$(this).val('').blur(function() {
				if ( $(this).attr('value') == '' ) {
					$(this).val(watermark);
				} 
			});							
		});
		
		// setup ul.tabs to work as tabs for each div directly under div.panes 
		$(".tabs").tabs(".panes > div"); 

		$('.scroller ul').jcarousel({  scroll: 5  });
		$('.scroller_sm ul').jcarousel({  scroll: 5  });

	});  <!-- end document ready -->




	$(window).load(function() {
	
		$('#billing_address').load('checkout_billing_address.html',function() {});
		$('#shipping_address').load('checkout_shipping_address.html',function() {
			replicate('.array_item','#shipping_addresses',4);
			$('.array_item:odd').addClass('odd');			
		});
		$('#shipping_method').load('checkout_shipping_method.html',function() {
			replicate('.shipment','#shipments',2);
		});
		$('#payment_method').load('checkout_payment_method.html',function() {});

		$('#product_detail').load('product_detail.html');
		$('#brand_landing').load('brand_landing.html', function() {
			replicate('.brand','.brands',6);
			$('.brand:first', this).addClass('first');
			$('.brand:last',this).addClass('last');
		});	

	});

