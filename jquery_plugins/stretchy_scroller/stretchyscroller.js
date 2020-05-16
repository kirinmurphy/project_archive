///////////////////////////////////////////////////////////////////////
//  StretchyScroller();
//  written by Kirin Murphy - codethings.net
//  work on error handling thanks to Rob Wafle - chicagocodemonkeys.com
///////////////////////////////////////////////////////////////////////

(function ($) {

    $.StretchyScroller = function ($target, settings) {
        this.settings = settings;
        this.$target = $target;

        // control position determines if nav buttons are on rightSide or eachSide in CSS
        this.$target.addClass(settings.controlPosition);

        // dynamically resized element that hides undisplayed L&R content of child element
        this.$scrollwrap = this.$target.find('.wrap')
            .css({ 'position': 'relative', 'overflow': 'hidden' });

        // direct parent of content items, css left positioning changed to simulate L&R scroll
        this.$list = this.$scrollwrap.children('ul')
            .css({ 
                'position': 'relative', 
                'width': '40000px', 
                'overflow-y': 'hidden', 
                'z-index': '0' 
            });

        this.direction = null; // back or fwd based on the back/fwd buttons
        this.index = 0; // index of the group of items currently displayed

        var _this = this;

        var fwdButtonRightCSS = this.settings.controlPosition === 'eachSide' ? 0 : 0 + 'px';

        // -- BACK AND FWD BUTTONS --------------------------------------------------
        // FWD Button -------------
        this.$fwdButton = $('<a/>', { text: this.settings.text_fwdButton, 'class':'navlink forward disabled' })
            .append($('<em/>'))
            .css({ 
                'display': 'block', 'position': 'absolute', 
                'right': fwdButtonRightCSS, 'top': 0, 'bottom': 0 
            })
            
            // if there are already click events bound to the buttons unbind existing events before re-binding
            .unbind('click').click(function () {
                if (!$(this).hasClass(_this.settings.class_disabled)) {
                    _this.direction = 'forward';
                    _this.index++;
                    _this.scrollIt();
                }
                return false;
            });

        // BACK Button ----------------
        var backButtonLeftCSS = this.settings.controlPosition === 'eachSide' ? 0 : 'auto';

        // @ fix - how was this working before?  outerWidth(true) shouldn't ever have returned results bc it's not in the DOM
        // var backButtonRightCSS = this.settings.controlPosition === 'eachSide' ? 'auto' : this.$fwdButton.outerWidth(true) + 'px';
        var backButtonRightCSS = this.settings.controlPosition === 'eachSide' ? 'auto' : '19px';

        this.$backButton = $('<a/>', { text: this.settings.text_backButton })
            .append($('<em/>'))
            .attr('class', 'navlink back disabled')
            .css({ 'display': 'block', 'position': 'absolute', 'right': backButtonRightCSS,
                'left': backButtonLeftCSS, 'top': 0, 'bottom': 0, 'cursor': 'pointer'
            })
            .unbind('click').click(function () {
                if (!$(this).hasClass(_this.settings.class_disabled)) {
                    _this.goBackOne();
                }
                return false;
            });

        // append buttons to parent
        this.$target
            .append(this.$fwdButton)
            .append(this.$backButton);

        // after appended, get dimensions of buttons to determine available width for panel
        var fwdButtonOffset = this.$fwdButton.outerWidth(true);

        var backButtonLeftCSSQty = parseInt(this.$backButton.css('left'));
        this.backButtonOffset = this.$backButton.outerWidth(true)

        // @fix - why we doin this here?
        this.resetLeftPositioning();

        // left padding of the parent container also needs to be included in below calc
        var targetLeftRightPadding = parseInt(this.$target.css('padding-left')) + parseInt(this.$target.css('padding-right'));

        // calculate width differential of content in parent that shouldn't be calcualted for scrollwrap
        // used in setContainer() to adjust scroller Width dynamically
        this.widthDifferential = this.backButtonOffset + fwdButtonOffset + targetLeftRightPadding;

        this.getItems();
    };

    $.StretchyScroller.prototype = {
        goBackOne : function() {
            this.direction = 'back';
            if ( this.index === 0 ) {this.index = 1 } else { this.index--; }
            this.scrollIt();
        },
        resetLeftPositioning: function () {
            // if Back button is on the left side, moves scrollwrap to the right by the width of the button to adjust for differential
            if (this.settings.controlPosition === 'eachSide') { this.$scrollwrap.css('left', this.backButtonOffset) }
        },
        getItems: function () {

            var _this = this;

            // run after success of ajax calls below
            var ajaxLoadSuccess = function (listitems) {
                _this.$list.append(listitems);
                _this.$listItems = _this.$list.children('li');
                if (_this.$listItems.length > 0) { _this.getItemsSuccess(); }
            };

            // get list items if already loaded (on load)
            this.$listItems = this.$list.children('li');

            // if content alredy exists in the list on page load, use those items
            if (this.$listItems.length > 0) {
                this.getItemsSuccess();

            // or if ajax loading HTML
            } else if (this.settings.ajaxLoadType === 'html' && this.settings.path !== null) {
                $.ajax({
                    url: this.settings.path,
                    success: function (data) { ajaxLoadSuccess(data); }
                });

            // or if ajax loading JSON
            } else if (this.settings.ajaxLoadType === 'json' && this.settings.path !== null) {
                $.ajax({
                    type: "GET",
                    url: this.settings.path,
                    dataType: "json",
                    success: function (data) {
                        // use external callback function that accepts JSON and returns markup or a jquery Object
                        var listitems = _this.settings.buildItemsFromJSON(data);
                        ajaxLoadSuccess(listitems);
                    }
                });

            // or if nothing gets loaded
            } else {
                this.$scrollwrap.html(
                    $('<div/>', { html: this.settings.text_noContent, 'class': this.settings.class_noContent})
                );
            }
        },
        // execute optional callback function in functional call before setting container
        getItemsSuccess: function () {
            this.settings.afterListLoadedCallback(this.$target);
            this.setContainer();
        },
        // external function available to be used when content is dynamically changed
        recalculate: function () {
            
            // get number of list groups before we recalculate
            // later we check to see if the qty changes to possibly move section back one
            var listGroupsBeforeLength = this.listGroupWidths.length; 

            // re-acquire the new set of items 
            this.$listItems = this.$list.children('li');

            // re-calculate scroller with new items
            this.setContainer({ navigateToTileWithOnClass: false });

            // get current number of groups to compare with previous
            var listGroupsAfterLength = this.listGroupWidths.length;  

            // if we lost a group after recalculating, and our index is the last one, we go back to last batch
            if ( listGroupsBeforeLength > listGroupsAfterLength && this.index + 1 === listGroupsBeforeLength ) {
                this.goBackOne();
            }
        },
        // calculate and apply container dimensions on load and resize
        setContainer: function (model) {

            // auto set this property in the global object each time setContainer is called , 
            // pass the value in via the model so we are not dependent on it coming externally
            // we affirmatively test for false because true is the default
            // if not declared, will be set to true which is what it should be doing explicitly on init
            // @fix - eventually expose this option to recalculate so user can determine if on state should be displayed on recalculate 
            this.navigateToTileWithOnClass = model && model.navigateToTileWithOnClass === false ? false : true;

            // if we don't want to keep nav button space, hide buttons
            if (this.settings.hideNavButtonsIfNotUsed === true) {
                this.$fwdButton.hide();
                this.$backButton.hide();
            }

            var fullWidth = this.$target.outerWidth(true);

            // calculates the available width left in the row after sizing adjustments
            this.openWidth = fullWidth - this.widthDifferential;

            // sets workspace container width to total available width remaining
            this.$scrollwrap.css('width', this.openWidth);

            // if window gets resized, calculations must get reset from default positioning so list is reverted to beginning
            // if there is an active item, this will be updated in set items to move to that specific range
            // @fix - we can return to relative position by first identifying the first tile displayed before the resize (temp on position)
            // and then finding the tile the same way we do for the activated item
            if (model && model.resized === true && this.index !== 0) {
                this.$list.css('left', 0);
                this.index = 0;
            }

            this.setButtonStates();
            this.setItems();
        },
        setItems: function () {

            var _this = this;

            this.listGroupWidths = []; // width of each group of viewable items
            this.activeGroup = null; // group that includes item with class="on"

            var itemWidths = [];

            // calculates combined width of all list items in container
            var listWidth = 0;
            this.$listItems.each(function () { listWidth += $(this).outerWidth(true); });

            // checks if list width is larger than available width on the screen
            // if true, sets scroll parameters (width of inner elements)
            if (listWidth >= this.openWidth) {

                // reset button positioning
                this.resetLeftPositioning();

                // redisplay buttons if we need them and they are hidden
                this.$fwdButton.show();
                this.$backButton.show();

                // display navlinks, remove disabled if set by resize
                this.$target.children(this.settings.class_navlink)
                    .removeClass(this.settings.class_disabled)
                    .show();

                this.$scrollwrap.removeClass(this.settings.class_noScroll);

                // iterates through list and creates array of list item widths
                this.$listItems.each(function () {
                    var $this = $(this);

                    // only apply items that are not absolutely positioned 
                    if ($this.css('position') !== 'absolute') {
                        itemWidths.push($this.outerWidth(true));
                        if ( _this.navigateToTileWithOnClass === true && $this.is('.on') ) { 
                            console.log('ders',$this);
                            _this.activeStep = _this.$listItems.index($this); 
                        }
                    }

                });

                // -- TIMEOUT PREVENTION ------------------------------------------------------------
                // set a manual loop limit so potentially overloaded content or infinite loop error doesn't time out browser
                var loopIteration = 0;

                // creates array of widths for each subset of list that is viewable in the view area                
                do {
                    var listGroupWidth = 0; // width of each group of items that display on the page
                    var shownListItems = 0; // number of items iterated through

                    for (var i = 0, len = itemWidths.length; i < len; i++) {
                        if ((listGroupWidth + itemWidths[i]) < _this.openWidth) {
                            listGroupWidth += itemWidths[i];
                            shownListItems++;
                        } else { break; }
                    }

                    // after function is run, splice removes the Parsed items to create a new array of only unParsed items
                    itemWidths.splice(0, (shownListItems));
                    this.activeStep -= shownListItems;

                    // finds section with active element included (0 indexed) - used to scroll
                    if (this.activeStep < 0 && this.activeGroup === null) {
                        // index of group that active item is included in
                        this.activeGroup = this.listGroupWidths.length;
                    }

                    // adds sum of single viewable list subset to array of subset widths
                    this.listGroupWidths.push(listGroupWidth);

                    loopIteration++;

                // re-runs this function until there are no items left (or we exceeded the maxGroupLimit)
                } while (itemWidths.length > 0 && loopIteration < this.settings.maxGroupLimit);

                // if we get to the maxLoops
                if (loopIteration === this.settings.maxGroupLimit) { 
                    this.log("More items have loaded than the set limit.  Scroller setup not complete"); 
                }

                // moves scroller to list group with active item
                if (this.activeGroup > 0) {
                    var beforeGroupWidths = this.listGroupWidths.slice(0, this.activeGroup);
                    var beforeWidth = null;
                    for (var i = 0, len = beforeGroupWidths.length; i < len; i++) {
                        beforeWidth += beforeGroupWidths[i];
                    }

                    this.$list.css('left', '-' + beforeWidth + 'px');
                    this.index = this.activeGroup;
                    this.setButtonStates();
                }

            // if content is smaller that full screen - reset non-scroller defaults
            } else {

                // get navlinks
                var $navlinks = this.$target.children('.' + this.settings.class_navlink);

                // if hideButtons is true, hides nav buttons and the content takes up their space
                if (this.settings.hideNavButtonsIfNotUsed === true) {
                    $navlinks.hide();
                    this.$list.css('left', 0);
                    this.$scrollwrap.css('left', 0);

                    // or if we keep items displayed, just add class disabled
                } else { $navlinks.addClass(this.settings.class_disabled); }

                // reset index to default
                this.index = 0;

                // if we want to center the content when no scroll
                if (this.settings.centerIfNoScroll === true) {
                    this.$scrollwrap.css('width', listWidth)
                        .addClass(this.settings.class_noScroll);
                }
            }
        },
        setButtonStates: function () {

            if (this.index === 0) {
                this.$backButton.addClass(this.settings.class_disabled);
                this.$fwdButton.removeClass(this.settings.class_disabled);
            } else if (this.index === this.listGroupWidths.length - 1) {
                this.$backButton.removeClass(this.settings.class_disabled);
                this.$fwdButton.addClass(this.settings.class_disabled);
            } else {
                this.$backButton.removeClass(this.settings.class_disabled);
                this.$fwdButton.removeClass(this.settings.class_disabled);
            }
        },
        scrollIt: function () {

            if (this.direction == 'forward') {
                this.$list.animate({ left: '-=' + this.listGroupWidths[this.index - 1] }, this.settings.scrollSpeed);
            } else if (this.direction == 'back') {
                this.$list.animate({ left: '+=' + this.listGroupWidths[this.index] }, this.settings.scrollSpeed);
            }
            this.setButtonStates();
        },
        log: function () {  
            if (this.settings.showErrors && window.console) { console.error(arguments); }  
        }
    };

    $.fn.buildStretchyScroller = function (options) {

        var settings = {
            // config
            scrollSpeed: 500,
            centerIfNoScroll: false,
            hideNavButtonsIfNotUsed: false,
            controlPosition: 'eachSide', // eachSide or rightSide
            afterListLoadedCallback: function () { }, // callback after items get loaded

            // AJAX configuration
            ajaxLoadType: null,                     // null (for DOM elements), 'html' or 'json'
            path: null,                             // required if ajaxLoadType is 'html' or 'json'
            buildItemsFromJSON: function (data) { }, // required for JSON, must return HTML string or jQuery DOM Object

            // text
            text_noContent: 'No content',
            text_fwdButton: '',
            text_backButton: '', 

            // classes
            class_navlink: 'navlink',
            class_disabled: 'disabled',
            class_noScroll: 'noscroll',
            class_noContent: 'noContent',
            
            showErrors: true,
            maxGroupLimit : 100
        };

        return this.each(function () {

            if (options) { $.extend(settings, options); }

            var $this = $(this);

            var newStretchyScroller = new $.StretchyScroller($this, settings);

            // bind object to target so we can expose recalculate for external use
            // @fix - is there a way to expose only certain methods?
            $this.data('stretchyScroller', newStretchyScroller);

            $(window).resize(function () {
                // true indetifies that setContainer is being executed from resize event
                newStretchyScroller.setContainer({ resized:true });
            });
        });
    };
})(jQuery);