export function rand(from, to) {
    return Math.floor(Math.random() * (to - from + 1)) + from;
}

export function bindSlider(slider, valueEl, callback) {
    slider.addEventListener('input', () => {
        valueEl.innerText = slider.value;
        callback(parseInt(slider.value));
    });
}