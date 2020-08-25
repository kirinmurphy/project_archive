(function($) {

	$.fn.pressEnter = function(callback) {
		return this.each(function() {
			$(this).bind('keydown',function(e) {
				switch(e.keyCode) { case 13: callback(); break; }
			});
		});
	};

	// creates parent function that only calls the init prototyped function
	$.PuzzlePic = function($parent,settings) {
		this.$parent = $parent;
		this.settings = settings;

		this.id = this.$parent.attr('id');

		this.setRowsColumns(4);
		this.loadControls();
	};

	$.PuzzlePic.prototype = {

		setRowsColumns: function(rowsCols) {
			this.rowsCols = rowsCols;
			this.numTiles = this.rowsCols * this.rowsCols;

			this.setImage();
		},

		setImage: function(image) {

			if ( !image ) { this.$image = this.$parent.find('img'); }
			else { this.$image = image; }
			this.$imageURL = this.$image.attr('src');
			this.imageWidth = this.$image[0].width;
			this.imageHeight = this.$image[0].height;
			this.tileHeight = this.imageHeight / this.rowsCols;
			this.tileWidth = this.imageHeight / this.rowsCols;

			var _this = this;

			setTimeout(function() { _this.buildTiles(); },500);
		},

		buildTiles: function() {

			this.$inner = $('<div/>').addClass('inner clr');
			var $thisTile;
			var tileArray = [ ];
			this.$inner.css({
				'width':this.imageWidth + this.rowsCols + 2 + 'px',
				'height':this.imageWidth + this.rowsCols + 2 + 'px'
			});

			for ( var i = 0; i < (this.numTiles); i++) {

				var adjustedIndex = i+1;

				var xCoord = (i % this.rowsCols ) * this.tileWidth;
				var yCoord = parseInt(i / this.rowsCols) * this.tileWidth;

				$thisTile = $('<span/>',{ id: this.id + '_' + (adjustedIndex), text:(adjustedIndex) });

				$thisTile.css({
					'width':this.tileWidth + 'px',
					'height':this.tileHeight + 'px',
					'backgroundRepeat':'no-repeat',
					'backgroundPosition': (xCoord *-1) + 'px ' + (yCoord *-1) +  'px',
					'backgroundImage': 'url(' + this.$imageURL + ')'
				});

				// we make the last tile the moving tile and hide the last slide of the image
				if ( i === this.numTiles-1 ) {
					$thisTile.addClass('empty').css('background','none').css('backgroundColor','#fff');
				}

				// create array of tiles so we can randomize them
				tileArray.push($thisTile);
			}

			// randomize order of tiles
			tileArray.sort(function() { return (Math.round(Math.random())-0.5) }) ;

			// add randomized tiles to container
			for (var i=0; i<this.numTiles; i++) {
				tileArray[i].appendTo(this.$inner);
			}

			// remove image from DOM when tiles are ready to load
			this.$image.detach();

			// add tile contents
			this.$inner.appendTo(this.$parent);

			// test if random start order is winning order
			this.testGameOver();

			// setup up/down/left/right controls
			this.setupMovers();
		},

		setupMovers: function() {

			var _this = this;
			var fadeSpeed = 300;

			this.emptyCell = this.$parent.find('.empty');
			var emptyTileIndex = this.emptyCell.parent().children().index(this.emptyCell);

			// resets clicable tiles from previous click
			this.$inner.unbind('click').find('.on').removeClass('on bottomMover topMover leftMover rightMover');

			/* Next 4 If statements determine new clickable tiles and create functions to move tiles */
			if ( emptyTileIndex >= this.rowsCols ) {
				var topMover = this.$inner.find('span').eq(emptyTileIndex - this.rowsCols);
				topMover.addClass('on topMover');
				var topMoverPrev = topMover.prev();
				var topMoving = function() {
					topMover.detach().hide().insertAfter(_this.emptyCell.prev()).fadeIn(fadeSpeed);
					_this.emptyCell.detach();
					if ( emptyTileIndex === _this.rowsCols ) { _this.emptyCell.prependTo(_this.$inner); }
					else {  _this.emptyCell.insertAfter(topMoverPrev); };
				};
			}

			if ( (emptyTileIndex % this.rowsCols) !== 0 ) {
				var leftMover = this.emptyCell.prev();
				leftMover.addClass('on leftMover');
				var leftMoving = function() {
					leftMover.detach().hide().insertAfter(_this.emptyCell).fadeIn(fadeSpeed);
				};
			}

			if ( emptyTileIndex < (this.numTiles - this.rowsCols) ) {
				var bottomMover = this.$inner.find('span').eq(emptyTileIndex + this.rowsCols);
				var bottomMoverPrev = bottomMover.prev();
				bottomMover.addClass('on bottomMover');
				var bottomMoving = function() {
					bottomMover.detach().hide().insertBefore(_this.emptyCell.next()).fadeIn(fadeSpeed);
					_this.emptyCell.detach().insertAfter(bottomMoverPrev);
				};
			}

			if ( (emptyTileIndex % this.rowsCols) !== (this.rowsCols-1) ) {
				var rightMover = this.emptyCell.next();
				rightMover.addClass('on rightMover');
				var rightMoving = function() {
					rightMover.detach().hide().insertBefore(_this.emptyCell).fadeIn(fadeSpeed);
				};
			}


			/* Calling the CLick Events on Tiles */
			this.$inner.bind('click', function(e){
				var $clicked = $(e.target);

				if ($clicked.hasClass('topMover') ) {  topMoving(); }
				else if ($clicked.hasClass('bottomMover')) { bottomMoving(); }
				else if ($clicked.hasClass('leftMover')) { leftMoving(); }
				else if ($clicked.hasClass('rightMover')) { rightMoving(); }

				_this.testGameOver();

			})

			// keyboard events
			$(document).unbind('keydown').bind('keydown',function(e) {

				switch(e.keyCode) { // arrow keys
					case 38: // up
						if ( topMover ) { topMoving(); }; break;
					case 40: // down
						if ( bottomMover ) { bottomMoving(); }; break;
					case 37: // left
						if ( leftMover ) { leftMoving(); }; break;
					case 39: // right
						if ( rightMover ) { rightMoving(); }; break;
				}

				_this.testGameOver();
			});

		},

		testGameOver : function() {

			var _this = this;

			var sequenceError = false;

			// @fix - don't use text value for indexing
			// test first if first cell has 0 index, if not game not won
			if ( parseInt(this.$inner.find('span:first').text()) !== 0 ) {

				// loop through each tile and check if index of tiles are sequential
				this.$inner.find('span').each(function() {
					var $tile = $(this);
					var tileIndex = parseInt($tile.text() );

					if ( tileIndex !== $tile.index() + 1 ) {  sequenceError = true; return false; }
				});
			};

			/**** GAME NOT OVER - setupMovers() calls itself until there are no sequence errors (game is over) */
			if ( sequenceError === true ) {  this.setupMovers(); return false; }

			else {   /**** YOU WIN!!!!!!! ******/
				this.$inner.delay(300).fadeOut(200,function() {
					_this.$image.hide().appendTo(_this.$parent).fadeIn(200);
				});
			}

		},

		loadControls : function() {

			var _this = this;

			var $actions = $('<div/>').addClass('actions clr');

			var $logo = $('<h2/>', { id:'logo', text:'.slidePuzzle()' })
				.appendTo($actions);

			// -- Refresh Image ------------------------------------------------------ //
			var $btnRefresh = $('<button/>', { type: 'button', text:'Refresh Pic' })
				.addClass('refresh')
				.bind('click',function() {
					_this.$inner.remove();
					_this.$image.appendTo(_this.$parent);
					_this.buildTiles();
					return false;
				}).appendTo($actions);


			// -- Change Rows Columns ------------------------------------------------------ //
			/* Change Columns */
			var $changeRowsCols = $('<input/>',{ value:this.rowsCols  })
				.addClass('newRowsCols')
				.appendTo($actions);

			var changeRowsCols = function() {
				var $newValue = parseInt( $changeRowsCols.val() );
				_this.$inner.remove();
				_this.$image.appendTo(_this.$parent);
				_this.setRowsColumns($newValue);
			};

			// Load New Image Button
			$('<button/>', { type: 'button', text:'Change Column #' })
				.addClass(_this.settings.class_changeRowsColsButton)
				.bind('click',function() {
					changeRowsCols(); return false;
				}).insertBefore($changeRowsCols);

			// $changeRowsCols.pressEnter(changeRowsCols);
			$changeRowsCols.pressEnter(function() { changeRowsCols(); });

			// -- Load New Image ------------------------------------------------------ //

			var addNewImage = function(imgSrc) {
				if ( imgSrc ) {
					_this.$inner.remove();
					$('<img/>').attr('src',imgSrc)
						.load(function() {
							$(this).appendTo(_this.$parent);
							_this.setImage();
						});
				 //add validation conditions
				} else {  alert('you didn\'t put anything in there dummy'); }
			};


			var $loadImgInput = $('<input/>',{ type:'text' })
				.attr('placeholder',this.settings.text_loadImgPlaceholder)
				.bind('focus',function(){ this.select(); });

			// Load New Image Button
			var $loadImgButton = $('<button/>', { type: 'button', text:'or Upload a Square Pic' })
				.addClass(_this.settings.class_loadImgButton)
				.click(function() {
					addNewImage($loadImgInput.val()); return false;
				});

			//$loadImgInput.pressEnter(changeRowsCols);
			$loadImgInput.pressEnter(function() {
				addNewImage( $loadImgInput.val() );
			});

			// -- Build Preset List ------------------------------------------------------ //
			var $imageList = $('<div/>');

			// build link for each picture in list
			$.each(this.settings.defaultPictures, function(index,picture) {
				$('<a/>', { href:picture.url, text:picture.name })
					.appendTo($imageList)
					.click(function() {
						addNewImage(picture.url);
						return false;
					});
			});

			// build dropdown
			var $imagesDropdownTrigger = $('<dt/>', { text:'Change Image' });

			var $imagesDropdown = $('<dl/>', { 'class':'image-selector' })
				.prependTo($actions)
				.append( $imagesDropdownTrigger )
				.append(
					$('<dd/>')
						.append($imageList)
						.append(
							$('<div/>').css('overflow','hidden')
								.append($loadImgInput).append($loadImgButton)
						)
				);

			// add dropdown functionality if dropdown is loaded
			if ( jQuery().dropDown ) {
				$imagesDropdown.addClass('dropdown')
					.dropDown();

			// or just display the panel for user activate with their own control
			} else { $imagesDropdown.show(); }

			// add focus to load Image input
			$imagesDropdownTrigger.click(function() {
				$loadImgInput.focus();
			});

			// -- add actions panel to display  ------------------------------------------ //
			$actions.prependTo(this.$parent);
		}
	};

	$.fn.puzzlePic = function(options) {

		var settings = {
			defaultPictures : null,
			class_loadImgButton : 'loadImg',
			class_changeRowsColsButton: 'changeRowsCols',
			text_loadImgPlaceholder : 'enter URL'
		};

		return this.each(function() {
			if ( options ) { $.extend(settings,options); }
			var pp = new $.PuzzlePic($(this),settings);
		});
	};


})(jQuery);

