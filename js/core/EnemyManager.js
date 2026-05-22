const EnemyManager = {
    enemies: [],
    bossActive: false,
    currentBossType: null,
    lastSpawnTime: 0,

    init() {
        this.enemies = [];
        this.bossActive = false;
        this.currentBossType = null;
        this.lastSpawnTime = 0;
    },

    spawn(difficulty, waveNumber, player) {
        if (this.bossActive) return;

        const diff = DIFFICULTY[difficulty];
        const maxEnemies = Math.min(Math.floor(diff.enemyCount + waveNumber * 2), 40);
        if (this.enemies.length >= maxEnemies) return;

        const now = Date.now();
        const spawnInterval = Math.max(100, 500 - waveNumber * 25);
        if (now - this.lastSpawnTime < spawnInterval) return;
        this.lastSpawnTime = now;

        const isBossWave = waveNumber % 5 === 0 && waveNumber > 0;
        if (isBossWave) {
            this.spawnBoss(difficulty, waveNumber);
            return;
        }

        if (Math.random() < 0.4 && waveNumber >= 2) {
            this.spawnFormation(difficulty, waveNumber);
        } else {
            this.spawnSingle(difficulty, waveNumber);
        }
    },

    spawnSingle(difficulty, waveNumber) {
        const rand = Math.random();
        let type = 'drone';
        if (waveNumber >= 3 && rand < 0.2) type = 'bomber';
        else if (waveNumber >= 2 && rand < 0.4) type = 'fighter';
        else if (waveNumber >= 4 && rand < 0.5) type = 'elite';

        const typeDef = ENEMY_TYPES[type];
        const x = Math.random() * (CANVAS_WIDTH - typeDef.width);

        this.enemies.push({
            x, y: -typeDef.height,
            width: typeDef.width,
            height: typeDef.height,
            type,
            hp: Math.floor(typeDef.hp * DIFFICULTY[difficulty].hpMult),
            maxHp: Math.floor(typeDef.hp * DIFFICULTY[difficulty].hpMult),
            speed: typeDef.speedBase + Math.random() * typeDef.speedVar,
            canShoot: typeDef.canShoot,
            lastShootTime: 0,
            shootPattern: 0,
            entryAnimation: true,
            entryProgress: 0,
            hitFlash: 0,
            isShooting: false
        });
    },

    spawnFormation(difficulty, waveNumber) {
        const types = ['drone', 'fighter', 'elite'];
        const type = types[Math.floor(Math.random() * Math.min(types.length, waveNumber))];
        const typeDef = ENEMY_TYPES[type];
        const count = Math.min(3 + Math.floor(waveNumber / 2), 10);
        const startX = Math.random() * (CANVAS_WIDTH - count * typeDef.width);

        for (let i = 0; i < count; i++) {
            this.enemies.push({
                x: startX + i * (typeDef.width + 10),
                y: -typeDef.height - Math.random() * 50,
                width: typeDef.width,
                height: typeDef.height,
                type,
                hp: Math.floor(typeDef.hp * DIFFICULTY[difficulty].hpMult),
                maxHp: Math.floor(typeDef.hp * DIFFICULTY[difficulty].hpMult),
                speed: typeDef.speedBase,
                canShoot: typeDef.canShoot,
                lastShootTime: 0,
                shootPattern: 0,
                entryAnimation: true,
                entryProgress: 0,
                hitFlash: 0,
                isShooting: false,
                formationIndex: i,
                formationCount: count
            });
        }
    },

    spawnBoss(difficulty, waveNumber) {
        this.bossActive = true;
        this.currentBossType = waveNumber % 10 === 5 ? 'mech' : 'bio';
        const typeDef = BOSS_TYPES[this.currentBossType];
        const diff = DIFFICULTY[difficulty];
        const hp = Math.floor(typeDef.hp * diff.hpMult * Math.pow(1.3, Math.floor((waveNumber - 1) / 5)));

        this.enemies.push({
            x: CANVAS_WIDTH / 2 - typeDef.width / 2,
            y: -typeDef.height,
            width: typeDef.width,
            height: typeDef.height,
            type: 'boss',
            bossType: this.currentBossType,
            hp, maxHp: hp,
            speed: typeDef.speedBase,
            canShoot: true,
            lastShootTime: 0,
            patternIndex: 0,
            patternSwitchTime: 0,
            hoverDir: 1,
            hoverX: CANVAS_WIDTH / 2,
            phase: 1,
            entryAnimation: true,
            entryProgress: 0,
            hitFlash: 0,
            isShooting: false
        });
    },

    update(gameTime) {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];

            if (enemy.entryAnimation) {
                enemy.entryProgress += 0.02;
                if (enemy.entryProgress >= 1) {
                    enemy.entryAnimation = false;
                }
            }

            // 更新击中闪烁
            if (enemy.hitFlash > 0) {
                enemy.hitFlash -= 0.05;
            }

            // 更新射击标记
            if (enemy.isShooting) {
                enemy.isShooting = false;
            }

            if (enemy.type === 'boss') {
                this.updateBoss(enemy);
            } else {
                enemy.y += enemy.speed;
                if (enemy.formationIndex !== undefined) {
                    enemy.x += Math.sin(gameTime * 2 + enemy.formationIndex) * 0.5;
                }
            }

            if (enemy.y > CANVAS_HEIGHT + 50) {
                this.enemies.splice(i, 1);
                if (enemy.type === 'boss') this.bossActive = false;
            }
        }
    },

    updateBoss(boss) {
        const typeDef = BOSS_TYPES[boss.bossType];
        if (boss.y < 80) {
            boss.y += boss.speed;
        } else {
            boss.hoverX += boss.hoverDir * 1.5;
            if (boss.hoverX < boss.width / 2 + 20 || boss.hoverX > CANVAS_WIDTH - boss.width / 2 - 20) {
                boss.hoverDir *= -1;
            }
            boss.x = boss.hoverX - boss.width / 2;
        }

        const hpRatio = boss.hp / boss.maxHp;
        const newPhase = hpRatio > 0.7 ? 1 : hpRatio > 0.4 ? 2 : hpRatio > 0.1 ? 3 : 4;
        if (newPhase !== boss.phase) {
            boss.phase = newPhase;
            boss.patternIndex = 0;
            boss.patternSwitchTime = Date.now();
            EffectSystem.addScreenShake(5);
        }
    },

    tryShoot(difficulty, player) {
        const now = Date.now();
        const diff = DIFFICULTY[difficulty];

        for (const enemy of this.enemies) {
            if (!enemy.canShoot) continue;

            if (enemy.type === 'boss') {
                this.tryBossShoot(enemy, player, diff, now, difficulty);
            } else {
                this.tryEnemyShoot(enemy, player, diff, now, difficulty);
            }
        }
    },

    tryEnemyShoot(enemy, player, diff, now, difficulty) {
        const typeDef = ENEMY_TYPES[enemy.type];
        if (now - enemy.lastShootTime < typeDef.shootInterval / diff.density) return;
        enemy.lastShootTime = now;
        enemy.isShooting = true;
        BulletSystem.fireEnemyBullet(enemy, player, difficulty);
    },

    tryBossShoot(boss, player, diff, now, difficulty) {
        const patterns = BulletSystem.getBossPatterns(boss.bossType, boss.phase, diff);
        const pat = patterns[boss.patternIndex];

        if (now - boss.patternSwitchTime > 5000) {
            boss.patternIndex = (boss.patternIndex + 1) % patterns.length;
            boss.patternSwitchTime = now;
        }

        if (!pat || now - boss.lastShootTime < pat.interval) return;
        boss.lastShootTime = now;
        boss.isShooting = true;
        BulletSystem.fireBossBullet(boss, player, difficulty);
    },

    damageEnemy(index, damage) {
        const enemy = this.enemies[index];
        if (!enemy) return false;

        enemy.hp -= damage;
        enemy.hitFlash = 0.5;

        if (enemy.hp <= 0) {
            return true;
        }
        return false;
    },

    removeEnemy(index) {
        const enemy = this.enemies[index];
        this.enemies.splice(index, 1);
        if (enemy.type === 'boss') this.bossActive = false;
        return enemy;
    },

    getEnemies() { return this.enemies; },
    isBossActive() { return this.bossActive; },
    getCurrentBossType() { return this.currentBossType; }
};
