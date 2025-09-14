import { TAIL_SIZE_CONFIG } from './config.js';
import { rand } from './utils.js';
import { Modal } from './modal.js';

export class SlidingPuzzle {
    constructor(containerId, boardId, rows = 4, cols = 4, tileSize = TAIL_SIZE_CONFIG[5]) {
        this.state = 1; // Puzzle state: 1 = active, 0 = scrambling
        this.rows = rows;
        this.cols = cols;
        this.tileSize = TAIL_SIZE_CONFIG[tileSize];

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
        this.difficultyLevel = this.difficultyLevels(this.rows, this.cols);

        this.createConfigModal();
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
        this.tileSize = TAIL_SIZE_CONFIG[newSize];
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

            this.previousCell = adj[rand(0, adj.length - 1)];
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

    // Determine number of moves for scrambling based on puzzle size
    difficultyLevels(row, col) {
        const items = row * col;
        if (items <= 16) return 100;
        if (items <= 49) return 500;
        if (items <= 124) return 900;
        return 1200;
    }
    createConfigModal() {
        this.configModal = new Modal("Configs");

        const tempState = {
            rows: this.rows,
            cols: this.cols,
            tileSize: Object.keys(TAIL_SIZE_CONFIG).find(key => TAIL_SIZE_CONFIG[key] === this.tileSize)
        };

        const configContent = document.createElement("div");

        const createSlider = ({ labelText, min, max, valueKey }) => {
            const label = document.createElement("label");
            const spanId = `${valueKey}-${this.puzzle.id}`;
            label.innerHTML = `${labelText}: <span id="${spanId}">${tempState[valueKey]}</span>`;
            label.style.display = "block";
            label.style.marginTop = "15px";
            label.style.marginBottom = "8px";

            const slider = document.createElement("input");
            slider.type = "range";
            slider.min = min;
            slider.max = max;
            slider.value = tempState[valueKey];
            slider.addEventListener("input", (e) => {
                tempState[valueKey] = parseInt(e.target.value);
                document.getElementById(spanId).innerText = e.target.value;
            });

            configContent.appendChild(label);
            configContent.appendChild(slider);
        };

        createSlider({ labelText: "Rows", min: 2, max: 30, valueKey: "rows" });
        createSlider({ labelText: "Cols", min: 2, max: 30, valueKey: "cols" });
        createSlider({ labelText: "Tile Size", min: 1, max: 10, valueKey: "tileSize" });

        const btnContainer = document.createElement("div");
        btnContainer.style.marginTop = "20px";
        btnContainer.style.textAlign = "right";

        const confirmBtn = document.createElement("button");
        confirmBtn.innerText = "Confirm";
        confirmBtn.classList.add("primary-btn");
        confirmBtn.style.marginRight = "8px";
        confirmBtn.addEventListener("click", () => {
            this.rows = tempState.rows;
            this.cols = tempState.cols;
            this.updateTileSize(tempState.tileSize);
            this.solve();
            this.scramble(100, true);
            this.configModal.close();
        });

        const cancelBtn = document.createElement("button");
        cancelBtn.innerText = "Cancel";
        cancelBtn.classList.add("text-primary-btn");
        cancelBtn.addEventListener("click", () => this.configModal.close());

        btnContainer.appendChild(confirmBtn);
        btnContainer.appendChild(cancelBtn);
        configContent.appendChild(btnContainer);

        this.configModal.setContent(configContent);
    }

    createControls() {
        const controls = document.createElement("div");
        controls.classList.add("align-center");

        const scrambleBtn = document.createElement('button');
        scrambleBtn.classList = "primary-btn";
        scrambleBtn.innerText = 'Scramble';
        scrambleBtn.addEventListener('click', () => this.scramble());
        controls.appendChild(scrambleBtn);

        const configBtn = document.createElement('button');
        configBtn.classList = "primary-btn";
        configBtn.innerText = 'Configs';
        configBtn.style.marginLeft = "8px";
        configBtn.addEventListener('click', () => this.configModal.open());
        controls.appendChild(configBtn);

        this.puzzleContainer.appendChild(controls);
    }

}