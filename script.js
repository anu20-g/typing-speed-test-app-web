// Accurate Typing Speed & Keystroke Accuracy Engine
const PASSAGES = [
    "Clean code always looks like it was written by someone who cares. There is nothing obvious you can do to make it better. The ratio of time spent reading versus writing code is well over ten to one.",
    "Distributed systems are inherently asynchronous and concurrent. When designing microservices, one must embrace eventual consistency, network partitions, and automated idempotency.",
    "The art of programming is the skill of controlling complexity. Great programmers engineer simple abstractions that shield systems from unpredictable external disturbances.",
    "Optimization without empirical telemetry is speculative guesswork. Measure memory allocation, CPU cache lines, and algorithmic time complexity before refactoring critical loops."
];

let selectedDuration = 30;
let timeLeft = selectedDuration;
let timerInterval = null;
let isRunning = false;
let currentPassage = "";
let totalTypedCharacters = 0;
let totalErrors = 0;

const dom = {
    timerVal: document.getElementById('timerVal'),
    wpmVal: document.getElementById('wpmVal'),
    netWpmVal: document.getElementById('netWpmVal'),
    accVal: document.getElementById('accVal'),
    textDisplay: document.getElementById('textDisplay'),
    typeInput: document.getElementById('typeInput'),
    btnTimeList: document.querySelectorAll('.btn-time'),
    btnNewPassage: document.getElementById('btnNewPassage'),
    btnRestart: document.getElementById('btnRestart'),
    resultModal: document.getElementById('resultModal'),
    modalRetryBtn: document.getElementById('modalRetryBtn'),
    finalNetWpm: document.getElementById('finalNetWpm'),
    finalAcc: document.getElementById('finalAcc'),
    finalStrokes: document.getElementById('finalStrokes'),
    finalErrors: document.getElementById('finalErrors')
};

function pickPassage() {
    const idx = Math.floor(Math.random() * PASSAGES.length);
    currentPassage = PASSAGES[idx];
    renderPassage();
}

function renderPassage() {
    dom.textDisplay.innerHTML = '';
    currentPassage.split('').forEach((char, i) => {
        const span = document.createElement('span');
        span.textContent = char;
        if (i === 0) span.classList.add('cursor');
        dom.textDisplay.appendChild(span);
    });
}

function resetTest() {
    clearInterval(timerInterval);
    timerInterval = null;
    isRunning = false;
    timeLeft = selectedDuration;
    totalTypedCharacters = 0;
    totalErrors = 0;

    dom.timerVal.textContent = `${timeLeft}s`;
    dom.wpmVal.textContent = '0';
    dom.netWpmVal.textContent = '0';
    dom.accVal.textContent = '100%';
    dom.typeInput.value = '';
    dom.resultModal.classList.add('hidden');

    pickPassage();
    dom.typeInput.focus();
}

function startTimer() {
    isRunning = true;
    const startTime = Date.now();
    const durationMs = selectedDuration * 1000;

    timerInterval = setInterval(() => {
        const elapsedMs = Date.now() - startTime;
        const remaining = Math.max(0, Math.ceil((durationMs - elapsedMs) / 1000));
        timeLeft = remaining;
        dom.timerVal.textContent = `${timeLeft}s`;

        computeMetrics(elapsedMs / 1000);

        if (timeLeft <= 0) {
            concludeTest();
        }
    }, 250);
}

function computeMetrics(elapsedSeconds) {
    if (elapsedSeconds <= 0) return;
    const minutes = elapsedSeconds / 60;

    // Standard formula: 1 word = 5 characters
    const grossWpm = Math.round((totalTypedCharacters / 5) / minutes);
    const netWpm = Math.max(0, Math.round(((totalTypedCharacters / 5) - totalErrors) / minutes));
    const accuracy = totalTypedCharacters > 0 
        ? Math.max(0, Math.round(((totalTypedCharacters - totalErrors) / totalTypedCharacters) * 100))
        : 100;

    dom.wpmVal.textContent = isFinite(grossWpm) ? grossWpm : 0;
    dom.netWpmVal.textContent = isFinite(netWpm) ? netWpm : 0;
    dom.accVal.textContent = `${accuracy}%`;
}

function handleInput() {
    if (!isRunning && dom.typeInput.value.length > 0) {
        startTimer();
    }

    const typed = dom.typeInput.value;
    const spans = dom.textDisplay.querySelectorAll('span');
    let errors = 0;

    spans.forEach((span, i) => {
        span.className = '';
        if (i < typed.length) {
            if (typed[i] === currentPassage[i]) {
                span.classList.add('correct');
            } else {
                span.classList.add('incorrect');
                errors++;
            }
        } else if (i === typed.length) {
            span.classList.add('cursor');
        }
    });

    totalTypedCharacters = typed.length;
    totalErrors = errors;

    if (typed.length >= currentPassage.length) {
        concludeTest();
    }
}

function concludeTest() {
    clearInterval(timerInterval);
    isRunning = false;

    const elapsed = selectedDuration - timeLeft;
    const minutes = (elapsed > 0 ? elapsed : selectedDuration) / 60;
    const netWpm = Math.max(0, Math.round(((totalTypedCharacters / 5) - totalErrors) / minutes));
    const accuracy = totalTypedCharacters > 0 
        ? Math.max(0, Math.round(((totalTypedCharacters - totalErrors) / totalTypedCharacters) * 100))
        : 100;

    dom.finalNetWpm.textContent = netWpm;
    dom.finalAcc.textContent = `${accuracy}%`;
    dom.finalStrokes.textContent = totalTypedCharacters;
    dom.finalErrors.textContent = totalErrors;

    dom.resultModal.classList.remove('hidden');
}

// Event Listeners
dom.typeInput.addEventListener('input', handleInput);

dom.textDisplay.addEventListener('click', () => {
    dom.typeInput.focus();
});

dom.btnTimeList.forEach(btn => {
    btn.addEventListener('click', () => {
        dom.btnTimeList.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedDuration = parseInt(btn.getAttribute('data-time'), 10);
        resetTest();
    });
});

dom.btnNewPassage.addEventListener('click', resetTest);
dom.btnRestart.addEventListener('click', resetTest);
dom.modalRetryBtn.addEventListener('click', resetTest);

// Initialize
resetTest();
