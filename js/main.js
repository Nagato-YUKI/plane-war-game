function handleKeyDown(event) {
    if (event.code === 'Space') {
        event.preventDefault();
        if (currentState === GAME_STATE.START) {
            startGame();
        } else if (currentState === GAME_STATE.GAME_OVER) {
            resetGame();
        }
    }
    if (event.code === 'KeyB') {
        event.preventDefault();
        useBomb();
    }
    keys[event.code] = true;
}

function handleKeyUp(event) {
    keys[event.code] = false;
}

function handleMouseMove(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    mouseX = (event.clientX - rect.left) * scaleX;
    mouseY = (event.clientY - rect.top) * scaleY;
}

function handleMouseDown(event) {
    isMouseDown = true;
    mouseControl = true;
    handleMouseMove(event);
}

function handleMouseUp() {
    isMouseDown = false;
    mouseControl = false;
}

function handleTouchStart(event) {
    event.preventDefault();
    touchControl = true;
    const touch = event.touches[0];
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    touchX = (touch.clientX - rect.left) * scaleX;
    touchY = (touch.clientY - rect.top) * scaleY;
}

function handleTouchMove(event) {
    event.preventDefault();
    const touch = event.touches[0];
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    touchX = (touch.clientX - rect.left) * scaleX;
    touchY = (touch.clientY - rect.top) * scaleY;
}

function handleTouchEnd(event) {
    event.preventDefault();
    touchControl = false;
}

function handleCanvasClick(event) {
    if (currentState !== GAME_STATE.START) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    const clickX = (event.clientX - rect.left) * scaleX;
    const clickY = (event.clientY - rect.top) * scaleY;

    checkSkinSelectionClick(clickX, clickY);
    checkWeaponSelectionClick(clickX, clickY);
}

function checkSkinSelectionClick(clickX, clickY) {
    const unlocked = getUnlockedSkins();
    const y = CANVAS_HEIGHT / 2 + 100;
    const spacing = 80;
    const totalWidth = unlocked.length * spacing;
    const startX = (CANVAS_WIDTH - totalWidth) / 2 + spacing / 2;

    for (let i = 0; i < unlocked.length; i++) {
        const x = startX + i * spacing;
        if (
            clickX >= x - 24 &&
            clickX <= x + 24 &&
            clickY >= y - 10 &&
            clickY <= y + 38
        ) {
            selectSkin(unlocked[i]);
            break;
        }
    }
}

function checkWeaponSelectionClick(clickX, clickY) {
    const unlocked = getUnlockedWeapons();
    const y = CANVAS_HEIGHT / 2 + 190;
    const spacing = 90;
    const totalWidth = unlocked.length * spacing;
    const startX = (CANVAS_WIDTH - totalWidth) / 2 + spacing / 2;

    for (let i = 0; i < unlocked.length; i++) {
        const x = startX + i * spacing;
        if (
            clickX >= x - 35 &&
            clickX <= x + 35 &&
            clickY >= y - 5 &&
            clickY <= y + 25
        ) {
            selectWeapon(unlocked[i]);
            break;
        }
    }
}

function startGame() {
    currentState = GAME_STATE.PLAYING;
    gameStartTime = Date.now();
    player.weapon = selectedWeapon;
    player.weaponLevel = 1;
}

function resetGame() {
    score = 0;
    gameTime = 0;
    waveNumber = 1;
    bossActive = false;
    player.x = CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2;
    player.y = CANVAS_HEIGHT - PLAYER_HEIGHT - 20;
    player.lives = PLAYER_LIVES;
    player.bombs = 1;
    player.weapon = selectedWeapon;
    player.weaponLevel = 1;
    player.invincibleUntil = 0;
    player.shieldUntil = 0;
    playerBullets = [];
    enemies = [];
    enemyBullets = [];
    items = [];
    scorePopups = [];
    unlockNotifications = [];
    particles = [];
    screenShake = { x: 0, y: 0, intensity: 0 };
    lastBulletTime = 0;
    lastEnemySpawnTime = 0;
    startGame();
}

function gameLoop() {
    if (currentState === GAME_STATE.PLAYING) {
        updateGame();
    }
    render();
    gameLoopId = requestAnimationFrame(gameLoop);
}

function init() {
    initRenderer();
    preloadAssets();

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    canvas.addEventListener('click', handleCanvasClick);

    gameLoop();
}

window.addEventListener('load', init);
