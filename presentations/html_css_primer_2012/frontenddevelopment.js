(function() {

	$('.toggleFloatButtons select').change(function() {
        var $select = $(this);
        var $option = $select.find('option:selected');
		var $slide = $(this).closest('article');

		var $container = $slide.find('.example');
		var floatType = $option.data('floattype');
        var $codeReferences = $slide.find('.floatType')

        $codeReferences.addClass('edited');
        
        if ( floatType !== 'split') {
    		$container.children('div').css('float', floatType );	
    		$codeReferences.text(floatType);
        } else {
            $container.find('.block1').add($container.find('.block3')).css('float','right');
            $container.find('.block2').css('float','left');
            $codeReferences.eq(0).text('right');
            $codeReferences.eq(1).text('left');
            $codeReferences.eq(2).text('right');
        }
	});



	$('.toggleClearingFloats').click(function() {
		var $slide = $(this).closest('article');
		var $clearExample = $slide.find('.cleared .block2');
		if ( $clearExample.css('clear') == 'left' ) {  $clearExample.css('clear','none'); } 
		else {  $clearExample.css('clear','left');  }
		$slide.find('.clearType').addClass('edited')
			.text($clearExample.css('clear'));
	});
	
	$('#toggleFloatedClears select').change(function() {
        var $select = $(this); 
        var $option = $select.find('option:selected');
		var $slide = $select.closest('article');
        var type = $option.data('cleartype') || $option.data('floattype') || null;
        var target = $select.data('cleartarget') || $select.data('floattarget') || null;
        var attributeType = $option.data('cleartype') ? 'clear' : 'float';

		$slide.find('.' + target ).css(attributeType,type);
		
        $slide.find('[data-toggledby="' + target + '"]')
            .addClass('edited')
            .text(type);
	});

	$('.toggleCSS3ClrClass').click(function() {
		var $slide = $(this).closest('article');
		var $clearExample = $slide.find('.css3.floated');
		$clearExample.toggleClass('clr');
		$slide.find('.clrClass').addClass('edited').toggle();
	});
	
	$('.toggleFloatOnRelativePositionedElement').click(function() {
		var $slide = $(this).closest('article');
	    var $this = $slide.find('.relativePosition div');
	    if ( $this.css('float') == 'left' ) { $this.css('float','none'); }
	    else { $this.css('float','left'); }   
	    $slide.find('.addFloat').addClass('edited').toggle();         
	});
	
	$('.toggleZindex').click(function() {
		var $slide = $(this).closest('article');
	    $slide.find('.zindex div').each(function() {
    	    var $this = $(this);
    	    if ( $this.css('z-index') == '0' ) { $this.css('z-index',$this.data('origZindex')) }
    	    else { 
                $this.data('origZindex',$this.css('z-index'));
    	        $this.css('z-index','0');
    	    }

    	    // set updated z-index in the code example
    	    var codeClass = $this.attr('class') + '-zindex';
    	    $('.' + codeClass).addClass('edited').text($this.css('z-index'));
	    });
	});

	$('#togglePaddingForPositionedElements').click(function() {
		var $slide = $(this).closest('article');
		var $example = $slide.find('.absolutePositionWithPadding');
		if ( $example.css('padding-right') == "0px" ) { $example.css('padding-right','90px') }
		else { $example.css('padding-right','0px') }
		$slide.find('.removePadding').addClass('edited')
			.text($example.css('padding-right'));
	});
	
	$('#changeHeightOfParent').click(function() {
	    var $slide = $(this).closest('article');
	    var $container = $slide.find('.setHeightWithPositioning');

	    if ( $container.css('height') == '100px' ) {
	        $container.css('height','150px');
	    } else {
	        $container.css('height','100px');
	    }
        $slide.find('.parentHeight').addClass('edited')
            .text($container.css('height'));

	});
	
	$('#setFixedHeight').click(function() {
	    var $slide = $(this).closest('article');
        var $block1 = $slide.find('.block1');
        var $codeHeightReference = $slide.find('.childHeight');
        
        $codeHeightReference.addClass('edited').toggle();
        $slide.find('.ignoredBottom').toggleClass('edited').toggleClass('strikethrough');
	    if ( $codeHeightReference.is(':visible')  ) {  $block1.css('height','20px');  } 
	    else {  $block1.css('height','auto');  }
	});

	$('.toggleOverflowHidden').click(function() {
	    var $slide = $(this).closest('article');
		var $container = $slide.find('#overflowHidden');
		if ( $container.css('overflow') == 'hidden' ) {
			$container.css('overflow','visible');
		} else {
			$container.css('overflow','hidden');
		}
		$slide.find('.overflowType').addClass('edited')
		    .text($container.css('overflow'));
	});

	$('#toggleOverflowAuto').click(function() {
		var $slide = $(this).closest('article');
		var $container = $slide.find('#overflowAuto');
		if ( $container.css('overflow') == 'auto' ) {
			$container.css('overflow','visible');
		} else {
			$container.css('overflow','auto');
		}
		$slide.find('.changeOverflow').addClass('edited')
			.text($container.css('overflow'));
	});
})();