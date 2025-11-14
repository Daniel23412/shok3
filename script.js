const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const minesCountInput = document.getElementById('minesCount');
const betInput = document.getElementById('betAmount');
const startBtn = document.getElementById('startGame');
const field = document.getElementById('gameField');
const info = document.getElementById('gameInfo');
const multiplierEl = document.getElementById('multiplier');
const winEl = document.getElementById('winAmount');
const cashoutBtn = document.getElementById('cashout');
const showMinesBtn = document.getElementById('showMines');
const resultEl = document.getElementById('result');

let mines = [];
let opened = 0;
let gameActive = false;
let bet = 0;
let minesAmount = 0;
let starsPerCell = 0; // Кол-во звёздочек!

startBtn.addEventListener('click', startGame);
cashoutBtn.addEventListener('click', cashout);
showMinesBtn.addEventListener('click', showSafeCells);

function startGame() {
    minesAmount = parseInt(minesCountInput.value);
    bet = parseInt(betInput.value);
    if (minesAmount < 1 || minesAmount > 20) return alert("Мины от 1 до 20");

    // Вычисление звёздочек по твоей формуле
    starsPerCell = getStarsCount(minesAmount);

    // Генерация мин
    mines = [];
    while (mines.length < minesAmount) {
        const pos = Math.floor(Math.random() * 25);
        if (!mines.includes(pos)) mines.push(pos);
    }

    // Очистка и создание поля
    field.innerHTML = '';
    field.classList.remove('hidden');
    info.classList.remove('hidden');
    resultEl.classList.add('hidden');

    for (let i = 0; i < 25; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i;
        cell.innerHTML = '✦'; // Изначально звёздочка
        cell.addEventListener('click', () => openCell(cell, i));
        field.appendChild(cell);
    }

    opened = 0;
    gameActive = true;
    cashoutBtn.disabled = false;
    updateMultiplier();
}

function getStarsCount(mines) {
    if (mines === 1) return Math.floor(Math.random() * 4) + 7; // 7-10
    if (mines === 3) return Math.floor(Math.random() * 3) + 5; // 5-7
    if (mines === 5) return Math.floor(Math.random() * 3) + 3; // 3-5
    return Math.floor(Math.random() * 2) + 7; // 7-8 по умолчанию
}

function openCell(cell, index) {
    if (!gameActive || cell.classList.contains('safe') || cell.classList.contains('mine')) return;

    if (mines.includes(index)) {
        // БУМ! Только бомба, без звёзд
        cell.classList.add('mine');
        cell.innerHTML = '💣';
        revealAllMines();
        endGame(false);
    } else {
        // БЕЗОПАСНО! Генерируем звёздочки
        cell.classList.add('safe');
        cell.innerHTML = generateStars(starsPerCell);
        opened++;
        updateMultiplier();
        if (opened === 25 - minesAmount) {
            cashout(); // автопобеда
        }
    }
}

function generateStars(count) {
    let stars = '';
    for (let i = 0; i < count; i++) {
        stars += '⭐';
    }
    return `<div class="stars">${stars}</div>`;
}

function revealAllMines() {
    document.querySelectorAll('.cell').forEach((cell, i) => {
        if (mines.includes(i) && !cell.classList.contains('mine')) {
            cell.classList.add('mine');
            cell.innerHTML = '💣';
        }
    });
}

function showSafeCells() {
    document.querySelectorAll('.cell:not(.safe):not(.mine)').forEach(cell => {
        const index = +cell.dataset.index;
        if (!mines.includes(index)) {
            cell.classList.add('cheat');
            // Показываем звёздочки в чит-режиме
            cell.innerHTML = generateStars(starsPerCell);
        }
    });
}

function updateMultiplier() {
    const multiplier = getMultiplier(opened, minesAmount);
    const win = bet * multiplier;
    multiplierEl.textContent = `Множитель: ${multiplier.toFixed(2)}×`;
    winEl.textContent = `Выигрыш: ${win.toFixed(0)} ₽`;
}

function getMultiplier(opened, totalMines) {
    if (opened === 0) return 1;
    const p = 1 - totalMines / 25;
    return Math.round(100 * (0.99 / p) * Math.pow(1.0175, opened - 1)) / 100;
}

function cashout() {
    if (!gameActive) return;
    const multiplier = getMultiplier(opened, minesAmount);
    const win = bet * multiplier;
    endGame(true, win);
}

function endGame(win, amount = 0) {
    gameActive = false;
    cashoutBtn.disabled = true;
    resultEl.classList.remove('hidden');
    if (win) {
        resultEl.textContent = `ВЫИГРАНО ${amount.toFixed(0)} ₽ !`;
        resultEl.classList.add('win');
    } else {
        resultEl.textContent = `МИНА! Проиграно ${bet} ₽`;
        revealAllMines();
    }
}