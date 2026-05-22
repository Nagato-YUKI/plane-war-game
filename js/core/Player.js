const Player = {
    x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2,
    y: CANVAS_HEIGHT - PLAYER_HEIGHT - 20,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    speed: PLAYER_SPEED,
    lives: PLAYER_LIVES,
    maxLives: PLAYER_LIVES,
    invincibleUntil: 0,
    shieldUntil: 0,
    bombs: 1,
    weapon: 'vulcan',
    weaponLevel: 1,
    speedBoostUntil: 0,
    speedBoostLevel: 0,
    lastBulletTime: 0,

    init() {
        this.x = CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2;
        this.y = CANVAS_HEIGHT - PLAYER_HEIGHT - 20;
        this.lives = PLAYER_LIVES;
        this.bombs = 1;
        this.weapon = 'vulcan';
        this.weaponLevel = 1;
        this.invincibleUntil = 0;
        this.shieldUntil = 0;
        this.speedBoostUntil = 0;
        this.speedBoostLevel = 0;
        this.lastBulletTime = 0;
    },

    update(keys, mouseControl, mouseX, mouseY, touchControl, touchX, touchY) {
        let targetX = this.x;
        let targetY = this.y;
        let isMoving = false;

        if (touchControl) {
            targetX = touchX - this.width / 2;
            targetY = touchY - this.height / 2;
            isMoving = true;
        } else if (mouseControl) {
            targetX = mouseX - this.width / 2;
            targetY = mouseY - this.height / 2;
            isMoving = true;
        } else {
            if (keys['ArrowUp']) { targetY = this.y - this.speed; isMoving = true; }
            if (keys['ArrowDown']) { targetY = this.y + this.speed; isMoving = true; }
            if (keys['ArrowLeft']) { targetX = this.x - this.speed; isMoving = true; }
            if (keys['ArrowRight']) { targetX = this.x + this.speed; isMoving = true; }
        }

        const currentSpeed = Date.now() < this.speedBoostUntil
            ? this.speed * (1 + this.speedBoostLevel * 0.2)
            : this.speed;

        if (isMoving && (mouseControl || touchControl)) {
            const dx = targetX - this.x;
            const dy = targetY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 1) {
                const moveSpeed = Math.min(currentSpeed * 1.2, dist);
                this.x += (dx / dist) * moveSpeed;
                this.y += (dy / dist) * moveSpeed;
            }
        } else {
            this.x = targetX;
            this.y = targetY;
        }

        this.clampPosition();
    },

    clampPosition() {
        this.x = MathUtils.clamp(this.x, 0, CANVAS_WIDTH - this.width);
        this.y = MathUtils.clamp(this.y, 0, CANVAS_HEIGHT - this.height);
    },

    isInvincible() {
        return Date.now() < this.invincibleUntil;
    },

    hasShield() {
        return Date.now() < this.shieldUntil;
    },

    hit() {
        if (this.isInvincible() || this.hasShield()) return false;

        this.lives--;
        this.invincibleUntil = Date.now() + PLAYER_INVINCIBLE_MS;
        this.weaponLevel = Math.max(1, this.weaponLevel - 2);

        EffectSystem.createExplosion(
            this.x + this.width / 2,
            this.y + this.height / 2,
            '#00ffff', '#ffffff', 30
        );
        EffectSystem.addScreenShake(8);

        return this.lives <= 0;
    },

    useBomb() {
        if (this.bombs <= 0) return false;
        this.bombs--;
        EffectSystem.addScreenShake(12);
        return true;
    },

    getCenterX() {
        return this.x + this.width / 2;
    },

    getCenterY() {
        return this.y + this.height / 2;
    },

    getEngineX() {
        return this.x + this.width / 2;
    },

    getEngineY() {
        return this.y + this.height;
    }
};
