const GameEngine = {
    currentState: GAME_STATE.START,
    gameLoopId: null,
    gameTime: 0,
    gameStartTime: 0,
    waveNumber: 1,
    bossNoDamage: true,
    currentDifficulty: 'NORMAL',
    selectedSkin: localStorage.getItem('planeWarCurrentSkin') || 'default',
    selectedWeapon: localStorage.getItem('planeWarCurrentWeapon') || 'vulcan',

    keys: {},
    mouseControl: false,
    mouseX: 0,
    mouseY: 0,
    isMouseDown: false,
    touchControl: false,
    touchX: 0,
    touchY: 0,

    init() {
        this.currentState = GAME_STATE.START;
        this.waveNumber = 1;
        this.bossNoDamage = true;
        this.currentDifficulty = 'NORMAL';
        this.selectedSkin = localStorage.getItem('planeWarCurrentSkin') || 'default';
        this.selectedWeapon = localStorage.getItem('planeWarCurrentWeapon') || 'vulcan';

        Player.init();
        BulletSystem.init();
        EnemyManager.init();
        ItemSystem.init();
        EffectSystem.init();
        ScoreSystem.init();
        LeaderboardSystem.init();
    },

    start() {
        this.currentState = GAME_STATE.PLAYING;
        this.gameStartTime = Date.now();
        this.gameTime = 0;
        this.waveNumber = 1;
        this.bossNoDamage = true;

        Player.init();
        Player.weapon = this.selectedWeapon;
        Player.weaponLevel = 1;

        BulletSystem.init();
        EnemyManager.init();
        ItemSystem.init();
        EffectSystem.init();
        ScoreSystem.init();
    },

    update() {
        if (this.currentState !== GAME_STATE.PLAYING) return;

        this.gameTime = (Date.now() - this.gameStartTime) / 1000;
        if (!EnemyManager.isBossActive() && this.gameTime > this.waveNumber * 30) {
            this.waveNumber++;
        }

        Player.update(
            this.keys,
            this.mouseControl,
            this.mouseX,
            this.mouseY,
            this.touchControl,
            this.touchX,
            this.touchY
        );

        // 生成引擎粒子
        const skin = SKINS[this.selectedSkin] || SKINS.default;
        EffectSystem.createEngineParticle(Player.getEngineX(), Player.getEngineY(), skin.colors.engine);

        BulletSystem.update();
        this.tryFireBullet();

        EnemyManager.spawn(this.currentDifficulty, this.waveNumber, Player);
        EnemyManager.update(this.gameTime);
        EnemyManager.tryShoot(this.currentDifficulty, Player);

        this.checkGraze();
        ItemSystem.update(Player);
        this.checkBulletEnemyCollisions();
        this.checkPlayerCollisions();

        EffectSystem.update();
        ScoreSystem.update();

        ScoreSystem.addScore(10 / 60);
    },

    tryFireBullet() {
        const shouldFire = this.keys['Space'] || this.mouseControl || this.touchControl;
        if (!shouldFire) return;
        BulletSystem.firePlayerBullet(Player, this.selectedWeapon);
    },

    checkGraze() {
        for (const bullet of BulletSystem.getEnemyBullets()) {
            if (CollisionUtils.checkGraze(Player, bullet)) {
                bullet.grazed = true;
                ScoreSystem.addGraze();
                EffectSystem.createGrazeEffect(bullet.x, bullet.y);
            }
        }
    },

    checkBulletEnemyCollisions() {
        const playerBullets = BulletSystem.getPlayerBullets();
        const enemies = EnemyManager.getEnemies();

        for (let i = playerBullets.length - 1; i >= 0; i--) {
            const bullet = playerBullets[i];
            let hit = false;

            for (let j = enemies.length - 1; j >= 0; j--) {
                const enemy = enemies[j];

                if (bullet.weaponType === 'laser') {
                    this.checkLaserCollision(bullet, enemy, j);
                } else {
                    hit = this.checkRegularBulletCollision(bullet, enemy, i, j);
                    if (hit) break;
                }
            }

            if (hit) break;
        }
    },

    checkLaserCollision(bullet, enemy, enemyIndex) {
        const laserX = bullet.x - bullet.width / 2;
        const laserRight = bullet.x + bullet.width / 2;
        if (laserRight > enemy.x && laserX < enemy.x + enemy.width && bullet.y > enemy.y) {
            const isDead = EnemyManager.damageEnemy(enemyIndex, bullet.damage || 2);
            if (isDead) this.destroyEnemy(enemyIndex);
        }
    },

    checkRegularBulletCollision(bullet, enemy, bulletIndex, enemyIndex) {
        const bulletRect = {
            x: bullet.x - bullet.width / 2,
            y: bullet.y,
            width: bullet.width,
            height: bullet.height
        };

        if (CollisionUtils.checkCollision(bulletRect, BULLET_HITBOX_RATIO, enemy, ENEMY_HITBOX_RATIO)) {
            const isDead = EnemyManager.damageEnemy(enemyIndex, bullet.damage || 1);
            BulletSystem.getPlayerBullets().splice(bulletIndex, 1);
            if (isDead) this.destroyEnemy(enemyIndex);
            return true;
        }
        return false;
    },

    destroyEnemy(index) {
        const enemy = EnemyManager.removeEnemy(index);
        const ex = enemy.x + enemy.width / 2;
        const ey = enemy.y + enemy.height / 2;

        if (enemy.type === 'boss') {
            const typeDef = BOSS_TYPES[enemy.bossType];
            EffectSystem.createExplosion(ex, ey, typeDef.colors.glow, typeDef.colors.core, 50);
            EffectSystem.addScreenShake(15);
            ScoreSystem.addScore(typeDef.score, ex, ey - 10, this.currentDifficulty);
            ScoreSystem.checkAchievements(this.currentDifficulty, this.bossNoDamage);
        } else {
            const typeDef = ENEMY_TYPES[enemy.type];
            EffectSystem.createExplosion(ex, ey, typeDef.colors.glow, typeDef.colors.core,
                enemy.type === 'bomber' ? 30 : 15);
            EffectSystem.addScreenShake(enemy.type === 'bomber' ? 5 : 2);
            ScoreSystem.addScore(typeDef.score, ex, ey - 10, this.currentDifficulty);
            ScoreSystem.addCombo(1);
        }

        ItemSystem.spawnFromEnemy(enemy);
    },

    checkPlayerCollisions() {
        if (Player.isInvincible() || Player.hasShield()) return;

        for (const enemy of EnemyManager.getEnemies()) {
            if (CollisionUtils.checkCollision(Player, PLAYER_HITBOX_RATIO, enemy, ENEMY_HITBOX_RATIO)) {
                this.playerHit();
                return;
            }
        }

        for (const bullet of BulletSystem.getEnemyBullets()) {
            const bulletRect = {
                x: bullet.x - bullet.width / 2,
                y: bullet.y,
                width: bullet.width,
                height: bullet.height
            };
            if (CollisionUtils.checkCollision(Player, PLAYER_HITBOX_RATIO, bulletRect, BULLET_HITBOX_RATIO)) {
                this.playerHit();
                return;
            }
        }
    },

    playerHit() {
        const isDead = Player.hit();
        this.bossNoDamage = false;
        ScoreSystem.addCombo(-ScoreSystem.getComboCount()); // Reset combo

        if (isDead) {
            this.gameOver();
        }
    },

    useBomb() {
        if (!Player.useBomb()) return;

        for (const enemy of EnemyManager.getEnemies()) {
            EffectSystem.createExplosion(
                enemy.x + enemy.width / 2,
                enemy.y + enemy.height / 2,
                '#ff4444', '#ffaa00', 15
            );
        }

        EnemyManager.init();
        BulletSystem.init();
        Player.invincibleUntil = Date.now() + 3000;

        for (let i = 0; i < 30; i++) {
            EffectSystem.createParticle(
                CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2,
                (Math.random() - 0.5) * 15,
                (Math.random() - 0.5) * 15,
                '#ffffff', 20, 3
            );
        }
    },

    gameOver() {
        this.currentState = GAME_STATE.GAME_OVER;
        const finalScore = ScoreSystem.saveHighScore();
        ScoreSystem.checkUnlocks(ScoreSystem.getTotalScore());
        ScoreSystem.checkAchievements(this.currentDifficulty, this.bossNoDamage);

        const playerId = LeaderboardSystem.getPlayerId();
        if (playerId) {
            LeaderboardSystem.addRecord(playerId, ScoreSystem.getScore(), this.currentDifficulty, this.waveNumber);
        }
    },

    selectSkin(skinId) {
        if (getUnlockedSkins().includes(skinId)) {
            this.selectedSkin = skinId;
            localStorage.setItem('planeWarCurrentSkin', skinId);
        }
    },

    selectWeapon(weaponId) {
        if (getUnlockedWeapons().includes(weaponId)) {
            this.selectedWeapon = weaponId;
            localStorage.setItem('planeWarCurrentWeapon', weaponId);
        }
    },

    selectDifficulty(diff) {
        if (DIFFICULTY[diff]) {
            this.currentDifficulty = diff;
        }
    },

    getState() { return this.currentState; },
    getWaveNumber() { return this.waveNumber; },
    getSelectedSkin() { return this.selectedSkin; },
    getSelectedWeapon() { return this.selectedWeapon; },
    getDifficulty() { return this.currentDifficulty; }
};
