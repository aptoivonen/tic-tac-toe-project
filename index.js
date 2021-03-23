((doc) => {
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
