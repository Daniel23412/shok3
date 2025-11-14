Telegram.WebApp.ready();
Telegram.WebApp.expand();

const grid = document.getElementById('grid');
const showAllBtn = document.getElementById('showAll');

// Создаём 25 клеток
for (let i = 0; i < 25; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.addEventListener('click', () => {
        if (!cell.classList.contains('opened')) {
            cell.classList.add('opened');
        }
    });
    grid.appendChild(cell);
}

// Кнопка "показать все звёзды"
showAllBtn.addEventListener('click', () => {
    document.querySelectorAll('.cell:not(.opened)').forEach(cell => {
        cell.classList.add('opened', 'cheat');
    });
});
