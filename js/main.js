const InputHandler = {
    init() {
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
        Renderer.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        Renderer.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        window.addEventListener('mouseup', this.handleMouseUp.bind(this));
        Renderer.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        Renderer.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        Renderer.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        Renderer.canvas.addEventListener('click', this.handleCanvasClick.bind(this));
    },

    handleKeyDown(event) {
        if (event.code === 'Space') {
            event.preventDefault();
            if (GameEngine.getState() === GAME_STATE.START) {
                GameEngine.start();
            } else if (GameEngine.getState() === GAME_STATE.GAME_OVER) {
                GameEngine.init();
                GameEngine.start();
            }
        }
        if (event.code === 'KeyB') {
            event.preventDefault();
            GameEngine.useBomb();
        }
        GameEngine.keys[event.code] = true;
    },

    handleKeyUp(event) {
        GameEngine.keys[event.code] = false;
    },

    handleMouseMove(event) {
        const rect = Renderer.canvas.getBoundingClientRect();
        const scaleX = CANVAS_WIDTH / rect.width;
        const scaleY = CANVAS_HEIGHT / rect.height;
        GameEngine.mouseX = (event.clientX - rect.left) * scaleX;
        GameEngine.mouseY = (event.clientY - rect.top) * scaleY;
    },

    handleMouseDown(event) {
        GameEngine.isMouseDown = true;
        GameEngine.mouseControl = true;
        this.handleMouseMove(event);
    },

    handleMouseUp() {
        GameEngine.isMouseDown = false;
        GameEngine.mouseControl = false;
    },

    handleTouchStart(event) {
        event.preventDefault();
        GameEngine.touchControl = true;
        const touch = event.touches[0];
        const rect = Renderer.canvas.getBoundingClientRect();
        const scaleX = CANVAS_WIDTH / rect.width;
        const scaleY = CANVAS_HEIGHT / rect.height;
        GameEngine.touchX = (touch.clientX - rect.left) * scaleX;
        GameEngine.touchY = (touch.clientY - rect.top) * scaleY;
    },

    handleTouchMove(event) {
        event.preventDefault();
        const touch = event.touches[0];
        const rect = Renderer.canvas.getBoundingClientRect();
        const scaleX = CANVAS_WIDTH / rect.width;
        const scaleY = CANVAS_HEIGHT / rect.height;
        GameEngine.touchX = (touch.clientX - rect.left) * scaleX;
        GameEngine.touchY = (touch.clientY - rect.top) * scaleY;
    },

    handleTouchEnd(event) {
        event.preventDefault();
        GameEngine.touchControl = false;
    },

    handleCanvasClick(event) {
        if (GameEngine.getState() !== GAME_STATE.START) return;
        const rect = Renderer.canvas.getBoundingClientRect();
        const scaleX = CANVAS_WIDTH / rect.width;
        const scaleY = CANVAS_HEIGHT / rect.height;
        const clickX = (event.clientX - rect.left) * scaleX;
        const clickY = (event.clientY - rect.top) * scaleY;

        this.checkSkinSelectionClick(clickX, clickY);
        this.checkWeaponSelectionClick(clickX, clickY);
    },

    checkSkinSelectionClick(clickX, clickY) {
        const unlocked = getUnlockedSkins();
        const y = CANVAS_HEIGHT / 2 + 100;
        const spacing = 80;
        const totalWidth = unlocked.length * spacing;
        const startX = (CANVAS_WIDTH - totalWidth) / 2 + spacing / 2;

        for (let i = 0; i < unlocked.length; i++) {
            const x = startX + i * spacing;
            if (clickX >= x - 24 && clickX <= x + 24 && clickY >= y - 10 && clickY <= y + 38) {
                GameEngine.selectSkin(unlocked[i]);
                break;
            }
        }
    },

    checkWeaponSelectionClick(clickX, clickY) {
        const unlocked = getUnlockedWeapons();
        const y = CANVAS_HEIGHT / 2 + 190;
        const spacing = 90;
        const totalWidth = unlocked.length * spacing;
        const startX = (CANVAS_WIDTH - totalWidth) / 2 + spacing / 2;

        for (let i = 0; i < unlocked.length; i++) {
            const x = startX + i * spacing;
            if (clickX >= x - 35 && clickX <= x + 35 && clickY >= y - 5 && clickY <= y + 25) {
                GameEngine.selectWeapon(unlocked[i]);
                break;
            }
        }
    }
};

function gameLoop() {
    GameEngine.update();
    Renderer.render(
        GameEngine.getState(),
        Player,
        GameEngine.getDifficulty(),
        GameEngine.getWaveNumber(),
        GameEngine.getSelectedSkin(),
        GameEngine.getSelectedWeapon()
    );
    requestAnimationFrame(gameLoop);
}

function init() {
    Renderer.init();
    preloadAssets();
    GameEngine.init();
    InputHandler.init();
    gameLoop();
}

window.addEventListener('load', init);
