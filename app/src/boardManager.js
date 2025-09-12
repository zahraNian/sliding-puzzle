import { bindSlider } from './utils.js';
import { SlidingPuzzle } from './puzzle.js';

let existingBoardsNumber = 1;
let puzzles = [];

export function createPuzzle(rows, cols, tileSize) {
    const puzzle = new SlidingPuzzle(
        'boards-container',
        existingBoardsNumber,
        rows,
        cols,
        tileSize
    );
    puzzles.push(puzzle);
    existingBoardsNumber++;
}

export function replaceAllPuzzlesWithNewOne(rows, cols, tileSize) {
    const container = document.getElementById('boards-container');
    container.innerHTML = '';

    createPuzzle(rows, cols, tileSize)
}


export function initSliders(rowsSlider, colsSlider, sizeSlider, rowsValue, colsValue, sizeValue) {
    bindSlider(rowsSlider, rowsValue, () => replaceAllPuzzlesWithNewOne(+rowsSlider.value, +colsSlider.value, +sizeSlider.value));
    bindSlider(colsSlider, colsValue, () => replaceAllPuzzlesWithNewOne(+rowsSlider.value, +colsSlider.value, +sizeSlider.value));
    bindSlider(sizeSlider, sizeValue, () => {
        puzzles.forEach(p => p.updateTileSize(+sizeSlider.value));
    });
}