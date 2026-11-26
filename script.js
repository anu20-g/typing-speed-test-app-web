// Authentic Monkeytype Logic
const WORDS_POOL = [
    "the", "be", "of", "and", "a", "to", "in", "he", "have", "it", "that", "for", "they", "I", "with", "as",
    "not", "on", "she", "at", "by", "this", "we", "you", "do", "but", "from", "or", "which", "one", "would",
    "all", "will", "there", "say", "who", "make", "when", "can", "more", "if", "no", "man", "out", "other",
    "so", "what", "time", "up", "go", "about", "than", "into", "could", "state", "only", "new", "year", "some",
    "take", "come", "these", "know", "see", "use", "get", "like", "then", "first", "any", "work", "now", "may",
    "such", "give", "over", "think", "most", "even", "find", "day", "also", "after", "way", "many", "must",
    "look", "before", "great", "back", "through", "long", "where", "much", "should", "well", "people", "down",
    "own", "just", "because", "good", "each", "those", "feel", "seem", "how", "high", "too", "place", "little",
    "world", "very", "still", "nation", "hand", "old", "life", "tell", "write", "become", "here", "show", "house",
    "both", "between", "need", "mean", "call", "develop", "under", "last", "right", "move", "thing", "general"
];

let mode = "time"; // 'time' or 'words'
let modeVal = 30; // 30s or 50 words
let activeWords = [];
let wordIdx = 0;
let letterIdx = 0;
let timer = null;
let timeLeft = 30;
let isStarted = false;
let testStartTime = 0;

let stats = {
    correctChars: 0,
    incorrectChars: 0,
    extraChars: 0,
    missedChars: 0
};

const dom = {
    themeSelect: document.getElementById('themeSelect'),
    modeBtns: document.querySelectorAll('#modeGroup .config-btn'),
    subModeGroup: document.getElementById('subModeGroup'),
    liveTimer: document.getElementById('liveTimer'),
    wordsWrapper: document.getElementById('wordsWrapper'),
    wordsContainer: document.getElementById('wordsContainer'),
    input: document.getElementById('hiddenInput'),
    restartBtn: document.getElementById('restartBtn'),
    resultsScreen: document.getElementById('resultsScreen'),
    nextTestBtn: document.getElementById('nextTestBtn'),
    resWpm: document.getElementById('resWpm'),
    resAcc: document.getElementById('resAcc'),
    resTestType: document.getElementById('resTestType'),
    resRawWpm: document.getElementById('resRawWpm'),
    resChars: document.getElementById('resChars'),
    resTime: document.getElementById('resTime')
};

// Caret Element
const caret = document.createElement('div');
caret.className = 'caret';
document.body.appendChild(caret);

function updateCaret() {
    const activeWordEl = dom.wordsContainer.children[wordIdx];
    if (!activeWordEl) return;

    if (letterIdx < activeWordEl.children.length) {
        const letterEl = activeWordEl.children[letterIdx];
        const rect = letterEl.getBoundingClientRect();
        caret.style.left = `${rect.left}px`;
        caret.style.top = `${rect.top}px`;
    } else {
        const lastLetter = activeWordEl.children[activeWordEl.children.length - 1];
        const rect = lastLetter.getBoundingClientRect();
        caret.style.left = `${rect.right}px`;
        caret.style.top = `${rect.top}px`;
    }
    caret.style.display = 'block';
}

function generateWords(count = 70) {
    activeWords = [];
    for (let i = 0; i < count; i++) {
        activeWords.push(WORDS_POOL[Math.floor(Math.random() * WORDS_POOL.length)]);
    }
}

function renderWords() {
    dom.wordsContainer.innerHTML = '';
    activeWords.forEach((w) => {
        const wordEl = document.createElement('div');
        wordEl.className = 'word';
        w.split('').forEach(char => {
            const letterEl = document.createElement('span');
            letterEl.className = 'letter';
            letterEl.textContent = char;
            wordEl.appendChild(letterEl);
        });
        dom.wordsContainer.appendChild(wordEl);
    });
    setTimeout(updateCaret, 50);
}

function resetTest() {
    clearInterval(timer);
    timer = null;
    isStarted = false;
    wordIdx = 0;
    letterIdx = 0;
    timeLeft = mode === 'time' ? modeVal : 0;

    stats = { correctChars: 0, incorrectChars: 0, extraChars: 0, missedChars: 0 };

    dom.liveTimer.textContent = mode === 'time' ? timeLeft : '0';
    dom.input.value = '';
    dom.resultsScreen.classList.add('hidden');
    dom.wordsWrapper.classList.remove('hidden');

    generateWords(mode === 'words' ? modeVal : 80);
    renderWords();
    dom.input.focus();
}

function startTimer() {
    isStarted = true;
    testStartTime = Date.now();

    timer = setInterval(() => {
        if (mode === 'time') {
            timeLeft--;
            dom.liveTimer.textContent = timeLeft;
            if (timeLeft <= 0) concludeTest();
        } else {
            timeLeft++;
            dom.liveTimer.textContent = timeLeft;
        }
    }, 1000);
}

function concludeTest() {
    clearInterval(timer);
    isStarted = false;
    caret.style.display = 'none';

    const durationSec = mode === 'time' ? modeVal : Math.max(1, timeLeft);
    const durationMin = durationSec / 60;

    // Standard formula: WPM = (correct chars / 5) / minutes
    const grossChars = stats.correctChars + stats.incorrectChars + stats.extraChars;
    const rawWpm = Math.round((grossChars / 5) / durationMin);
    const netWpm = Math.max(0, Math.round((stats.correctChars / 5) / durationMin));
    const accuracy = grossChars > 0 ? Math.round((stats.correctChars / grossChars) * 100) : 100;

    dom.resWpm.textContent = netWpm;
    dom.resAcc.textContent = `${accuracy}%`;
    dom.resTestType.textContent = `${mode} ${modeVal}`;
    dom.resRawWpm.textContent = rawWpm;
    dom.resChars.textContent = `${stats.correctChars}/${stats.incorrectChars}/${stats.extraChars}/${stats.missedChars}`;
    dom.resTime.textContent = `${durationSec}s`;

    dom.wordsWrapper.classList.add('hidden');
    dom.resultsScreen.classList.remove('hidden');
}

// Input Handlers
dom.input.addEventListener('keydown', (e) => {
    // Quick restart tab+enter
    if (e.key === 'Tab') {
        e.preventDefault();
        return;
    }
});

dom.input.addEventListener('input', (e) => {
    if (!isStarted) startTimer();

    const val = dom.input.value;
    const currentWord = activeWords[wordIdx];
    const currentWordEl = dom.wordsContainer.children[wordIdx];

    if (!currentWord || !currentWordEl) return;

    // Space advances to next word
    if (val.endsWith(' ')) {
        const typedWord = val.trim();
        // Check missed characters
        if (typedWord.length < currentWord.length) {
            stats.missedChars += (currentWord.length - typedWord.length);
        }

        wordIdx++;
        letterIdx = 0;
        dom.input.value = '';

        if (mode === 'words' && wordIdx >= modeVal) {
            concludeTest();
            return;
        }

        // Scroll words container if lines advance
        if (currentWordEl.offsetTop > 40) {
            dom.wordsContainer.scrollTop = currentWordEl.offsetTop;
        }

        updateCaret();
        return;
    }

    letterIdx = val.length;
    const letters = currentWordEl.querySelectorAll('.letter:not(.extra)');

    // Reset styles
    letters.forEach(l => { l.className = 'letter'; });
    currentWordEl.querySelectorAll('.extra').forEach(el => el.remove());

    for (let i = 0; i < val.length; i++) {
        if (i < currentWord.length) {
            if (val[i] === currentWord[i]) {
                letters[i].classList.add('correct');
                stats.correctChars++;
            } else {
                letters[i].classList.add('incorrect');
                stats.incorrectChars++;
            }
        } else {
            // Extra letters typed beyond length
            const extraSpan = document.createElement('span');
            extraSpan.className = 'letter extra';
            extraSpan.textContent = val[i];
            currentWordEl.appendChild(extraSpan);
            stats.extraChars++;
        }
    }

    updateCaret();
});

// Window events
window.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        e.preventDefault();
        resetTest();
    }
});

dom.wordsWrapper.addEventListener('click', () => { dom.input.focus(); });
dom.restartBtn.addEventListener('click', resetTest);
dom.nextTestBtn.addEventListener('click', resetTest);

// Theme switcher
dom.themeSelect.addEventListener('change', (e) => {
    document.body.setAttribute('data-theme', e.target.value);
    updateCaret();
});

// Mode buttons
dom.modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        dom.modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        mode = btn.dataset.mode;
        rebuildSubModeGroup();
        resetTest();
    });
});

function rebuildSubModeGroup() {
    dom.subModeGroup.innerHTML = '';
    const presets = mode === 'time' ? [15, 30, 60, 120] : [10, 25, 50, 100];
    modeVal = presets[1]; // default 30 or 25

    presets.forEach(p => {
        const b = document.createElement('button');
        b.className = `config-btn ${p === modeVal ? 'active' : ''}`;
        b.dataset.val = p;
        b.textContent = p;
        b.onclick = () => {
            dom.subModeGroup.querySelectorAll('.config-btn').forEach(el => el.classList.remove('active'));
            b.classList.add('active');
            modeVal = p;
            resetTest();
        };
        dom.subModeGroup.appendChild(b);
    });
}

// Init
resetTest();
