const SIZE = 10;
const SHIP_SIZES = [5, 4, 3, 3, 2];

let playerBoardDiv;
let computerBoardDiv;
let message;
let modeSelect;

let phase = "placement";
let placementDirection = "horizontal";
let currentShipIndex = 0;

let playerShips = [];     // array of ships (each ship = array of cells)
let computerShips = [];

let playerBoard = [];
let computerBoard = [];

let computerUsed = new Set();
let targets = [];

/* ---------- BOARD CREATION ---------- */
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

/* ---------- SHIP HELPERS ---------- */
function allShipCells(ships) {
  return ships.flat();
}

function hitShip(ships, key) {
  for (let ship of ships) {
    const index = ship.indexOf(key);
    if (index !== -1) {
      ship.splice(index, 1);
      return ship.length === 0; // sunk
    }
  }
  return false;
}

function neighbors(r, c) {
  return [
    [r + 1, c],
    [r - 1, c],
    [r, c + 1],
    [r, c - 1]
  ].filter(([x, y]) => x >= 0 && y >= 0 && x < SIZE && y < SIZE);
}

/* ---------- PLAYER SHIP PLACEMENT ---------- */
function placePlayerShip(r, c) {
  if (phase !== "placement") return;

  const size = SHIP_SIZES[currentShipIndex];
  const ship = [];

  for (let i = 0; i < size; i++) {
    const nr = placementDirection === "horizontal" ? r : r + i;
    const nc = placementDirection === "horizontal" ? c + i : c;

    if (nr >= SIZE || nc >= SIZE) return;

    const key = `${nr},${nc}`;
    if (allShipCells(playerShips).includes(key)) return;

    ship.push(key);
  }

  ship.forEach(key => {
    const [rr, cc] = key.split(",").map(Number);
    playerBoard[rr][cc].classList.add("ship");
  });

  playerShips.push(ship);
  currentShipIndex++;

  if (currentShipIndex === SHIP_SIZES.length) {
    phase = "battle";
    message.textContent = "All ships placed! Attack the enemy board.";
  } else {
    message.textContent = `Place ship of length ${SHIP_SIZES[currentShipIndex]}`;
  }
}

/* ---------- COMPUTER SHIP PLACEMENT ---------- */
function placeComputerShips() {
  SHIP_SIZES.forEach(size => {
    let placed = false;

    while (!placed) {
      const r = Math.floor(Math.random() * SIZE);
      const c = Math.floor(Math.random() * SIZE);
      const horizontal = Math.random() < 0.5;
      const ship = [];

      for (let i = 0; i < size; i++) {
        const nr = horizontal ? r : r + i;
        const nc = horizontal ? c + i : c;

        if (nr >= SIZE || nc >= SIZE) break;

        const key = `${nr},${nc}`;
        if (allShipCells(computerShips).includes(key)) break;

        ship.push(key);
      }

      if (ship.length === size) {
        computerShips.push(ship);
        placed = true;
      }
    }
  });
}

/* ---------- PLAYER ATTACK ---------- */
function playerAttack(r, c, cell) {
  if (phase !== "battle" || cell.disabled) return;

  cell.disabled = true;
  const key = `${r},${c}`;

  if (allShipCells(computerShips).includes(key)) {
    cell.textContent = "X";
    cell.classList.add("hit");
    const sunk = hitShip(computerShips, key);
    message.textContent = sunk ? "You sunk a ship!" : "Hit!";
  } else {
    cell.textContent = "O";
    cell.classList.add("miss");
    message.textContent = "Miss!";
  }

  if (computerShips.every(ship => ship.length === 0)) {
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

  if (allShipCells(playerShips).includes(key)) {
    cell.classList.add("hit");
    hitShip(playerShips, key);
    message.textContent = "Computer hit your ship!";

    if (modeSelect.value === "hard") {
      neighbors(move[0], move[1]).forEach(n => targets.push(n));
    }
  } else {
    cell.classList.add("miss");
    message.textContent = "Computer missed!";
  }

  if (playerShips.every(ship => ship.length === 0)) {
    message.textContent = "Computer wins 😞";
    endGame();
  }
}

/* ---------- END GAME ---------- */
function endGame() {
  document.querySelectorAll(".cell").forEach(c => c.disabled = true);
}

/* ---------- INIT ---------- */
window.onload = () => {
  playerBoardDiv = document.getElementById("player-board");
  computerBoardDiv = document.getElementById("computer-board");
  message = document.getElementById("message");
  modeSelect = document.getElementById("mode");

  message.textContent = "Place ship of length 5";

  playerBoard = createBoard(playerBoardDiv, placePlayerShip);
  computerBoard = createBoard(computerBoardDiv, playerAttack);

  placeComputerShips();
};
