var toggleSlider = document.getElementById('toggleSlider');

chrome.storage.sync.set({ 'toggleSliderState': 1 });

toggleSlider.addEventListener('change', () => {
    console.log("changing value to", toggleSlider.value);
    chrome.storage.sync.set({ 'toggleSliderState': toggleSlider.value });
});
