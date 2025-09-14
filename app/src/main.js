import { createPuzzle } from './puzzlesManager.js';
import { DEFAULT_TAIL_SIZE, DEFAULT_ROWS_NUMBER, DEFAULT_COLS_NUMBER } from './config.js';

// Initialize
createPuzzle('boards-container', DEFAULT_ROWS_NUMBER, DEFAULT_COLS_NUMBER, DEFAULT_TAIL_SIZE);

// Add another puzzle btn
document.getElementById('add-board').addEventListener('click', () => {
    createPuzzle('boards-container', DEFAULT_ROWS_NUMBER, DEFAULT_COLS_NUMBER, DEFAULT_TAIL_SIZE);
});