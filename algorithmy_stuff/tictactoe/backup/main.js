
(function($) {
	
	$.TicTacToeYo = function($parent,settings) {
		
		var _this = this;
		
		this.$parent = $parent;
		this.settings = settings;

		// default - first person's turn set at beginning
		this.player = 1;
		this.gameWon = false;
		this.turn = 1;

		// make boardSize divisble by 3, subtract any remainders before division
		var boardSize = parseInt(this.settings.boardSize) 
			- parseInt(this.settings.boardSize) % this.settings.rowsColumns;

		// set each tile size (-1 is for the margin between tiles)
		var tileSize = boardSize / this.settings.rowsColumns - 1;
		
		// create game wrapper
		this.$game = $('<div/>')
			.addClass(this.settings.class_game)
			.css({ 'width':boardSize, 'height':boardSize, 'margin':'0 auto'  });

		// create 9 tiles for movement
		for ( var i=0, len = Math.pow(this.settings.rowsColumns,2); i < len; i++ ) {
			
			$('<span/>')
				.attr('class',this.settings.class_unselected)
				.css({
					'width': tileSize, 'height': tileSize,
					'float':'left', 'margin': '1px 1px 0 0',
					'text-align':'center', 
					'line-height':(tileSize - 10) + 'px',
					'font-size':tileSize * .7
				})
				.appendTo(this.$game)
				.click(function() {
					var $tile = $(this);
					
					// if game is won, or no more tiles to select (stalemate), reset game
					if ( _this.gameWon === true || _this.$game.find('.'+ _this.settings.class_unselected).length === 0 ) { 
						_this.resetGame(); return false; 

					// if one player game, exit out of function if computer's turn
					} else if ( _this.settings.players === 1 && _this.player === 2 ) { 
						return false; 
					
					// if the tile is unselected
					} else if ( $tile.hasClass(_this.settings.class_unselected) ) {
						_this.pickTile($tile);
						
					// if tile was already taken, tell the player they are dumb
					} else { alert('can\'t go there dummy'); }
				});
		};
		
		// add elements to page
		this.$game
			.add(this.addOptions())
			.appendTo(this.$parent);
	};
	
	$.TicTacToeYo.prototype = {
		displayGameState : function(string) {
            console.log('str',string);
			this.$gameState.text(string);							
		},
		testIfGameOver : function() {
			
			var _this = this;
			
			// get class of current player
			var currentPlayerClass = this.player === 1 ? this.settings.class_playerOne : this.settings.class_playerTwo;

			// get current tiles
			var $currentTiles = this.$game.find('.' + currentPlayerClass);
			
			// -- Test if enough tiles selected 
			if ( $currentTiles.length < this.settings.rowsColumns ) { return false; }
						
			// -- Test winning cases --------------------------------------------------------------- //
			//  test conditions below will run this function based on start placement and increment values
			var checkIfWinner = function(possibleFirstPositions, increment) {

				// if gameWon is true from prev test, exit out of function
                // @fix - why do we need to do this again? 
				if ( _this.gameWon === true ) { return false; }
				
				// if not, iterate through possibleFirstPositions to find a match
				$.each(possibleFirstPositions,function(index,position) {
					
					// (-1) adjust index to return from 1 indexing to 0 indexing for .eq(XX)
					var adjustedIndex = position-1;

					var $possFirstPos = _this.$game.find('span').eq(adjustedIndex);
					var $possSecondPos = _this.$game.find('span').eq(adjustedIndex + increment);
					var $possThirdPos = _this.$game.find('span').eq(adjustedIndex + increment*2);

					var $potentialWinners = $possFirstPos
						.add($possSecondPos)
						.add($possThirdPos);
					
					// check if possibleFirstPosition and it's two incremented positions have currentPlayer's class
					if ( $possFirstPos.hasClass(currentPlayerClass) 
						&& $possSecondPos.hasClass(currentPlayerClass) 
						&& $possThirdPos.hasClass(currentPlayerClass)  ) {
							_this.gameWon = true;
							$potentialWinners.addClass(_this.settings.class_winner);
							_this.$game.find('.'+_this.settings.class_unselected).removeClass(_this.settings.class_unselected);
							_this.displayGameState('Player ' + _this.player + ' Wins!' )
							return false;
					}
				});
			};

			// @fix - static values, don't need to get these on every test
			var starters = {
				rc : this.settings.rowsColumns, // shortcut for this.settings.rowsColumns 
				horizontalStarters : [],  		// get horizontal and vertical first items
				verticalStarters : []
			};

			// get horizontal starters for winning combo
			for ( var i=0; i < starters.rc; i++ ) {
				starters.horizontalStarters.push( 1 + starters.rc*i );
				starters.verticalStarters.push( 1 + i );
			};
						
			// test if all across, if pos 1,4,7 - if pos+1 and pos+2 are selected, game won
			checkIfWinner(starters.horizontalStarters, 1);			

			// test if all vertical, if pos 1,2,3 - if pos+3 and pos+6 are selected, game won
			checkIfWinner(starters.verticalStarters, starters.rc);

			// test if top left to bottom right, if pos 1 - if pos+4and pos+8 are selected, game won
			checkIfWinner([ 1 ], starters.rc+1);

			// test if top right to bottom left, if pos 3 - if pos +2 and +4 are selected, game won
			checkIfWinner([ starters.rc ], starters.rc-1);
						
			// if game not won and all moves made, it's a draw
			if ( this.$game.find('.' + this.settings.class_unselected).length === 0 && this.gameWon === false ) {
			    this.displayGameState('Draw!');
			}
			
			
			
		},
		resetGame : function() {
			
			// increment number of games played and reset game defaults
			this.gamesPlayed++;
			this.gameWon = false;
			this.player = 1;
			this.turn = 1;
			this.displayGameState('Player 1');

	        // if we have a autoplay timeout already running, clear it
	        if ( this.autoplayNextGameTimeout ) { clearTimeout(this.autoplayNextGameTimeout); }

	        // if we have a autoPickNextPiece } timeout already running, clear it
	        if ( this.autoPickNextPieceTimeout ) { clearTimeout(this.autoPickNextPieceTimeout); }


			// reset all tiles to unselected, and remove x's and o's
			this.$game.find('span')
				.attr('class',this.settings.class_unselected)
				.text('');
				// @fix - add any other winning notices
		},
		addOptions : function() {
			
			var _this = this;

			// container for options 
			var $options = $('<div/>', { 'class':this.settings.class_options });
			
    		// create container that shows current player 
    		this.$gameState = $('<div/>', { html: this.settings.text_currentPlayerDisplay + '<span>' + this.player + '</span>' })
    			.addClass(this.settings.class_currentPlayerDisplay)
    			.appendTo($options);
			
			// -- PLAYER OPTIONS -------------------------------------------------------------------------------------
			var $players = $('<div/>', { 'class':this.settings.class_players + ' clr' })
				.appendTo($options);
			
			var playerOptions = [
				{ players:0, label:'Auto Play' },
				{ players:1, label:'One Player' },
				{ players:2, label:'Two Player' }
			];
			
			$.each(playerOptions, function(index,item) {
			    
				var $gameOption = $('<a/>', { href:'#', type:'button', text:item.label })
				    .data('gameType',item.players)
				    .click(function() {
				        var $this = $(this);
				        if ( !$this.hasClass('on') ) {
    				        _this.settings.players = item.players;
    				        _this.resetGame();
    				        $players.find('.on').removeClass('on');
    				        $this.addClass('on');
    				        
    				        // start autoplay if 0 players
    				        if ( item.players === 0 ) { 
    				            
            					// set number of games played, in autoplay will play games until autoplayThisManyGames is played
            					_this.gamesPlayed = 0;
            					_this.pickRandomTile(); 
    				        }
				        }
				        return false;
				    })
					.appendTo($players);
					
				if ( item.players === _this.settings.players ) { $gameOption.addClass('on'); }
			});
							
			var $resetGame = $('<a/>', { 'class':this.settings.class_resetGame, href:'#', text:this.settings.text_resetGame })
				.click(function() { 

                    // if autoplay, we deselect the option 
				    var $currentGameType = $players.find('.on');
				    if ( $currentGameType.data('gameType') === 0 ) { $currentGameType.removeClass('on'); }

				    _this.resetGame(); return false; 
				});
			
			return $options
				.append($resetGame)
				.append(this.$startAutoplay);
		},
		pickTile : function($tile) {
			
			var _this = this;
			
			// set this tile to be owned by this player
			var currentPlayerClass = _this.player === 1 ? _this.settings.class_playerOne: _this.settings.class_playerTwo;
			$tile.attr('class', currentPlayerClass );

			// declare next player below, but do not assign to current player unless game does not win
			var nextPlayer = null; 

			// depending on player, set X or O and set next player 
			if ( _this.player === 1 ) {
				$tile.html('x');  
				nextPlayer = 2;
			} else {
				$tile.html('o');  
				nextPlayer = 1;
			}

			// test if game is over
			_this.testIfGameOver();

			// IF you didn't win....
			if ( _this.gameWon !== true && this.$game.find('.' + this.settings.class_unselected).length !== 0 ) {

				// set to next turn
				_this.turn++;

				// set nextPlayer as current player 
				_this.player = nextPlayer;

				// change current player display
				_this.displayGameState('Player '+ _this.player);

				// if one player game
				if ( _this.settings.players === 1 && _this.player === 2 ) { 
					setTimeout(function() { _this.pickRandomTile(); }, _this.settings.delay_autoPlayMove); 					
				}
			}
		},
		pickRandomTile : function() {

			var _this = this;
						
			// find unselected tiles and turn from jQuery.() object into an array of DOM elemnts 
			var unselectedTiles = $.makeArray(this.$game.find('.'+ this.settings.class_unselected ));

            this.autoPickNextPieceTimeout = null;
			// if game is not over	--------------------------------------------- //
			if ( this.gameWon !== true && unselectedTiles.length !== 0 ) {
				
				// find random item in unselectedTiles and convert to jQuery selector
				var $randomTile = $(unselectedTiles[Math.floor(Math.random() * unselectedTiles.length)]);
				
				var $bestMove = this.getGoodTile($randomTile);
				console.log('bm',$bestMove);
				
				// select a random tile
				this.pickTile($bestMove);

				// if players = 0, rerun pickRandomTile until game is finished
				if ( this.settings.players === 0 ) {
					this.autoPickNextPieceTimeout = setTimeout(function() { _this.pickRandomTile(); }, _this.settings.delay_autoPlayMove);
				}
			
			// IF GAME IS WON, test how many number of autoplayed games have passed -------------- //
			} else if ( this.gamesPlayed < this.settings.autoplayThisManyGames ) {

				this.autoplayNextGameTimeout = setTimeout(function() {

					// reset game
					_this.resetGame();
										 							
					// play again! until autoplayThisManyGames is reached
					this.autoPickNextPieceTimeout = setTimeout(function() { _this.pickRandomTile(); }, _this.settings.delay_autoPlayMove); 
						
				}, this.settings.delay_autoPlayReplay);
			}
		},
		getGoodTile : function($randomTile) {
						
			var currentBoard = $.makeArray(this.$game.children())
			
			return $randomTile;
		}
	};

	$.fn.ticTacToeYo = function(options) {
		
		var settings = {
			rowsColumns : 3,
			boardSize : 400,
			autoplayThisManyGames : 80,
			playComputer : true,
			players: 1,
			defaultGameType: 1,  
			
			classNamespace: 'km_',
			class_game : 'tictactoe',
			class_currentPlayerDisplay : 'currentPlayer',
			class_playerOne : 'one',
			class_playerTwo : 'two',
			class_unselected : 'empty',
			class_autoplaying : 'autoplaying',
			class_winner : 'winner',
			class_players: 'players',
			class_options: 'options',
			class_resetGame: 'resetGame',
			
			text_currentPlayerDisplay : 'Player ',
			text_resetGame: 'Reset Game',

			delay_autoPlayMove : 150,
			delay_autoPlayReplay : 1000
		};
		
		return this.each(function() {
			if ( options ) { $.extend(settings,options); }
			var trackStuff = new $.TicTacToeYo($(this), settings);
		});
	}
	
})(jQuery);


