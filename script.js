// Variables
const board = document.getElementById('grid');
const restartBtn = document.getElementById('restartBtn');
const undoBtn = document.getElementById('undoBtn');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('highScore');
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let boardState = [
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
];
let previousState = []; // For undo functionality

// Initialize the game
function init() {
  score = 0;
  scoreDisplay.textContent = score;
  boardState = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];
  createBoard();
  addRandomTile();
  addRandomTile();
  updateBoard();
}

// Create the game board (HTML)
function createBoard() {
  board.innerHTML = '';
  for (let i = 0; i < 16; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    board.appendChild(cell);
  }
}

// Save high score to local storage
function saveHighScore() {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('highScore', highScore);
  }
  highScoreDisplay.textContent = highScore;
}

// Add a random tile (2 or 4)
function addRandomTile() {
  const emptyCells = [];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (boardState[i][j] === 0) emptyCells.push({ i, j });
    }
  }

  if (emptyCells.length > 0) {
    const { i, j } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    boardState[i][j] = Math.random() < 0.9 ? 2 : 4;
  }
}

// Update the game board (UI)
function updateBoard() {
  const cells = document.querySelectorAll('.cell');
  cells.forEach((cell, index) => {
    const row = Math.floor(index / 4);
    const col = index % 4;
    const value = boardState[row][col];
    cell.textContent = value === 0 ? '' : value;
    cell.className = 'cell';
    if (value) {
      cell.classList.add(`tile-${value}`);
    }
  });
}

// Move and merge tiles
function move(direction) {
  previousState = JSON.parse(JSON.stringify(boardState)); // Save current state for undo
  let moved = false;

  switch (direction) {
    case 'left':
      moved = slideLeft();
      break;
    case 'right':
      rotateBoard(2);
      moved = slideLeft();
      rotateBoard(2);
      break;
    case 'up':
      rotateBoard(3);
      moved = slideLeft();
      rotateBoard(1);
      break;
    case 'down':
      rotateBoard(1);
      moved = slideLeft();
      rotateBoard(3);
      break;
  }

  if (moved) {
    addRandomTile();
    updateBoard();
    scoreDisplay.textContent = score;
    saveHighScore();
    checkGameOver();
  }
}

// Slide and merge tiles to the left
function slideLeft() {
  let moved = false;
  for (let i = 0; i < 4; i++) {
    let row = boardState[i].filter(cell => cell !== 0);
    let mergedRow = [];
    let skip = false;

    while (row.length < 4) row.push(0); // Fill the row to 4 cells

    for (let j = 0; j < row.length - 1; j++) {
      if (row[j] === row[j + 1] && !skip) {
        row[j] *= 2;
        score += row[j];
        row[j + 1] = 0;
        skip = true;
        moved = true;
      } else if (row[j] !== 0) {
        skip = false;
      }
    }

    row = row.filter(cell => cell !== 0); // Remove zeros
    while (row.length < 4) row.push(0); // Fill the row to 4 cells
    boardState[i] = row;
  }
  return moved;
}

// Rotate the board to handle different directions
function rotateBoard(times) {
  for (let i = 0; i < times; i++) {
    boardState = boardState[0].map((_, index) => boardState.map(row => row[index])).reverse();
  }
}

// Undo the previous move
function undoMove() {
  if (previousState.length) {
    boardState = JSON.parse(JSON.stringify(previousState));
    updateBoard();
    previousState = [];
    scoreDisplay.textContent = score;
  }
}

// Check for game over
function checkGameOver() {
  const emptyCells = [];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (boardState[i][j] === 0) emptyCells.push({ i, j });
    }
  }

  if (emptyCells.length === 0) {
    let gameOver = true;
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const current = boardState[i][j];
        if (
          (i < 3 && current === boardState[i + 1][j]) ||
          (j < 3 && current === boardState[i][j + 1])
        ) {
          gameOver = false;
          break;
        }
      }
    }

    if (gameOver) {
      alert('Game Over! Your score is ' + score);
      init();
    }
  }
}

// Event listeners for arrow keys
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') move('left');
  if (e.key === 'ArrowRight') move('right');
  if (e.key === 'ArrowUp') move('up');
  if (e.key === 'ArrowDown') move('down');
});

// Restart button functionality
restartBtn.addEventListener('click', init);

// Undo button functionality
undoBtn.addEventListener('click', undoMove);

// Initialize the game
init();
