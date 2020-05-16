// ===================================================================================================
/*
Notes: 
- remove specific direction class
- make surroundType event driven
- makey spacebar keypress trigger event movers
- allow user to select the number of dots per row/column instand box height/width
- make screen size the width of the element
- create offset for different between box size and inner elements



*/
// ===================================================================================================

(function($) {
	
    $.OnTheGrid = function($parent,settings) {
        this.$parent = $parent;
        this.settings = settings;

        var _this = this;
        
        // do space and qty calculations
        var dotHorizSpace = this.settings.dotSize + this.settings.horizontalMargin 
            + (this.settings.borderSize !== null ? this.settings.borderSize*2 : 0 );
        var staggerOffset = dotHorizSpace/2;
        var dotVertSpace = this.settings.dotSize + this.settings.horizontalMargin 
            + (this.settings.borderSize !== null ? this.settings.borderSize*2 : 0 );
        
        var windowWidth = $(window).width();
        var windowHeight = $(window).height();

        // console.log('win width',$(window).width()); 
        if ( this.settings.fillScreen === true ) {
            this.settings.boxWidth = windowWidth;
            this.settings.boxHeight = windowHeight;
        }
                
        // if box size is bigger than max alloted size, set to max alloted size 
        if ( this.settings.boxWidth > this.settings.maxBoxWidth ) { this.settings.boxWidth = this.settings.maxBoxWidth }
        if ( this.settings.boxHeight > this.settings.maxBoxHeight ) { this.settings.maxBoxHeight = this.settings.maxBoHeight }
        
        // Calculate the number of dots based on dot size and box size 
        //  @fix - need to allow full set of options to set the dots
        //  1) calculate size of dots based on number of dots and box size
        //  2) calculate box size based on number and size of dots 
        this.dotsPerRow = parseInt( this.settings.boxWidth / dotHorizSpace );
        this.dotsPerColumn = parseInt( this.settings.boxHeight / dotVertSpace );
        
        this.dotQty = this.dotsPerRow * this.dotsPerColumn;
        this.boxWidth = this.dotsPerRow * dotHorizSpace + 4;
        this.boxHeight = this.dotsPerColumn * dotVertSpace + 4;
        
        // we create list of position classes so we can reset only position classes and don't have to removeClass on all classes on the element
        this.positionClassArray = [];
        $.each(this.settings.position, function(index,position) {  _this.positionClassArray.push(position); });
        this.positionClasses = this.positionClassArray.join(' ');
        
        // set width/height of container to adjusted box size
        this.$parent.css({ 'width':this.boxWidth, 'height':this.boxHeight });
        
        // if ( this.settings.centerOnScreen == true && windowWidth > this.boxWidth ) { 
        //     this.$parent.parent().css('padding-top', (windowHeight - this.boxHeight) / 2) ;
        // }
        
        // inner container that will be appended to plugin parent
        this.$wrapper = $('<div/>', { 'class':'clr' });

        // create index of elements, we call these when looking for related elements instead of traversing the DOM
        this.fullDotIndex = {};

        // build a dot for each dotQty
        for ( var i = 0; i < this.dotQty; i++ ) {
            var $em = $('<em/>')
                .data('index',i)
                .css('height',this.settings.dotSize + 'px')
                .css('width', this.settings.dotSize + 'px')
                .css('margin-right', this.settings.horizontalMargin)
                .css('margin-bottom', this.settings.verticalMargin)
                .appendTo(this.$wrapper);

            this.fullDotIndex[i] = $em;

            // -- ADD SURROUNDING HOVERS ---------------------------------------------------------------- //
            if ( this.settings.addHover === true ) {
                $em.mouseenter(function() {
                    _this.hilightSurroundersOnHover($(this), 'cross');
                });
            } 

            // -- applies adjusted styles if we want to stagger the elements on each row --------- //
            var adjustedIndex = i+1;
            if ( this.settings.stagger === true ) {
                if ( adjustedIndex % ( this.dotsPerRow) === 0  ) { $em.css('margin-right',0) }  
                if (adjustedIndex === 1 || adjustedIndex % ( this.dotsPerRow * 2 ) === 1 ) { 
                    $em.css('margin-left',staggerOffset);  
                }
            }
        }
        this.$wrapper.appendTo(this.$parent);
        
        if ( this.settings.completeCallback ) { this.settings.completeCallback(this); }
    };
    
    $.OnTheGrid.prototype = {
        hilightSurroundersOnHover : function($element, surroundType) {
            
            this.$wrapper.find('em')
                .removeClass(this.settings.class_on)
                .removeClass(this.positionClasses);
        
            var $surrounders = this.getSurrounders($element, surroundType,true);

            $surrounders.addClass('on');
        },
        getSurrounders : function($trigger,surroundType,includeTrigger) {
            
            var _this = this;
             
            // -- SURROUND SETS ---------------------------------------------- //
            // creates collection of surrounding sets, surroundType argument determines which surrounders we gonna get
            var surroundSets = {
                cross : [
                    this.settings.position.above,this.settings.position.right,
                    this.settings.position.below,this.settings.position.left
                ],
                diagonal : [        
                    this.settings.position.aboveLeft,this.settings.position.aboveRight,
                    this.settings.position.belowRight,this.settings.position.belowLeft
                ],
                horizontal : [this.settings.position.left,this.settings.position.right],
                topDiagonal : [this.settings.position.aboveLeft,this.settings.position.aboveRight],
                aboveLeftSpray: [this.settings.position.left, this.settings.position.aboveLeft, this.settings.position.above],
                belowLeftSpray : [this.settings.position.belowLeft, this.settings.position.left, this.settings.position.below],
                belowLeft: [this.settings.position.belowLeft],
                above: [this.settings.position.above],
                aboveSpray : [ this.settings.position.aboveLeft,this.settings.position.aboveRight,this.settings.position.above],
                left : [this.settings.position.left],
                leftSpray : [ this.settings.position.aboveLeft, this.settings.position.left, this.settings.position.belowLeft ],
                right : [this.settings.position.right],
                rightSpray : [ this.settings.position.aboveRight, this.settings.position.right, this.settings.position.belowRight ]
            };
            // fourWay combines cross and diagonal into one setting
            surroundSets.fourWay = surroundSets.cross.concat(surroundSets.diagonal);
            surroundSets.topHemisphere = surroundSets.aboveSpray.concat([this.settings.position.left, this.settings.position.right]);
            // -------------------------------------------------------------- //

            var surrounders = [];

            // we can request to include the $trigger in the surrounders array or not
            if ( includeTrigger === true ) {  surrounders.push($trigger);  }
            
            // getElement for each item position in teh surroundSet
            var surroundTypePositions = surroundSets[surroundType];
            $.each(surroundTypePositions, function(index,item) {
                _this.getElement({ position:item, $trigger: $trigger, arrayToPushThisTo: surrounders });
            });
            
            // return surrounders converted from an array to a jquery object
            return this.getJquerySet(surrounders);
        },
        explodeSurrounders : function($this, surroundType) {
            
            if ( !surroundType && window.console ) {
                console.error("Need a direction for explodeSurrounders");
                return false;
            }
            
            var _this = this;
            
            var $surrounders = this.getSurrounders($this,surroundType );

            if ( this.settings.addHover !== true ) {
                $this.addClass(_this.settings.class_on);
                setTimeout(function() {
                    $this.removeClass(_this.settings.class_on);
                    
                    // if we have any surrounders, light em up
                    if ( $surrounders !== undefined ) {

                        $surrounders.addClass(_this.settings.class_on)
                            .attr('data-passedClass',$this.attr('data-passClass'));

                        _this.expandoMove($surrounders,_this.settings.speed_expando);
                    }
                    
                }, this.settings.speed_expando);
            }
        },
        getExpandos : function($elements) {
            var _this = this;
            var newExpandos = [];
            $elements.each(function() {
                var $element = $(this);
                
                // we get the class/position of each of the current expando surrounders to access their next respective position 
                // (above's next above) 
                var position = $element.attr('class');
                var $newExpando = _this.getElement({ position:position, $trigger:$element });
                
                // if it exists, add it to the collection
                if ( $newExpando !== null ) { 
                    
                    // we pass the existing element's passedClass to its new expando for CSS to apply unique styles to the expando trail  
                    $newExpando.attr('data-passedClass',$element.attr('data-passedClass'));
                    newExpandos.push($newExpando);
                }
            });
            
            // before we return the new expandos, we remove the passedClass value for the existin elements 
            $elements.attr('data-passedClass','');
            
            return this.getJquerySet(newExpandos);
        },
        expandoMove : function($currentExpandos, speed) {
            var _this = this;
            
            setTimeout(function() {

                // remove existing on class so nextExpandos can replicate the position class of the existing element
                // @fix - is there a better way to pass this property than with classes and still be able to style differently
                $currentExpandos.removeClass(_this.settings.class_on);

                // create new set of elements for each set of $currentExpandos
                var $nextExpandos = _this.getExpandos($currentExpandos);
                
                // we remove the position classes after the classes get passed to their nextExpandos 
                $currentExpandos.removeClass(_this.positionClasses);
                
                // so long as our expandos still exist (they haven't reached the edge of the board), we re-run expandoMove 
                if ( $nextExpandos && $nextExpandos.length > 0 ) {  

                    // change speed if we have easing properties
                    // speeds value gets decreased (meaning speed gets increased) based on an acceleration value btw -1 to 1 and != 0
                    // positive value == acceleration, negative value == deceleration
                    if ( _this.settings.speedChange === true ) {   speed -= parseInt(speed * _this.settings.acceleration);  }                    

                    // add active class for styling
                    $nextExpandos.addClass(_this.settings.class_on);
                    
                    // re-run move on new expandos we just made
                    _this.expandoMove($nextExpandos, speed); 
                }
                
            }, speed);
        },  
        getElement : function(model) {
            // model:
            //  position: any of the settings.position.xxx values, required
            //  $trigger : trigger elements
            //  arrayToPushThisTo : optional argument of an array that this element can be added to instead of returned

            model.triggerIndex = model.$trigger.data('index');
            
            // set the element index of the surrounding items
            var elementIndex = {
                above: model.triggerIndex - this.dotsPerRow,
                aboveLeft: model.triggerIndex - this.dotsPerRow - 1,
                aboveRight: model.triggerIndex - this.dotsPerRow + 1,
                below: model.triggerIndex + this.dotsPerRow,
                belowRight: model.triggerIndex + this.dotsPerRow + 1,
                belowLeft: model.triggerIndex + this.dotsPerRow - 1,
                left: model.triggerIndex - 1,
                right: model.triggerIndex + 1
            };
            
            // set boolean conditions for each surrounding element to be a valid value
            // invalid index values are dots that go off the page
            var condition = {
                above: elementIndex.above >= 0,
                below: elementIndex.below < this.dotQty,
                left: (elementIndex.left+1) % this.dotsPerRow !== 0,
                right: elementIndex.right % this.dotsPerRow > 0
            };
            
            // set conditions for corners, combo of above conditions
            condition.aboveLeft = ( condition.above && condition.left );
            condition.aboveRight = ( condition.above && condition.right );
            condition.belowLeft = ( condition.below && condition.left );
            condition.belowRight = ( condition.below && condition.right );

            // if the position specific condition passes, build the element and return it or push it to an array
            if ( condition[model.position] === true ) {

                var $surrounder = this.fullDotIndex[elementIndex[model.position]]
                    .addClass(model.position);

                // if we get the array argument, we push element to array, otherwise we return it
                if ( model.arrayToPushThisTo !== undefined ) {  model.arrayToPushThisTo.push($surrounder); return false; }
                else { return $surrounder; }
            
            // or we return null if nothing is returned    
            } else {  return null;  }
        },
        getJquerySet : function(array) {
            // turn array into jquery object
            var $collection;

            $.each(array, function(index,$item){
                if ( index === 0 ) { $collection = $item; }
                else { $collection = $collection.add($item); }
            });
            // @fix - its possible to return undefined here (in expandoClick), do we need to handle error states here? 
            return $collection;
        },
        
        // -- External methods ------------------------------------------------------ //
        getRandomElements : function($elements,qty) {
            // if qty is not passed, set to 1
            qty = qty || 1;
            var random = $elements.get().sort(function(){ 
               return Math.round(Math.random())-0.5;
            }).slice(0,qty);
            return $(random);
        }
    };

	$.fn.onTheGrid = function(options) {
		
		var settings = {
            // box properties
		    boxWidth: 400,
		    boxHeight: 400,
 		    maxBoxWidth: 1400,
 		    maxBoxHeight: 800,
		    fillScreen: true,
            centerOnScreen: true,

            // dot properties
		    dotSize: 10,
		    horizontalMargin: 5,
		    verticalMargin: 5,
		    borderSize: 0,
 		    stagger: false,
 		    
 		    // callbacks
 		    completeCallback : null,
		    
		    // abstracts the name of position so use can customize the class if needed 
		    // values must be strings with no spaces
		    position : {
    		    above : 'above',
    		    below: 'below',
    		    left: 'left',
    		    right: 'right',
    		    aboveLeft: 'aboveLeft',
    		    aboveRight: 'aboveRight',
    		    belowRight: 'belowRight',
    		    belowLeft: 'belowLeft'
		    },
		    
		    class_on : 'on',
		    
		    // speed controls
		    speed_expando: 30,          // how quick between and expando going from one cell to the next
		    speedChange: true,          // do we want the expandos to speed up or slow down as they move
		    acceleration: .4,           // Required if speedChange is true, values between -1 to 1, and != 0 (negative is deceleration)

		    // -- EVENTS -------------------- // 
		    addHover: false,

            // expando
		    addExpandoTrails: true
		};
		
		return this.each(function() {
			if ( options ) { $.extend(true,settings,options); }
			var newDots = new $.OnTheGrid($(this),settings);
		});
	}
	
})(jQuery);


