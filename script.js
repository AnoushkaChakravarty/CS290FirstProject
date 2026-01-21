const SIZE = 5;
const SHIPS = 3;

const playerBoardDiv = document.getElementById("player-board");
const computerBoardDiv = document.getElementById("computer-board");
const message = document.getElementById("message");
const modeSelect = document.getElementById("mode");

let phase = "placement";

let playerShips = new Set();
let computerShips = new Set();

let playerBoard = [];
let computerBoard = [];

let computerUsed = new Set();
let targets = [];

function createBoard(boardDiv, clickHandler) {
  boardDiv.innerHTML = "";
  const board = [];

  for (let r = 0; r < SIZE; r++) {
    board[r] = [];
    for (let c = 0; c < SIZE; c++) {
      const cell = document.createElement("button");
      cell.className = "cell";
      cell.onclick = () => clickHandler(r, c, cell);
      boardDiv.appendChild(cell);
      board[r][c] = cell;
    }
  }
  return board;
}

function placeComputerShips() {
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

/* ---------- PLAYER PLACEMENT ---------- */

function placePlayerShip(r, c, cell) {
  if (phase !== "placement") return;

  const key = `${r},${c}`;
  if (playerShips.has(key)) return;

  playerShips.add(key);
  cell.classList.add("ship");

  if (playerShips.size === SHIPS) {
    phase = "battle";
    message.textContent = "Battle started! Attack the enemy board.";
  }
}

/* ---------- PLAYER ATTACK ---------- */

function playerAttack(r, c, cell) {
  if (phase !== "battle" || cell.disabled) return;

  cell.disabled = true;
  const key = `${r},${c}`;

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
    endGame();
    return;
  }

  setTimeout(computerMove, 700);
}

/* ---------- COMPUTER TURN ---------- */

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
    } while (computerUsed.has(move.toString()));
  }

  computerUsed.add(move.toString());
  const key = move.toString();
  const cell = playerBoard[move[0]][move[1]];

  if (playerShips.has(key)) {
    cell.classList.add("hit");
    playerShips.delete(key);
    message.textContent = "Computer hit your ship!";

    if (modeSelect.value === "hard") {
      neighbors(move[0], move[1]).forEach(n => targets.push(n));
    }
  } else {
    cell.classList.add("miss");
    message.textContent = "Computer missed!";
  }

  if (playerShips.size === 0) {
    message.textContent = "Computer wins 😞";
    endGame();
  }
}

function endGame() {
  document.querySelectorAll(".cell").forEach(c => c.disabled = true);
}

/* ---------- INIT ---------- */

message.textContent = "Place your ships (3 clicks)";
playerBoard = createBoard(playerBoardDiv, placePlayerShip);
computerBoard = createBoard(computerBoardDiv, playerAttack);
placeComputerShips();
