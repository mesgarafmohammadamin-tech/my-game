
'use strict';

// ==============================
// عناصر صفحه
// ==============================

const homeScreen = document.getElementById('home-screen');
const difficultyScreen = document.getElementById('difficulty-screen');
const gameScreen = document.getElementById('game-screen');

const twoPlayerButton = document.getElementById('two-player-btn');
const computerButton = document.getElementById('computer-btn');
const backHomeButton = document.getElementById('back-home-btn');
const difficultyButtons = document.querySelectorAll('.difficulty-btn');

const gameFrame = document.getElementById('game-frame');
const turnInfo = document.getElementById('turn-info');
const cells = Array.from(document.querySelectorAll('.cell'));

const resultPanel = document.getElementById('result-panel');
const resultTitle = document.getElementById('result-title');
const resultMessage = document.getElementById('result-message');
const restartButton = document.getElementById('restart-btn');
const mainMenuButton = document.getElementById('main-menu-btn');

// ==============================
// تنظیمات و وضعیت بازی
// ==============================

const WINNING_COMBINATIONS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

let board = Array(9).fill('');
let currentPlayer = 'X';
let gameMode = null;
let difficulty = null;
let gameOver = false;
let computerThinking = false;
let gameVersion = 0;

// ==============================
// جابه‌جایی بین صفحه‌ها
// ==============================

function showScreen(screen) {
    [homeScreen, difficultyScreen, gameScreen].forEach((item) => {
        item.classList.remove('active');
    });

    screen.classList.add('active');
}

function showHomeScreen() {
    gameVersion++;
    gameMode = null;
    difficulty = null;
    computerThinking = false;

    resultPanel.classList.add('hidden');
    showScreen(homeScreen);
}

// ==============================
// شروع بازی
// ==============================

function startGame(mode, selectedDifficulty = null) {
    gameVersion++;

    gameMode = mode;
    difficulty = selectedDifficulty;

    board = Array(9).fill('');
    currentPlayer = 'X';
    gameOver = false;
    computerThinking = false;

    resultPanel.classList.add('hidden');

    cells.forEach((cell) => {
        cell.textContent = '';
        cell.classList.remove('x', 'o');
        cell.disabled = false;
        cell.setAttribute('aria-label', 'خانه خالی');
    });

    showScreen(gameScreen);
    updateGameDisplay();
}

// ==============================
// نمایش نوبت بازیکنان
// ==============================

function updateGameDisplay() {

    gameFrame.classList.toggle('turn-x', currentPlayer === 'X');
    gameFrame.classList.toggle('turn-o', currentPlayer === 'O');

    turnInfo.style.color =
        currentPlayer === 'X' ? 'var(--red)' : 'var(--blue)';

    if (gameMode === 'computer' && currentPlayer === 'O') {
        turnInfo.textContent = 'نوبت کامپیوتر (O)';
    } else {
        turnInfo.textContent = `نوبت بازیکن ${currentPlayer}`;
    }

    cells.forEach((cell, index) => {
        cell.disabled =
            gameOver ||
            board[index] !== '' ||
            computerThinking;
    });
}

// ==============================
// تشخیص برنده
// ==============================

function getWinner(currentBoard) {

    for (const combination of WINNING_COMBINATIONS) {

        const [a, b, c] = combination;

        if (
            currentBoard[a] !== '' &&
            currentBoard[a] === currentBoard[b] &&
            currentBoard[a] === currentBoard[c]
        ) {
            return currentBoard[a];
        }
    }

    return null;
}

// ==============================
// تشخیص مساوی
// ==============================

function isDraw(currentBoard) {

    return (
        currentBoard.every((cell) => cell !== '') &&
        !getWinner(currentBoard)
    );
}

// ==============================
// ثبت حرکت بازیکن
// ==============================

function makeMove(index, player) {

    if (
        gameOver ||
        board[index] !== '' ||
        (gameMode === 'computer' && player !== 'X' && player !== 'O')
    ) {
        return false;
    }

    board[index] = player;

    cells[index].textContent = player;
    cells[index].classList.add(player.toLowerCase());

    cells[index].setAttribute(
        'aria-label',
        `خانه ${index + 1}: ${player}`
    );

    cells[index].disabled = true;

    const winner = getWinner(board);

    if (winner) {
        finishGame(winner);
        return true;
    }

    if (isDraw(board)) {
        finishGame(null);
        return true;
    }

    currentPlayer = player === 'X' ? 'O' : 'X';

    updateGameDisplay();

    if (gameMode === 'computer' && currentPlayer === 'O') {
        playComputerTurn();
    }

    return true;
}

// ==============================
// پایان بازی
// ==============================

function finishGame(winner) {

    gameOver = true;
    computerThinking = false;

    cells.forEach((cell) => {
        cell.disabled = true;
    });

    if (!winner) {

        resultTitle.textContent = 'مساوی شد!';
        resultMessage.textContent = 'بازی خیلی نزدیکی بود!';

    } else if (gameMode === 'computer') {

        if (winner === 'X') {

            resultTitle.textContent = 'بردی!';
            resultMessage.textContent =
                'آفرین! کامپیوتر رو شکست دادی.';

        } else {

            resultTitle.textContent = 'باختی!';
            resultMessage.textContent = 'دوباره تلاش کن!';
        }

    } else {

        resultTitle.textContent = 'بردی!';
        resultMessage.textContent =
            `بازیکن ${winner} برنده شد!`;
    }

    resultPanel.classList.remove('hidden');

    updateGameDisplay();
}

// ==============================
// پیدا کردن خانه‌های خالی
// ==============================

function getEmptyCells(currentBoard) {

    return currentBoard
        .map((value, index) => value === '' ? index : -1)
        .filter((index) => index !== -1);
}

// ==============================
// پیدا کردن حرکت برنده یا دفاعی
// ==============================

function findWinningMove(currentBoard, player) {

    for (const index of getEmptyCells(currentBoard)) {

        const testBoard = [...currentBoard];

        testBoard[index] = player;

        if (getWinner(testBoard) === player) {
            return index;
        }
    }

    return null;
}

// ==============================
// درجه آسان
// ==============================

function getEasyMove() {

    const available = getEmptyCells(board);

    return available[
        Math.floor(Math.random() * available.length)
    ];
}

// ==============================
// درجه متوسط
// ==============================

function getMediumMove() {

    // اگر کامپیوتر بتواند برنده شود
    const winningMove = findWinningMove(board, 'O');

    if (winningMove !== null) {
        return winningMove;
    }

    // اگر بازیکن در آستانه برد باشد
    const blockingMove = findWinningMove(board, 'X');

    if (blockingMove !== null) {
        return blockingMove;
    }

    // در غیر این صورت حرکت تصادفی
    return getEasyMove();
}

// ==============================
// الگوریتم Minimax
// درجه سخت
// ==============================

function minimax(currentBoard, depth, isMaximizing) {

    const winner = getWinner(currentBoard);

    if (winner === 'O') return 10 - depth;
    if (winner === 'X') return depth - 10;
    if (isDraw(currentBoard)) return 0;

    if (isMaximizing) {

        let bestScore = -Infinity;

        for (const index of getEmptyCells(currentBoard)) {

            currentBoard[index] = 'O';

            const score = minimax(
                currentBoard,
                depth + 1,
                false
            );

            currentBoard[index] = '';

            bestScore = Math.max(bestScore, score);
        }

        return bestScore;
    }

    let bestScore = Infinity;

    for (const index of getEmptyCells(currentBoard)) {

        currentBoard[index] = 'X';

        const score = minimax(
            currentBoard,
            depth + 1,
            true
        );

        currentBoard[index] = '';

        bestScore = Math.min(bestScore, score);
    }

    return bestScore;
}

// ==============================
// انتخاب بهترین حرکت کامپیوتر
// ==============================

function getHardMove() {

    const available = getEmptyCells(board);

    let bestMove = available[0];
    let bestScore = -Infinity;

    for (const index of available) {

        board[index] = 'O';

        const score = minimax(board, 0, false);

        board[index] = '';

        if (score > bestScore) {

            bestScore = score;
            bestMove = index;
        }
    }

    return bestMove;
}

// ==============================
// نوبت کامپیوتر
// ==============================

function playComputerTurn() {

    if (
        gameOver ||
        gameMode !== 'computer' ||
        currentPlayer !== 'O'
    ) {
        return;
    }

    computerThinking = true;

    updateGameDisplay();

    const currentVersion = gameVersion;

    window.setTimeout(() => {

        if (
            currentVersion !== gameVersion ||
            gameOver ||
            gameMode !== 'computer' ||
            currentPlayer !== 'O'
        ) {
            return;
        }

        let computerMove;

        if (difficulty === 'easy') {

            computerMove = getEasyMove();

        } else if (difficulty === 'medium') {

            computerMove = getMediumMove();

        } else {

            computerMove = getHardMove();
        }

        computerThinking = false;

        if (
            computerMove !== undefined &&
            computerMove !== null
        ) {

            makeMove(computerMove, 'O');

        } else {

            updateGameDisplay();
        }

    }, 350);
}

// ==============================
// اتصال دکمه‌ها
// ==============================

// بازی دو نفره
twoPlayerButton.addEventListener('click', () => {
    startGame('two-player');
});

// بازی با کامپیوتر
computerButton.addEventListener('click', () => {
    showScreen(difficultyScreen);
});

// بازگشت از انتخاب سختی
backHomeButton.addEventListener('click', () => {
    showHomeScreen();
});

// انتخاب درجه سختی
difficultyButtons.forEach((button) => {

    button.addEventListener('click', () => {

        startGame(
            'computer',
            button.dataset.difficulty
        );

    });

});

// کلیک روی خانه‌های جدول
cells.forEach((cell) => {

    cell.addEventListener('click', () => {

        const index = Number(cell.dataset.index);

        if (
            !Number.isInteger(index) ||
            index < 0 ||
            index > 8
        ) {
            return;
        }

        if (gameMode === 'computer' && currentPlayer !== 'X') {
            return;
        }

        makeMove(index, currentPlayer);
    });

});

// شروع دوباره با حفظ حالت قبلی
restartButton.addEventListener('click', () => {

    if (gameMode) {
        startGame(gameMode, difficulty);
    }

});

// بازگشت به صفحه اول
mainMenuButton.addEventListener('click', () => {
    showHomeScreen();
});

// ==============================
// نمایش صفحه شروع هنگام ورود
// ==============================

showScreen(homeScreen);
