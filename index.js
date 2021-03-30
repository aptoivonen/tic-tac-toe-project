((doc) => {
  const { log } = console;

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
              log("Ai made move", [randomRow, randomColumn]);
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
        }

        const diagonalSquares2 = [];
        for (
          let row = 0, column = columns - 1;
          row < rows, column <= 0;
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

  // test game
  window.game = game;

  // Cache dom
  const cells = doc.querySelectorAll(".cell");
  const player1Name = doc.getElementById("player1-name");
  const player1Input = doc.getElementById("player1-input");

  // Bind events
  cells.forEach((cell) => cell.addEventListener("click", cellToggle));
  player1Name.addEventListener("dblclick", nameToggle);
  player1Input.addEventListener("change", inputName);
  player1Input.addEventListener("keyup", inputName);
  player1Input.addEventListener("blur", inputName);

  // Listeners
  function cellToggle() {
    this.classList.toggle("x");
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
      player1Name.textContent = value;
    }
    hide(this);
    show(player1Name);
  }

  function show(element) {
    element.classList.remove("hide");
  }

  function hide(element) {
    element.classList.add("hide");
  }
})(document);
