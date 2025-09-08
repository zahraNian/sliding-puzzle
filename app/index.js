const tailSizeConfig = { 1: 35, 2: 40, 3: 50, 4: 65, 5: 80, 6: 90, 7: 95, 8: 100, 9: 105, 10: 115 };

class TailPuzzle {
  constructor(containerId, boardId, rows = 4, cols = 4, tileSize = tailSizeConfig[5]) {
    this.state = 1;
    this.rows = rows;
    this.cols = cols;
    this.tileSize = tailSizeConfig[tileSize];

    this.container = document.getElementById(containerId);

    this.puzzleContainer = document.createElement('div');
    this.puzzleContainer.classList.add('puzzle-container');
    this.puzzleContainer.id = 'puzzle-container-' + boardId;

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

    this.previousCell = null;
    this.difficultyLevel = this.difficultyLevels(this.rows, this.cols);

    this.createControls();
    this.solve();
    this.scramble(100, true);

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
          cell.className = 'empty';
        }

        this.puzzle.appendChild(cell);
      }
    }

    this.applyTileSize();
  }

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

  updateTileSize(newSize) {
    this.tileSize = tailSizeConfig[newSize];
    this.applyTileSize();
  }

  getCell(row, col) {
    return document.getElementById(`cell-${this.puzzle.id}-${row}-${col}`);
  }

  getEmptyCell() {
    return this.puzzle.querySelector('.empty');
  }

  getAdjacentCells(cell) {
    const [_, __, rowStr, colStr] = cell.id.split('-');
    const row = parseInt(rowStr);
    const col = parseInt(colStr);
    const adjacent = [];

    if (row < this.rows - 1) adjacent.push(this.getCell(row + 1, col));
    if (row > 0) adjacent.push(this.getCell(row - 1, col));
    if (col < this.cols - 1) adjacent.push(this.getCell(row, col + 1));
    if (col > 0) adjacent.push(this.getCell(row, col - 1));

    return adjacent;
  }

  getEmptyAdjacentCell(cell) {
    const adjacent = this.getAdjacentCells(cell);
    for (let adj of adjacent) {
      if (adj.className === 'empty') return adj;
    }
    return false;
  }

  shiftCell(cell) {
    if (cell.className === 'empty') return;
    const emptyCell = this.getEmptyAdjacentCell(cell);
    if (!emptyCell) return;

    const tmp = { style: cell.style.cssText, id: cell.id };
    cell.style.cssText = emptyCell.style.cssText;
    cell.id = emptyCell.id;
    emptyCell.style.cssText = tmp.style;
    emptyCell.id = tmp.id;

    if (this.state === 1) {
      setTimeout(() => this.checkOrder(), 150);
    }
  }

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

  scramble(moves = this.difficultyLevel, instant = false) {
    if (this.state === 0) return;
    this.state = 0;

    const randomMove = () => {
      const adj = this.getAdjacentCells(this.getEmptyCell());

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

    if (instant) {
      for (let i = 0; i < moves; i++) {
        randomMove();
      }
      this.state = 1;
    } else {
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

  rand(from, to) {
    return Math.floor(Math.random() * (to - from + 1)) + from;
  }

  createControls() {
    const controls = document.createElement('div');
    controls.classList.add("align-center");

    const scrambleBtn = document.createElement('button');
    scrambleBtn.id = `scramble-${this.puzzle.id}`;
    scrambleBtn.innerText = 'Scramble';
    scrambleBtn.addEventListener('click', () => this.scramble());

    controls.appendChild(scrambleBtn);
    document.getElementById(this.puzzleContainer.id).appendChild(controls);
  }

  difficultyLevels(row, col) {
    const itemsCount = row * col;
    const ranges = [
      { max: 16, moves: 100 },
      { max: 49, moves: 500 },
      { max: 124, moves: 900 },
      { max: Infinity, moves: 1200 }
    ];
    const selectedRange = ranges.find(r => itemsCount <= r.max);
    return selectedRange.moves;
  }
}

let existingBoardsNumber = 1;
let currentPuzzle = null;

const createPuzzle = (rows, cols) => {
  const container = document.getElementById('boards-container');
  container.innerHTML = '';

  currentPuzzle = new TailPuzzle(
    'boards-container',
    existingBoardsNumber,
    rows,
    cols,
    parseInt(tailsSizeSlider.value)
  );
  existingBoardsNumber++;
};

// Sliders
const rowsSlider = document.getElementById('rowsSlider');
const colsSlider = document.getElementById('colsSlider');
const tailsSizeSlider = document.getElementById('tailsSizeSlider');
const rowsValue = document.getElementById('rowsValue');
const colsValue = document.getElementById('colsValue');
const tailsSizeValue = document.getElementById('tailsSizeValue');

rowsSlider.addEventListener('input', () => {
  rowsValue.innerText = rowsSlider.value;
  createPuzzle(parseInt(rowsSlider.value), parseInt(colsSlider.value));
});

colsSlider.addEventListener('input', () => {
  colsValue.innerText = colsSlider.value;
  createPuzzle(parseInt(rowsSlider.value), parseInt(colsSlider.value));
});

tailsSizeSlider.addEventListener('input', () => {
  console.log(tailsSizeValue.innerText, tailsSizeSlider.value);

  tailsSizeValue.innerText = tailsSizeSlider.value;
  if (currentPuzzle) {
    currentPuzzle.updateTileSize(parseInt(tailsSizeSlider.value));
  }
});

// Add initial puzzle
createPuzzle(parseInt(rowsSlider.value), parseInt(colsSlider.value));

document.getElementById('add-board').addEventListener('click', () => {
  new TailPuzzle(
    'boards-container',
    existingBoardsNumber,
    parseInt(rowsSlider.value),
    parseInt(colsSlider.value),
    parseInt(tailsSizeSlider.value)
  );
  existingBoardsNumber++;
});