import { SlidingPuzzle } from './puzzle.js';

let existingBoardsNumber = 1;

export function createPuzzle(containerId, rows, cols, tileSize) {
    new SlidingPuzzle(
        containerId,
        existingBoardsNumber,
        rows,
        cols,
        tileSize
    );
    existingBoardsNumber++;
}