((doc) => {
  // Game logic
  const game = (() => {
    const gameBoard = (() => {
      let board = [
        ["", "", ""],
        ["", "", ""],
        ["", "", ""],
      ];

      function mapBoardElements(fn) {
        return board.map((arr) => arr.map(fn));
      }

      return {
        getBoard() {
          return mapBoardElements((el) => el);
        },

        resetBoard() {
          board = mapBoardElements((el) => "");
        },

        setCell(row, column, marker) {
          if (this.isTaken(row, column)) return false;
          board[row][column] = marker;
          return true;
        },

        isTaken(row, column) {
          return !!board[row][column];
        },
      };
    })();
    class Player {
      constructor(id, name, marker) {
        this.id = id;
        this.name = name;
        this.marker = marker;
      }
    }

    const playerFactory = (type) => {
      const MARKERS = Object.freeze({ humanPlayer: "x", aiPlayer: "o" });

      if (type === "humanPlayer") {
        return new Player(1, "Player1", MARKERS.humanPlayer);
      }

      if (type === "aiPlayer") {
        return new Player(2, "AI", MARKERS.aiPlayer);
      }

      throw new Error("player type wrong:" + type);
    };

    const humanPlayer = playerFactory("humanPlayer");
    const aiPlayer = playerFactory("aiPlayer");

    const gameLogic = ((gameBoard, humanPlayer, aiPlayer) => {
      const RESULTS = Object.freeze({ winner: "winner", tie: "tie" });
      let result = null;

      const ai = (() => {
        const makeMove = () => {
          const board = gameBoard.getBoard();
          const rows = board.length;
          const columns = board[0].length;
          let moveMade = false;
          while (!moveMade) {
            const [randomRow, randomColumn] = [
              Math.floor(rows * Math.random()),
              Math.floor(columns * Math.random()),
            ];
            if (gameBoard.setCell(randomRow, randomColumn, aiPlayer.marker)) {
              moveMade = true;
            }
          }
        };

        return {
          makeMove,
        };
      })();

      const getWinningSquaresCoordinatesForPlayer = (player) => {
        const board = gameBoard.getBoard();
        const rows = board.length;
        const columns = board[0].length;

        const areAllSquaresForOnePlayer = (squares) => {
          return (
            squares.filter((square) => square === player.marker).length ===
            squares.length
          );
        };

        for (let row = 0; row < rows; row++) {
          if (areAllSquaresForOnePlayer(board[row])) {
            const squareCoordinates = [];
            for (let column = 0; column < columns; column++) {
              squareCoordinates.push([row, column]);
            }
            return squareCoordinates;
          }
        }

        for (let column = 0; column < columns; column++) {
          const squares = [];
          for (let row = 0; row < rows; row++) {
            squares.push(board[row][column]);
          }
          if (areAllSquaresForOnePlayer(squares)) {
            const squareCoordinates = [];
            for (let row = 0; row < rows; row++) {
              squareCoordinates.push([row, column]);
            }
            return squareCoordinates;
          }
        }

        const diagonalSquares1 = [];
        for (
          let row = 0, column = 0;
          row < rows, column < columns;
          row++, column++
        ) {
          diagonalSquares1.push(board[row][column]);
        }
        if (areAllSquaresForOnePlayer(diagonalSquares1)) {
          const squareCoordinates = [];
          for (
            let row = 0, column = 0;
            row < rows, column < columns;
            row++, column++
          ) {
            squareCoordinates.push([row, column]);
          }
          return squareCoordinates;
        }

        const diagonalSquares2 = [];
        for (
          let row = 0, column = columns - 1;
          row < rows, column >= 0;
          row++, column--
        ) {
          diagonalSquares2.push(board[row][column]);
        }
        if (areAllSquaresForOnePlayer(diagonalSquares2)) {
          const squareCoordinates = [];
          for (
            let row = 0, column = columns - 1;
            row < rows, column <= 0;
            row++, column--
          ) {
            squareCoordinates.push([row, column]);
          }
          return squareCoordinates;
        }

        return false;
      };

      const isBoardFull = () => {
        return gameBoard
          .getBoard()
          .map((row) => row.every((el) => el))
          .every((row) => row);
      };

      const possibleResultAfterPlayerPlay = (player) => {
        const winningCoordinates = getWinningSquaresCoordinatesForPlayer(
          player
        );
        if (winningCoordinates) {
          return {
            board: gameBoard.getBoard(),
            result: RESULTS.winner,
            winningPlayer: player.id,
            winningSquares: winningCoordinates,
          };
        }
        if (isBoardFull()) {
          return {
            board: gameBoard.getBoard(),
            result: RESULTS.tie,
            winningPlayer: undefined,
            winningSquares: [],
          };
        }
        return null;
      };

      const makeMove = (row, column) => {
        if (result) return result;
        if (!gameBoard.setCell(row, column, humanPlayer.marker)) return false;
        result = possibleResultAfterPlayerPlay(humanPlayer);
        if (result) return result;
        ai.makeMove();
        result = possibleResultAfterPlayerPlay(aiPlayer);
        if (result) return result;
        return {
          board: gameBoard.getBoard(),
          result: "",
          winningPlayer: undefined,
          winningSquares: [],
        };
      };

      const startNewGame = () => {
        gameBoard.resetBoard();
        result = null;
      };

      return {
        makeMove,
        startNewGame,
      };
    })(gameBoard, humanPlayer, aiPlayer);

    return {
      makeMove(row, column) {
        return gameLogic.makeMove(row, column);
      },
      setPlayerName(name) {
        if (!name) return false;
        humanPlayer.name = name;
        return true;
      },
      getPlayerName() {
        return humanPlayer.name;
      },
      restart() {
        gameLogic.startNewGame();
      },
    };
  })();

  // Cache dom
  const grid = doc.getElementById("grid");
  const cells = doc.querySelectorAll(".cell");
  const player1Section = doc.getElementById("player1-section");
  const player1Name = doc.getElementById("player1-name");
  const player1Input = doc.getElementById("player1-input");
  const player2Section = doc.getElementById("player2-section");
  const restartButton = doc.getElementById("restart-button");

  // Bind events
  cells.forEach((cell) => cell.addEventListener("click", makeMove));
  player1Name.addEventListener("dblclick", nameToggle);
  player1Input.addEventListener("change", inputName);
  player1Input.addEventListener("keyup", inputName);
  player1Input.addEventListener("blur", inputName);
  restartButton.addEventListener("click", restart);

  // Cache game result
  let gameResult;

  // Listeners
  function makeMove(e) {
    const row = parseInt(this.dataset.row, 10);
    const column = parseInt(this.dataset.column, 10);
    gameResult = game.makeMove(row, column);
    render();
  }

  function nameToggle() {
    hide(this);
    player1Input.value = this.textContent;
    show(player1Input);
    player1Input.focus();
  }

  function inputName(e) {
    if (e.type === "keyup" && e.key !== "Enter") return;
    const value = this.value;
    if (value) {
      game.setPlayerName(value);
    }
    hide(this);
    show(player1Name);
    render();
  }

  function show(element) {
    element.classList.remove("hide");
  }

  function hide(element) {
    element.classList.add("hide");
  }

  function restart() {
    game.restart();
    gameResult = undefined;
    render();
  }

  function render() {
    // Player 1 name
    player1Name.textContent = game.getPlayerName();

    // Winner and Tie
    if (!gameResult) {
      player1Section.classList.remove("winner", "tie");
      player2Section.classList.remove("winner", "tie");
    } else if (gameResult.result === "tie") {
      player1Section.classList.add("tie");
      player2Section.classList.add("tie");
    } else if (gameResult.result === "winner") {
      gameResult.winningPlayer === 1
        ? player1Section.classList.add("winner")
        : player2Section.classList.add("winner");
    }

    // Game situation
    if (!gameResult) {
      cells.forEach((cell) => cell.classList.remove("x", "o"));
    } else {
      const { board } = gameResult;
      const rows = board.length;
      const columns = board[0].length;
      for (row = 0; row < rows; row++) {
        for (column = 0; column < columns; column++) {
          const token = gameResult.board[row][column];
          if (token) {
            findCell(row, column).classList.add(token);
          }
        }
      }
    }

    function findCell(row, column) {
      return grid.querySelector(
        `.cell[data-row="${row}"][data-column="${column}"]`
      );
    }
  }
})(document);
