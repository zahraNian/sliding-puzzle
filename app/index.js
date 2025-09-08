const tailSizeConfig = { 1: 35, 2: 40, 3: 50, 4: 65, 5: 80, 6: 90, 7: 95, 8: 100, 9: 105, 10: 115 }; // Tile size options

class SlidingPuzzle {
  constructor(containerId, boardId, rows = 4, cols = 4, tileSize = tailSizeConfig[5]) {
    this.state = 1; // Puzzle state: 1 = active, 0 = scrambling
    this.rows = rows;
    this.cols = cols;
    this.tileSize = tailSizeConfig[tileSize];

    this.container = document.getElementById(containerId);

    // Create internal puzzle container
    this.puzzleContainer = document.createElement('div');
    this.puzzleContainer.classList.add('puzzle-container');
    this.puzzleContainer.id = 'puzzle-container-' + boardId;

    // Create the puzzle board element
    this.puzzle = document.createElement('div');
    this.puzzle.id = 'board' + boardId;
    Object.assign(this.puzzle.style, {
      position: "relative",
      overflow: "auto",
      maxWidth: "90vw",
      minHeight: "max-content",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    });
    this.container.appendChild(this.puzzleContainer);
    this.puzzleContainer.appendChild(this.puzzle);

    this.previousCell = null; // Used to avoid reversing moves during scramble
    this.difficultyLevel = this.difficultyLevels(this.rows, this.cols); // Set scramble moves

    this.createControls();
    // We first build a solved puzzle and then scramble
    // Ensures the puzzle is always solvable because every move is reversible
    this.solve();
    this.scramble(100, true);

    // Handle clicks on puzzle tiles
    this.puzzle.addEventListener('click', (e) => {
      if (this.state === 1) {
        this.puzzle.className = 'animate';
        this.shiftCell(e.target);
      }
    });
  }

  solve() {
    if (this.state === 0) return;
    this.puzzle.innerHTML = '';
    let n = 1;

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        const cell = document.createElement('span');
        cell.id = `cell-${this.puzzle.id}-${i}-${j}`;

        if (n <= this.rows * this.cols - 1) {
          cell.classList.add('number', 'tail');
          cell.innerHTML = n.toString();
          n++;
        } else {
          cell.className = 'empty'; // Last cell is empty
        }

        this.puzzle.appendChild(cell);
      }
    }

    this.applyTileSize(); // Set sizes and positions
  }

  // Apply sizes and positions to all tiles
  applyTileSize() {
    this.puzzle.style.width = `${this.tileSize * this.cols + 10}px`;
    this.puzzle.style.height = `${this.tileSize * this.rows + 10}px`;

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        const cell = this.getCell(i, j);
        if (!cell) continue;

        cell.style.left = (j * this.tileSize + j) + 'px';
        cell.style.top = (i * this.tileSize + i) + 'px';
        cell.style.fontSize = `${(3.8 / 10) * this.tileSize}px`;
        cell.style.width = this.tileSize - 5 + 'px';
        cell.style.height = this.tileSize - 5 + 'px';
      }
    }
  }

  // Update tile size dynamically
  updateTileSize(newSize) {
    this.tileSize = tailSizeConfig[newSize];
    this.applyTileSize();
  }

  // Get specific cell element
  getCell(row, col) {
    return document.getElementById(`cell-${this.puzzle.id}-${row}-${col}`);
  }

  // Get the empty tile
  getEmptyCell() {
    return this.puzzle.querySelector('.empty');
  }

  // Get adjacent tiles to a given cell
  getAdjacentCells(cell) {
    const [, , rowStr, colStr] = cell.id.split('-');
    const row = parseInt(rowStr);
    const col = parseInt(colStr);
    const adjacent = [];

    if (row < this.rows - 1) adjacent.push(this.getCell(row + 1, col));
    if (row > 0) adjacent.push(this.getCell(row - 1, col));
    if (col < this.cols - 1) adjacent.push(this.getCell(row, col + 1));
    if (col > 0) adjacent.push(this.getCell(row, col - 1));

    return adjacent;
  }

  // Find empty tile among adjacent tiles
  getEmptyAdjacentCell(cell) {
    const adjacent = this.getAdjacentCells(cell);
    for (let adj of adjacent) {
      if (adj.className === 'empty') return adj;
    }
    return false;
  }

  // Swap a tile with the empty tile
  shiftCell(cell) {
    if (cell.className === 'empty') return;
    const emptyCell = this.getEmptyAdjacentCell(cell);
    if (!emptyCell) return;

    // Swap styles and ids
    const tmp = { style: cell.style.cssText, id: cell.id };
    cell.style.cssText = emptyCell.style.cssText;
    cell.id = emptyCell.id;
    emptyCell.style.cssText = tmp.style;
    emptyCell.id = tmp.id;
    // Check if solved
    if (this.state === 1) {
      setTimeout(() => this.checkOrder(), 150);
    }
  }

  // Check if puzzle is solved
  checkOrder() {
    const lastCell = this.getCell(this.rows - 1, this.cols - 1);
    if (lastCell.className !== 'empty') return;

    let n = 1;
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        if (n <= this.rows * this.cols - 1) {
          const cell = this.getCell(i, j);
          if (cell.innerHTML != n.toString()) return;
          n++;
        }
      }
    }

    if (confirm('Congratulations! The puzzle is solved. \nDo you want to shuffle again?')) {
      this.scramble();
    }
  }

  // Shuffle the puzzle
  scramble(moves = this.difficultyLevel, instant = false) {
    if (this.state === 0) return;
    this.state = 0;

    const randomMove = () => {
      const adj = this.getAdjacentCells(this.getEmptyCell());

      // Avoiding the last move prevents immediately undoing it,
      // ensuring the scramble actually changes the board and makes the puzzle properly shuffled
      if (this.previousCell) {
        for (let j = adj.length - 1; j >= 0; j--) {
          if (adj[j].innerHTML === this.previousCell.innerHTML) {
            adj.splice(j, 1);
          }
        }
      }

      this.previousCell = adj[this.rand(0, adj.length - 1)];
      this.shiftCell(this.previousCell);
    };

    if (instant) { // Instant shuffle without animte, for first time
      for (let i = 0; i < moves; i++) {
        randomMove();
      }
      this.state = 1;
    } else { // Animate shuffle
      this.puzzle.removeAttribute('class');
      let i = 0;
      const interval = setInterval(() => {
        if (i < moves) {
          randomMove();
          i++;
        } else {
          clearInterval(interval);
          this.state = 1;
        }
      }, 5);
    }
  }

  // Random integer helper
  rand(from, to) {
    return Math.floor(Math.random() * (to - from + 1)) + from;
  }

  // Create scramble button
  createControls() {
    const controls = document.createElement('div');
    controls.classList.add("align-center");

    const scrambleBtn = document.createElement('button');
    scrambleBtn.classList = "primary-btn";
    scrambleBtn.id = `scramble-${this.puzzle.id}`;
    scrambleBtn.innerText = 'Scramble';
    scrambleBtn.addEventListener('click', () => this.scramble());

    controls.appendChild(scrambleBtn);
    document.getElementById(this.puzzleContainer.id).appendChild(controls);
  }

  // Determine number of moves for scrambling based on puzzle size
  difficultyLevels(row, col) {
    const items = row * col;
    if (items <= 16) return 100;
    if (items <= 49) return 500;
    if (items <= 124) return 900;
    return 1200;
  }
}

// Global puzzle management
let existingBoardsNumber = 1;
let puzzles = [];

const createPuzzle = (rows, cols) => {
  const container = document.getElementById('boards-container');
  // Clear previous board
  container.innerHTML = '';

  const puzzle = new SlidingPuzzle(
    'boards-container',
    existingBoardsNumber,
    rows,
    cols,
    parseInt(tailsSizeSlider.value)
  );
  puzzles.push(puzzle);
  existingBoardsNumber++;
};

// Slider bindings
const rowsSlider = document.getElementById('rowsSlider');
const colsSlider = document.getElementById('colsSlider');
const tailsSizeSlider = document.getElementById('tailsSizeSlider');
const rowsValue = document.getElementById('rowsValue');
const colsValue = document.getElementById('colsValue');
const tailsSizeValue = document.getElementById('tailsSizeValue');

// Generic slider helper
function bindSlider(slider, valueEl, callback) {
  slider.addEventListener('input', () => {
    valueEl.innerText = slider.value;
    callback(parseInt(slider.value));
  });
}
bindSlider(rowsSlider, rowsValue, () => createPuzzle(+rowsSlider.value, +colsSlider.value));
bindSlider(colsSlider, colsValue, () => createPuzzle(+rowsSlider.value, +colsSlider.value));
bindSlider(tailsSizeSlider, tailsSizeValue, () => {
  puzzles.forEach(p => p.updateTileSize(+tailsSizeSlider.value));
});

// Initialize first puzzle
createPuzzle(parseInt(rowsSlider.value), parseInt(colsSlider.value));

// Add additional board button
document.getElementById('add-board').addEventListener('click', () => {
  const newPuzzle = new SlidingPuzzle(
    'boards-container',
    existingBoardsNumber,
    parseInt(rowsSlider.value),
    parseInt(colsSlider.value),
    parseInt(tailsSizeSlider.value)
  );
  existingBoardsNumber++;
  puzzles.push(newPuzzle);
});