/*
Java script for tic tac toe
to God be the glory.
*/

function gameQuery(tableName, rowName, cellName, cellDisplay) {
    /* Store query strings for finding game elements */
    if(this == window) return new gameQuery();
    var join = (q1, q2) =>  q1 + " " + q2;
    this.table = tableName;
    this.row = join(this.table, rowName);
    this.cell = join(this.row, cellName);
    this.cellDisplay = cellDisplay;
    this.cellDisplayQuery = join(this.cell, this.cellDisplay);
    // each cell div has data-cell-no set to a number depending on the cell
    this.data_cell_no = "data-cell-no"; // for getting cell number
    this.$cells = $(this.cell);
}

function Board() {
    var board_length = 9
      , board = Array(9);
    board.fill(" ");

    this.empty = " ";
    this.boardCopy = function() {
        var new_board = Array(9);
        for (var i = 0; i < board.length; i++) {
            new_board[i] = board[i];
        }
        return new_board;
    }

    this.isEmptyCell = function(cell_no) {
        return board[cell_no] === this.empty;
    }

    this.makeMove = function(cell_no, letter) {
        board[cell_no] = letter;
    }

    this.isWinner = function(playerLetter) {
        var wins = [[0, 1, 2], // top
        [3, 4, 5], // middle
        [6, 7, 8], // bottom
        [0, 3, 6], // left side
        [1, 4, 7], // middle side
        [2, 5, 8], // right side
        [0, 4, 8], // diagonal 1
        [2, 4, 6]// diagonal 2
        ];
        var hasWon = (testCells)=>{
            for (var i = 0; i < testCells.length; i++) {
                if (board[testCells[i]] != playerLetter)
                    return false;
            }
            return true;
        }
        for (var i = 0; i < wins.length; i++) {
            if (hasWon(wins[i]))
                return true;
        }
        return false;
    }
}

function Player(board, playerLetter, playerName) {
    //has won
    //make move
    this.letter = playerLetter;
    this.name = playerName;

    this.draw = function(on_) {// draw this.letter some where
    }

    this.makeMove = function(where) {
        board.makeMove(where, this.letter);
    }

    this.getMove = function(elem) {
        // do something internally
        // drawboard by changing ui
        var cell_id = elem.attr(this.query.data_cell_no)
          , cell_display = elem.find(this.query.cellDisplay);

        if (cell_id===null) {
            throw Error("no data");
        }
        var is_cell_free = board.isEmptyCell(cell_id);
        // check if current_player is playing in his/her cell
        if (is_cell_free) {
            // board.makeMove(cell_id, "x");
            var move = cell_id;
            this.makeMove(move);
            elem.find("span").html(this.letter);
            // draw(player.letter)
            return move;
        } else {
            // board cell was not free let user know
            alert("cell taken");
        }

    }

    this.pass = function() {
        // pass play to next player
        this.turn.nextPlayer().playAndPass();
    }

    this.hasWon = function() {
        return board.isWinner(this.letter);
    }

    this.gameIsTie = function() {
        for (var i = 0; i < 10; i++) {
            if (board.isEmptyCell(i)) {
                return false;
            }
        }
        return true;
    }

    this.checkMove = function(move) {
        // assertain if the game has finish
        if (this.hasWon()) {
            // do win
            alert("game won")
        } else if (this.gameIsTie()) {
            // tie
            alert("tie!")
        } else {
            this.query.$cells.unbind('click');
            // so other players can play
            return true;
            // still playing
        }
        return false;
        // End game
    }

    this.play = function() {
        // here we speek the language of callback
        // get where user want's to play
        // alert('current player ' + this.name)
        this.query.$cells.click((e)=>{
        	var elem = $(e.target);
            var stillPlaying = this.checkMove(this.getMove(elem));
            if (stillPlaying) {
                // pass to next player
                this.pass();
            }
        });
    }

    this.playAndPass = function() {
        this.play();
    }
}

function Turn(players, firstPlayer) {
    // decides who should play
    // *firstplayer* should be a number counting from 0

    const wrap_length = players.length;
    const no_players = wrap_length;
    var current_player = firstPlayer;
    
    this.wrap = function(n){
    	return Math.abs(((n+1) % wrap_length) - 1);
    }
    // this.wrap = function(n){
    // 		//simpler version
    // 	if (n === 1){
    // 		return 0;
    // 	}
    // 	return 1;
    	
    // }
    this.getPlayer = function(n) {
        // return player using index else if n is not given current player
        if (!!n) {
            return players[n];
        }
        return players[current_player];
    }

    this.nextPlayer = function(save) {
        var c = this.wrap(current_player + 1);
        if (!save) {
            current_player = c;
        }
        return players[c];
    }

    this.peekNextPlayer = function() {
        // check next player without changing current player
        return this.nextPlayer(true);
    }

    this.attachToPlayers = function(obj, name) {
        // attach an object to all players
        for (var i = 0; i < no_players; i++) {
            this.getPlayer(i)[name] = obj;
            // as billed :)
        }
    }

    // Attach a reference of this object to all players
    // so they can call next player to play
    this.attachToPlayers(this, 'turn');
}

function Game(query) {
	var
    board = new Board(),
    player = new Player(board,"x",'Williams'),
    computer = new Player(board,"o",'Computer'),
    turn = new Turn([player, computer], 0);

    turn.attachToPlayers(query, 'query');
    turn.getPlayer().playAndPass();
    //loop

    var dispatchEvents = function() {
        query.$cells.each(function(i) {
            // set cell id numbers as data-*
            $(this).attr(query.data_cell_no, i);
        });
        // cells.bind("click", function(){
        // 	moveTo(this);
        // 	nextPlayer().play();
        // });
    }
    dispatchEvents();
}

$(document).ready(function() {
    $game = Game(new gameQuery(".game-table",".row",".cell","span"));
});