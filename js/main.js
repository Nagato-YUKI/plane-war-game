const InputHandler = {
    _inputActive: false,
    _inputBuffer: '',

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

    isInputActive() {
        return this._inputActive;
    },

    handleKeyDown(event) {
        if (event.code === 'Tab') {
            event.preventDefault();
            if (GameEngine.getState() === GAME_STATE.START) {
                UIRenderer._showLeaderboard = !UIRenderer._showLeaderboard;
            }
            return;
        }

        if (this._inputActive && GameEngine.getState() === GAME_STATE.START) {
            event.preventDefault();
            if (event.code === 'Enter') {
                if (this._inputBuffer.length > 0) {
                    LeaderboardSystem.setPlayerId(this._inputBuffer);
                }
                this._inputActive = false;
                this._inputBuffer = '';
                return;
            }
            if (event.code === 'Escape') {
                this._inputActive = false;
                this._inputBuffer = '';
                return;
            }
            if (event.code === 'Backspace') {
                this._inputBuffer = this._inputBuffer.slice(0, -1);
                return;
            }
            if (event.key.length === 1 && this._inputBuffer.length < 8) {
                this._inputBuffer += event.key;
                return;
            }
            return;
        }

        if (event.code === 'Space') {
            event.preventDefault();
            if (GameEngine.getState() === GAME_STATE.START) {
                if (UIRenderer._showLeaderboard) {
                    UIRenderer._showLeaderboard = false;
                    return;
                }
                const playerId = LeaderboardSystem.getPlayerId();
                if (!playerId) {
                    this._inputActive = true;
                    this._inputBuffer = '';
                    return;
                }
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
        if (UIRenderer._showLeaderboard) return;

        const rect = Renderer.canvas.getBoundingClientRect();
        const scaleX = CANVAS_WIDTH / rect.width;
        const scaleY = CANVAS_HEIGHT / rect.height;
        const clickX = (event.clientX - rect.left) * scaleX;
        const clickY = (event.clientY - rect.top) * scaleY;

        if (this.checkPlayerIdClick(clickX, clickY)) return;
        this.checkDifficultyClick(clickX, clickY);
        this.checkSkinSelectionClick(clickX, clickY);
        this.checkWeaponSelectionClick(clickX, clickY);
    },

    checkPlayerIdClick(clickX, clickY) {
        const cx = CANVAS_WIDTH / 2;
        const y = 148;
        const boxW = 160;
        const boxH = 24;
        const boxX = cx - boxW / 2;

        if (clickX >= boxX && clickX <= boxX + boxW && clickY >= y - 2 && clickY <= y + boxH) {
            this._inputActive = true;
            this._inputBuffer = LeaderboardSystem.getPlayerId();
            return true;
        }
        return false;
    },

    checkDifficultyClick(clickX, clickY) {
        const cx = CANVAS_WIDTH / 2;
        const y = 206;
        const keys = Object.keys(DIFFICULTY);
        const spacing = 90;

        for (let i = 0; i < keys.length; i++) {
            const dx = cx + (i - 1.5) * spacing;
            if (clickX >= dx - 36 && clickX <= dx + 36 && clickY >= y - 4 && clickY <= y + 18) {
                GameEngine.selectDifficulty(keys[i]);
                break;
            }
        }
    },

    checkSkinSelectionClick(clickX, clickY) {
        const unlocked = getUnlockedSkins();
        const y = 256;
        const spacing = 75;
        const totalWidth = unlocked.length * spacing;
        const startX = (CANVAS_WIDTH - totalWidth) / 2 + spacing / 2;

        for (let i = 0; i < unlocked.length; i++) {
            const x = startX + i * spacing;
            if (clickX >= x - 26 && clickX <= x + 26 && clickY >= y - 10 && clickY <= y + 42) {
                GameEngine.selectSkin(unlocked[i]);
                break;
            }
        }
    },

    checkWeaponSelectionClick(clickX, clickY) {
        const unlocked = getUnlockedWeapons();
        const y = 340;
        const spacing = 120;
        const totalWidth = unlocked.length * spacing;
        const startX = (CANVAS_WIDTH - totalWidth) / 2 + spacing / 2;

        for (let i = 0; i < unlocked.length; i++) {
            const x = startX + i * spacing;
            if (clickX >= x - 48 && clickX <= x + 48 && clickY >= y - 2 && clickY <= y + 28) {
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
