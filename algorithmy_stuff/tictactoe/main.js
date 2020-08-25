
(function($) {

	$.TicTacToeYo = function($parent, settings) {
		this.settings = settings;

		this.player = 1;
		this.turn = 1;
		this.gameWon = false;

		this.$board = $parent.find('#game-board');
		this.$gameState = $parent.find('#game-options .currentPlayer');
		this.$playerOptionWrap = $parent.find('#game-options .players');
		this.$playerOptions = this.$playerOptionWrap.find('a');
		this.$resetButton = $parent.find('.resetGame');

		this.createTiles();
		this.setupOptions();
	};


	$.TicTacToeYo.prototype = {

		displayGameState : function(string) {
			this.$gameState.text(string);
		},

		getCurrentPlayerClass: function () {
			return this.player === 1 ? this.settings.class_playerOne :
				this.settings.class_playerTwo;
		},

		getUnselectedItems: function () {
			return this.$board.find('.' + this.settings.class_unselected);
		},


		// -- SETUP BOARD AND OPTIONS ----------------------------------------------------- //
		createTiles: function () {
			var _this = this;
			var totalTiles = Math.pow(this.settings.rowsColumns,2);
			for ( var i=0; i < totalTiles; i++ ) {
				$('<span/>', { 'class': this.settings.class_unselected })
					.appendTo(this.$board)
					.click(function () { _this.triggerTile($(this)); });
			};
		},

		setupOptions : function() {
			var _this = this;
			this.displayGameState('Player 1');
		  this.$playerOptions.eq(1).addClass('on');
			this.$playerOptions.click(function () { _this.triggerGameOption($(this)); })
			this.$resetButton.click(function () { _this.triggerResetFromOptions(); });
		},


		// -- CHECK GAME STATUS ----------------------------------------------------- //
		testIfGameOver : function() {
			if ( this.hasEnoughTilesSelectedForAWin() ) { this.checkPossibleWinners(); }
			if ( this.isADraw() ) { this.displayGameState('Draw!'); }
		},

		hasEnoughTilesSelectedForAWin: function () {
			var $currentTiles = this.$board.find('.' + this.getCurrentPlayerClass());
			return $currentTiles.length >= this.settings.rowsColumns;
		},

		gameWonOrDraw: function () {
			return this.gameWon || this.isADraw();
		},

		isADraw: function () {
			return !this.getUnselectedItems().length && !this.gameWon;
		},

		gameNotWonYet: function () {
			return !this.gameWon && !!this.getUnselectedItems().length;
		},

		isUnselected: function ($tile) {
			return $tile.hasClass(this.settings.class_unselected);
		},

		// -- CHECK FOR WINNERS ----------------------------------------------------- //
		checkPossibleWinners: function () {
			var starters = this.getStarters();
			// all across: if pos 1,4,7 && pos+1 and pos+2 selected
			this.checkIfWinnerType(starters.horizontalStarters, 1);
			// all vertical: if pos 1,2,3 && pos+3 and pos+6 selected
			this.checkIfWinnerType(starters.verticalStarters, starters.rc);
			// diagonal1: if pos 1 && pos+4 and pos+8 selected
			this.checkIfWinnerType([ 1 ], starters.rc+1);
			// diagonal2: if pos 3 && if pos +2 and +4 selected
			this.checkIfWinnerType([ starters.rc ], starters.rc-1);
		},

		// @future - setup for having more that 3 column board
		getStarters: function () {
			var starters = { rc : this.settings.rowsColumns,
				horizontalStarters : [], verticalStarters : []
			};

			for ( var i=0; i < starters.rc; i++ ) {
				starters.horizontalStarters.push( 1 + starters.rc*i );
				starters.verticalStarters.push( 1 + i );
			};

			return starters;
		},

		checkIfWinnerType: function(possibleFirstPositions, increment) {
			var _this = this;
			if ( this.gameWon === true ) { return false; }
			$.each(possibleFirstPositions, function (index, position) {
				_this.checkifWinnerOption(position, increment);
			});
		},

		checkifWinnerOption: function(position, increment) {
			// (-1) adjust index to return from 1 indexing to 0 indexing for .eq(XX)
			var adjustedIndex = position-1;

			var $possFirstPos = this.$board.find('span').eq(adjustedIndex);
			var $possSecondPos = this.$board.find('span').eq(adjustedIndex + increment);
			var $possThirdPos = this.$board.find('span').eq(adjustedIndex + increment*2);

			var $potentialWinners = $possFirstPos
				.add($possSecondPos)
				.add($possThirdPos);

			if ( $possFirstPos.hasClass(this.getCurrentPlayerClass())
				&& $possSecondPos.hasClass(this.getCurrentPlayerClass())
				&& $possThirdPos.hasClass(this.getCurrentPlayerClass()) ) {
					this.setGameAsWon($potentialWinners);
			}
		},


		// -- UPDATE GAME STATE ----------------------------------------------------- //
		setTile : function($tile) {
			$tile.attr('class', this.getCurrentPlayerClass());
			$tile.text(this.player === 1 ? 'x' : 'o');
			this.testIfGameOver();
			var nextPlayer = this.player === 1 ? 2 : 1;
			if ( this.gameNotWonYet() ) { this.switchToNextPlayer(nextPlayer); }
		},

		setGameAsWon: function ($potentialWinners) {
			this.gameWon = true;
			$potentialWinners.addClass(this.settings.class_winner);
			this.getUnselectedItems().removeClass(this.settings.class_unselected);
			this.displayGameState('Player ' + this.player + ' Wins!' )
		},

		resetGame : function() {
			this.gamesPlayed++;
			this.gameWon = false;
			this.player = 1;
			this.turn = 1;
			this.displayGameState('Player 1');

      if ( this.autoplayNextGameTimeout ) { clearTimeout(this.autoplayNextGameTimeout); }
      if ( this.autoPickNextPieceTimeout ) { clearTimeout(this.autoPickNextPieceTimeout); }

			this.$board.find('span').text('')
				.attr('class',this.settings.class_unselected);
		},

		switchToNextPlayer: function (nextPlayer) {
			this.turn++;
			this.player = nextPlayer;
			this.displayGameState('Player ' + this.player);
			this.makeComputerMoveIfOnePlayer();
		},


		// -- TRIGGER GAME OPTIONS ----------------------------------------------------- //
		triggerTile: function ($tile) {
			if ( this.gameWonOrDraw() ) { this.resetGame(); }
			else if ( this.isComputersTurnOnOnePlayerGame() ) { return; }
			else if ( this.isUnselected($tile) ) { this.setTile($tile); }
			else { alert("can't go there dummy"); }
		},

		triggerResetFromOptions: function() {
      this.$playerOptionWrap.find('.on').removeClass('on');
	    this.resetGame();
		},

		triggerGameOption: function($option, item) {
			if ( $option.hasClass('on') ) { return false; }
			this.settings.players = parseInt($option.attr('data-players'));
      this.triggerResetFromOptions();
      $option.addClass('on');
      if ( this.settings.players === 0 ) { this.triggerAutoPlay(); }
		},

		triggerAutoPlay: function () {
			this.gamesPlayed = 0;
			this.makeComputerMove();
		},


		// -- AUTO PLAY ----------------------------------------------------- //
		isComputersTurnOnOnePlayerGame: function () {
			return this.settings.players === 1 && this.player === 2;
		},

		makeComputerMoveIfOnePlayer: function () {
			var _this = this;
			if ( this.isComputersTurnOnOnePlayerGame() ) {
				setTimeout(function() { _this.makeComputerMove(); }, this.settings.delay_autoPlayMove);
			}
		},

		makeComputerMove : function() {
      this.autoPickNextPieceTimeout = null;
			if ( this.gameNotWonYet() ) { this.pickRandomTile(); }
			else if ( this.moreAutoplayGamesToGo() ) { this.startNewAutoplayGameAfterDelay(); }
		},

		pickRandomTile: function () {
			var $unselectedTiles = $.makeArray(this.getUnselectedItems());
			var randomArrayIndex = Math.floor(Math.random() * $unselectedTiles.length);
			var $randomTile = $($unselectedTiles[randomArrayIndex]);
			var $bestMove = this.getGoodTile($randomTile);
			this.setTile($bestMove);
			this.pickAnotherTileIfInAutoplay();
		},

		moreAutoplayGamesToGo: function () {
			var autoplayerGame = this.settings.players === 0;
			var moreGamesToGo = this.gamesPlayed < this.settings.autoplayThisManyGames;
			return autoplayerGame && moreGamesToGo;
		},

		pickAnotherTileIfInAutoplay: function () {
			var _this = this;
			if ( this.settings.players !== 0 ) { return false; }
			this.autoPickNextPieceTimeout = setTimeout(function() {
				_this.makeComputerMove(); }, _this.settings.delay_autoPlayMove);
		},

		startNewAutoplayGameAfterDelay: function () {
			var _this = this;
			this.autoplayNextGameTimeout = setTimeout(function () {
				_this.startNewAutoPlayGame() }, this.settings.delay_autoPlayReplay);
		},

		startNewAutoPlayGame: function () {
			var _this = this;
			this.resetGame();
			this.autoPickNextPieceTimeout = setTimeout(function() { _this.makeComputerMove(); },
				this.settings.delay_autoPlayMove);
		},

		// @future - make computer move look for good options
		getGoodTile : function($randomTile) {
			// var currentBoard = $.makeArray(this.$board.children())
			return $randomTile;
		}
	};

	$.fn.ticTacToeYo = function(options) {

		var settings = {
			rowsColumns : 3,
			autoplayThisManyGames : 80,
			playComputer : true,
			players: 1,

			classNamespace: 'km_',
			class_game : 'tictactoe',
			class_playerOne : 'one',
			class_playerTwo : 'two',
			class_unselected : 'empty',
			class_autoplaying : 'autoplaying',
			class_winner : 'winner',

			delay_autoPlayMove : 150,
			delay_autoPlayReplay : 1000
		};

		return this.each(function() {
			if ( options ) { $.extend(settings,options); }
			var trackStuff = new $.TicTacToeYo($(this), settings);
		});
	}

})(jQuery);


