(function($) {

    $.Magnetize = function($parent,settings) {

        // container that includes magnet and optional header
        //var $parent = $parent;
        this.$parent = $parent;
        this.settings = settings;

        var _this = this;

        this.$header = this.settings.headerSelector !== null && this.$parent.find(this.settings.headerSelector).length !== 0 
            ? this.$parent.find(this.settings.headerSelector) : null;

        this.$magnet = this.$parent.find(this.settings.magnetSelector);
        this.magnetOffset = parseInt(this.$magnet.offset().top);
        
        // wrap the magnet in an outer container
        // we will use this to preserve the magnet space in the parent container when the magnetInner is docked
        // @fix - adding a wrap to the DOM may break any traversal relationships with inner contents, 
        // need to figure out how to keep wrapped contents in same scope
        this.$magnet.wrap('<div/>',  { 'class':this.settings.classes.magnetWrapper });
        this.$magnetWrapper = this.$magnet.parent();

        $(window).scroll(function() {  _this.setMagnetState();  })
            .resize(function() { _this.resetMagnetWidth(); });

    };

    $.Magnetize.prototype = {
        getMagnetOffset : function(){
            // gets left and right offset of magnet parent so we can set the left right positioning of the docked element
            var windowWidth = parseInt($(window).width());
            var magnetWidth = this.$parent.outerWidth() - parseInt(this.$parent.css('padding-left'));
            var magnetLeftOffset = parseInt(this.$parent.offset().left);

            return {
                left : parseInt(this.$magnetWrapper.offset().left),
                right : windowWidth - (magnetLeftOffset + parseInt(magnetWidth))
            };
        },
        setMagnetState : function() {
            var windowTopOffset = $(window).scrollTop();

            // if header !== null, baseline height is header height, if null, is 0 (top of window)
            var baselineHeight = (this.$header === null || !this.$header.hasClass('docked')) ?
                0 : this.$header.outerHeight(true);

            // differential is offset height when docking should start
            var differential = this.magnetOffset - baselineHeight;

            // if window offset plus jump height is greater than magnet offset minus the baseline height
            if ( windowTopOffset + this.settings.magnetJump > differential) {

                // check if it not already docked and it's displayed on the screen
                if (!this.$magnet.hasClass('docked') && this.$magnet.is(':visible')) {

                    // set height of wrapper to  so content below stays in same place
                    this.setMagnetWrapperHeight();
                    
                    // class used to assign status and use for any style changes 
                    this.$magnet.addClass('docked');

                    // get magnet left and right offsets for positioning
                    var offset = this.getMagnetOffset();

                    this.$magnet.css({
                        'position': 'fixed',
                        'top': baselineHeight,
                        'left': offset.left + 'px',
                        'right': offset.right + 'px',
                        'z-index': this.settings.magnetZindex,
                        'width': 'auto'
                    });
                };
            } else {
                this.$magnet.removeClass('docked').css({ 'position': 'static', 'width': 'auto' });

                // var wrapperHeight = this.$magnet.is(':visible') ? this.$magnet.outerHeight(true) : 'auto';
                this.$magnetWrapper.css('height', 'auto');
            }
        },
        resetMagnetWidth : function() {
            // if magnetInner has class docked, on window resize update left/right positioning of magnet
            if ( this.$magnet.hasClass('docked') ) {
                   
                var offset = this.getMagnetOffset();
                
                this.$magnet.css({
                    left : offset.left + 'px',
                    right: offset.right + 'px'
                });
            }
        },
        setMagnetWrapperHeight : function() {
            this.$magnetWrapper.css('height',this.$magnet.outerHeight(true) + 'px');
        },
        recalculate: function() {
            if ( this.$magnet.hasClass('docked') ) {
                this.setMagnetWrapperHeight();
                this.resetMagnetWidth();                
            }
        }

    };

    $.fn.magnetize = function(options) {

        var settings = {
            magnetSelector: null,
            headerSelector: null,
            classes: {
                magnetWrapper: 'magnet-wrapper'
            },
            magnetZindex: 100000000,
            magnetJump: 10
        };

        return this.each(function() {
            if (options) { $.extend(true, settings, options); }

            var $this = $(this);
            var newMagnet = new $.Magnetize($this,settings);
            $this.data('magnetized', newMagnet);

        });
    }

})(jQuery);