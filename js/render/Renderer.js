const Renderer = {
    canvas: null,
    ctx: null,
    stars: [],

    init() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;
        this.initStars();
    },

    initStars() {
        this.stars = [];
        for (let i = 0; i < STAR_COUNT; i++) {
            this.stars.push({
                x: Math.random() * CANVAS_WIDTH,
                y: Math.random() * CANVAS_HEIGHT,
                size: Math.random() * 2 + 0.5,
                speed: Math.random() * 1.5 + 0.5,
                brightness: Math.random()
            });
        }
    },

    updateStars() {
        for (const star of this.stars) {
            star.y += star.speed;
            if (star.y > CANVAS_HEIGHT) {
                star.y = 0;
                star.x = Math.random() * CANVAS_WIDTH;
            }
        }
    },

    drawStars() {
        for (const star of this.stars) {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    },

    clear() {
        this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    },

    save() {
        this.ctx.save();
    },

    restore() {
        this.ctx.restore();
    },

    translate(x, y) {
        this.ctx.translate(x, y);
    },

    getContext() {
        return this.ctx;
    },

    render(gameState, player, difficulty, waveNumber, selectedSkin, selectedWeapon) {
        this.clear();
        this.save();

        const shake = EffectSystem.getScreenShake();
        if (shake.intensity > 0) {
            this.translate(shake.x, shake.y);
        }

        this.updateStars();
        this.drawStars();
        EffectRenderer.drawParticles(this.ctx);
        EffectRenderer.drawEngineParticles(this.ctx);
        EffectRenderer.drawBulletHitEffects(this.ctx);

        if (gameState === GAME_STATE.PLAYING || gameState === GAME_STATE.GAME_OVER) {
            ItemRenderer.draw(this.ctx, ItemSystem.getItems());
            EnemyRenderer.draw(this.ctx, EnemyManager.getEnemies());
            BulletRenderer.draw(this.ctx, BulletSystem.getPlayerBullets(), BulletSystem.getEnemyBullets());
            PlayerRenderer.draw(this.ctx, player, selectedSkin);
            UIRenderer.drawScorePopups(this.ctx, ScoreSystem.getScorePopups());
            UIRenderer.drawNotifications(this.ctx, ScoreSystem.getNotifications());
            UIRenderer.drawHUD(this.ctx, player, difficulty, waveNumber, selectedSkin, selectedWeapon, ItemSystem.getWeaponDurationRatio());
        }

        if (gameState === GAME_STATE.START) {
            UIRenderer.drawStartScreen(this.ctx);
        }

        if (gameState === GAME_STATE.GAME_OVER) {
            UIRenderer.drawGameOverScreen(this.ctx);
        }

        this.restore();
    }
};
