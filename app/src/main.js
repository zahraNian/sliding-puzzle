import { createPuzzle, replaceAllPuzzlesWithNewOne, initSliders } from './boardManager.js';

const rowsSlider = document.getElementById('rowsSlider');
const colsSlider = document.getElementById('colsSlider');
const tailsSizeSlider = document.getElementById('tailsSizeSlider');
const rowsValue = document.getElementById('rowsValue');
const colsValue = document.getElementById('colsValue');
const tailsSizeValue = document.getElementById('tailsSizeValue');

// Initialize
replaceAllPuzzlesWithNewOne(parseInt(rowsSlider.value), parseInt(colsSlider.value), parseInt(tailsSizeSlider.value));
initSliders(rowsSlider, colsSlider, tailsSizeSlider, rowsValue, colsValue, tailsSizeValue);

document.getElementById('add-board').addEventListener('click', () => {
    createPuzzle(+rowsSlider.value, +colsSlider.value, +tailsSizeSlider.value);
});