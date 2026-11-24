const input = document.getElementById('typedInput');
let startTime = null, timerRunning = false;
input.addEventListener('input', () => {
    if (!timerRunning) { startTime = new Date(); timerRunning = true; }
    const words = input.value.trim().split(/\s+/).filter(w => w.length > 0).length;
    const elapsedMinutes = (new Date() - startTime) / 60000;
    if (elapsedMinutes > 0) {
        document.getElementById('wpm').textContent = Math.round(words / elapsedMinutes);
    }
});
function resetTest() { input.value = ''; timerRunning = false; document.getElementById('wpm').textContent = '0'; }