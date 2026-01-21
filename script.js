const SIZE = 5;
const SHIPS = 3;

const boardDiv = document.getElementById("board");
const message = document.getElementById("message");
const modeSelect = document.getElementById("mode");

let board = [];
let computerShips = new Set();
let usedByComputer = new Set();
let targets = [];

function initBoard() {
  boardDiv.innerHTML = "";
  board = [];

  for (let r = 0; r < SIZE; r++) {
    board[r] = [];
    for (let c = 0; c < SIZE; c++) {
      const cell = document.createElement("button");
      cell.className = "cell";
      cell.onclick = () => playerMove(r, c, cell);
      boardDiv.appendChild(cell);
      board[r][c] = cell;
    }
  }
}

function placeShips() {
  while (computerShips.size < SHIPS) {
    const r = Math.floor(Math.random() * SIZE);
    const c = Math.floor(Math.random() * SIZE);
    computerShips.add(`${r},${c}`);
  }
}

function neighbors(r, c) {
  return [
    [r+1,c],[r-1,c],[r,c+1],[r,c-1]
  ].filter(([x,y]) => x>=0 && y>=0 && x<SIZE && y<SIZE);
}

function playerMove(r, c, cell) {
  const key = `${r},${c}`;
  if (cell.disabled) return;

  cell.disabled = true;

  if (computerShips.has(key)) {
    cell.textContent = "X";
    cell.classList.add("hit");
    computerShips.delete(key);
    message.textContent = "Hit!";
  } else {
    cell.textContent = "O";
    cell.classList.add("miss");
    message.textContent = "Miss!";
  }

  if (computerShips.size === 0) {
    message.textContent = "You win! 🎉";
    disableBoard();
    return;
  }

  setTimeout(computerMove, 600);
}

function computerMove() {
  let move;

  if (modeSelect.value === "hard" && targets.length > 0) {
    move = targets.pop();
  } else {
    do {
      move = [
        Math.floor(Math.random() * SIZE),
        Math.floor(Math.random() * SIZE)
      ];
    } while (usedByComputer.has(move.toString()));
  }

  usedByComputer.add(move.toString());

  if (modeSelect.value === "hard") {
    neighbors(move[0], move[1]).forEach(n => targets.push(n));
  }
}

function disableBoard() {
  document.querySelectorAll(".cell").forEach(c => c.disabled = true);
}

initBoard();
placeShips();
