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
      constructor(id, name) {
        this.id = id;
        this.name = name;
      }
    }

    function playerFactory(type) {
      if (type === "humanPlayer") {
        return new Player("Player1", 1);
      }

      if (type === "aiPlayer") {
        return new Player("AI", 2);
      }

      throw new Error("player type wrong:" + type);
    }

    const ai = (() => {})();

    const gameLogic = ((gameBoard, humanPlayer, aiPlayer) => {
      return {
        getBoard() {},
        setCell(row, column, player) {},
        startNewGame() {},
        isGameOver() {},
      };
    })();

    return {
      makeMove(row, column) {
        log("called makeMove", row, column);
      },
      setPlayerName(name) {
        log("called setPlayerName", name);
      },
      restart() {
        log("called restart");
      },
    };
  })();

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
