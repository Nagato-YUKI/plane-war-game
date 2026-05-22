const Renderer = {
    canvas: null,
    ctx: null,
    stars: [],
    _vignetteGrad: null,

    init() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;
        this.initStars();
        this.initVignette();
    },

    initStars() {
        this.stars = [];
        for (let i = 0; i < STAR_COUNT; i++) {
            this.stars.push({
                x: Math.random() * CANVAS_WIDTH,
                y: Math.random() * CANVAS_HEIGHT,
                size: Math.random() * 1.5 + 0.3,
                speed: Math.random() * 1.5 + 0.5,
                brightness: Math.random() * 0.6 + 0.2,
                twinkleSpeed: Math.random() * 0.003 + 0.001,
                twinkleOffset: Math.random() * Math.PI * 2
            });
        }
    },

    initVignette() {
        this._vignetteGrad = this.ctx.createRadialGradient(
            CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT * 0.35,
            CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT * 0.75
        );
        this._vignetteGrad.addColorStop(0, 'rgba(0,0,0,0)');
        this._vignetteGrad.addColorStop(1, 'rgba(0,0,0,0.4)');
    },

    updateStars() {
        const time = Date.now();
        for (const star of this.stars) {
            star.y += star.speed;
            if (star.y > CANVAS_HEIGHT) {
                star.y = 0;
                star.x = Math.random() * CANVAS_WIDTH;
            }
            star._currentBrightness = star.brightness * (0.7 + 0.3 * Math.sin(time * star.twinkleSpeed + star.twinkleOffset));
        }
    },

    drawStars() {
        for (const star of this.stars) {
            const b = star._currentBrightness || star.brightness;
            this.ctx.fillStyle = `rgba(180, 200, 255, ${b})`;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    },

    drawVignette() {
        if (this._vignetteGrad) {
            this.ctx.fillStyle = this._vignetteGrad;
            this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        }
    },

    drawBackground() {
        const grad = this.ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
        grad.addColorStop(0, '#030310');
        grad.addColorStop(0.5, '#050518');
        grad.addColorStop(1, '#080820');
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
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

        this.drawBackground();
        this.updateStars();
        this.drawStars();
        this.drawVignette();

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
