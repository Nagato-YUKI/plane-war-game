const BulletSystem = {
    playerBullets: [],
    enemyBullets: [],

    init() {
        this.playerBullets = [];
        this.enemyBullets = [];
    },

    firePlayerBullet(player, selectedWeapon) {
        const now = Date.now();
        const wpn = WEAPONS[player.weapon];
        const level = wpn.levels[Math.min(player.weaponLevel - 1, wpn.levels.length - 1)];
        const interval = level.interval || 150;

        if (now - player.lastBulletTime < interval) return;
        player.lastBulletTime = now;

        if (player.weapon === 'laser') {
            this.playerBullets.push({
                x: player.getCenterX(),
                y: player.y,
                width: level.width || 6,
                height: CANVAS_HEIGHT,
                weaponType: 'laser',
                damage: level.damage || 2,
                speed: 0,
                life: 3
            });
        } else if (player.weapon === 'missile') {
            for (let i = 0; i < (level.count || 1); i++) {
                const offset = (i - (level.count - 1) / 2) * 12;
                this.playerBullets.push({
                    x: player.getCenterX() + offset,
                    y: player.y,
                    width: 8,
                    height: 16,
                    weaponType: 'missile',
                    speed: -(level.speed || 6),
                    vx: 0,
                    damage: level.damage || 4
                });
            }
        } else {
            const count = level.count || 1;
            const spread = (level.spread || 0) * (Math.PI / 180);
            for (let i = 0; i < count; i++) {
                const angle = count === 1 ? 0 : (i / (count - 1) - 0.5) * spread * 2;
                this.playerBullets.push({
                    x: player.getCenterX(),
                    y: player.y,
                    width: 6,
                    height: 14,
                    weaponType: 'vulcan',
                    speed: -(level.speed || 10),
                    vx: Math.sin(angle) * (level.speed || 10),
                    damage: level.damage || 1
                });
            }
        }
    },

    fireEnemyBullet(enemy, player, difficulty) {
        const typeDef = ENEMY_TYPES[enemy.type];
        const cx = enemy.x + enemy.width / 2;
        const cy = enemy.y + enemy.height;
        const s = DIFFICULTY[difficulty].bulletSpeed;

        if (enemy.type === 'drone') {
            const angle = MathUtils.angleTo(cx, cy, player.getCenterX(), player.getCenterY());
            this.enemyBullets.push({
                x: cx, y: cy,
                width: 5, height: 8,
                vx: Math.cos(angle) * typeDef.bulletSpeed * s * 0.5,
                vy: Math.sin(angle) * typeDef.bulletSpeed * s,
                color: '#ff4444', grazed: false, trail: []
            });
        } else if (enemy.type === 'fighter') {
            for (let i = -1; i <= 1; i++) {
                const angle = Math.PI / 2 + i * 0.3;
                this.enemyBullets.push({
                    x: cx, y: cy,
                    width: 5, height: 8,
                    vx: Math.cos(angle) * typeDef.bulletSpeed * s,
                    vy: Math.sin(angle) * typeDef.bulletSpeed * s,
                    color: '#ff8844', grazed: false, trail: []
                });
            }
        } else if (enemy.type === 'bomber') {
            const count = typeDef.bulletCount;
            for (let i = 0; i < count; i++) {
                const angle = (i / count) * Math.PI * 2;
                this.enemyBullets.push({
                    x: cx, y: cy,
                    width: 6, height: 6,
                    vx: Math.cos(angle) * typeDef.bulletSpeed * s,
                    vy: Math.sin(angle) * typeDef.bulletSpeed * s,
                    color: '#ff66ff', grazed: false, trail: []
                });
            }
        } else if (enemy.type === 'elite') {
            const angle = MathUtils.angleTo(cx, cy, player.getCenterX(), player.getCenterY());
            for (let i = 0; i < 3; i++) {
                const speed = typeDef.bulletSpeed * s * (0.8 + i * 0.2);
                this.enemyBullets.push({
                    x: cx, y: cy,
                    width: 5, height: 5,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    color: '#ff44ff', grazed: false, trail: []
                });
            }
        }
    },

    fireBossBullet(boss, player, difficulty) {
        const patterns = this.getBossPatterns(boss.bossType, boss.phase, difficulty);
        const pat = patterns[boss.patternIndex];
        if (!pat) return;

        const cx = boss.x + boss.width / 2;
        const cy = boss.y + boss.height;

        for (let i = 0; i < pat.count; i++) {
            let angle;
            if (pat.aimPlayer) {
                angle = MathUtils.angleTo(cx, cy, player.getCenterX(), player.getCenterY());
            } else {
                angle = pat.baseAngle + (i / pat.count) * Math.PI * 2;
            }

            if (pat.spread && pat.count > 1) {
                angle += (i / (pat.count - 1) - 0.5) * pat.spread;
            }

            this.enemyBullets.push({
                x: cx, y: cy,
                width: pat.width || 6,
                height: pat.height || 6,
                vx: Math.cos(angle) * pat.speed,
                vy: Math.sin(angle) * pat.speed,
                color: pat.color || '#ff0044',
                grazed: false,
                trail: []
            });
        }
    },

    getBossPatterns(bossType, phase, difficulty) {
        const s = difficulty.bulletSpeed;
        const d = difficulty.density;

        if (bossType === 'mech') {
            const patterns = [
                { count: Math.floor(8 * d), speed: 3 * s, interval: 2000, aimPlayer: false, baseAngle: 0, width: 6, height: 6, color: '#ff4444' },
                { count: Math.floor(3 * d), speed: 5 * s, interval: 1500, aimPlayer: true, width: 6, height: 6, color: '#ff8844' },
                { count: Math.floor(6 * d), speed: 4 * s, interval: 1800, aimPlayer: false, baseAngle: Math.PI / 4, width: 6, height: 6, color: '#ff4444' }
            ];

            if (phase >= 2) {
                patterns[0].count = Math.floor(12 * d);
                patterns[0].speed = 3.5 * s;
                patterns[1].count = Math.floor(5 * d);
                patterns[1].spread = Math.PI / 6;
            }
            if (phase >= 3) {
                patterns[0].count = Math.floor(16 * d);
                patterns[0].speed = 4 * s;
                patterns[2].count = Math.floor(10 * d);
            }
            if (phase >= 4) {
                patterns[0].count = Math.floor(24 * d);
                patterns[0].speed = 5 * s;
                patterns[1].count = Math.floor(8 * d);
                patterns[1].speed = 7 * s;
            }
            return patterns;
        } else {
            const patterns = [
                { count: Math.floor(6 * d), speed: 3 * s, interval: 2000, aimPlayer: false, baseAngle: 0, width: 6, height: 6, color: '#44ff44' },
                { count: Math.floor(3 * d), speed: 4 * s, interval: 2500, aimPlayer: true, width: 6, height: 6, color: '#88ff44' },
                { count: Math.floor(6 * d), speed: 3.5 * s, interval: 1800, aimPlayer: false, baseAngle: Math.PI / 4, width: 6, height: 6, color: '#44ff44' }
            ];

            if (phase >= 2) {
                patterns[0].count = Math.floor(10 * d);
                patterns[0].speed = 3.5 * s;
            }
            if (phase >= 3) {
                patterns[0].count = Math.floor(16 * d);
                patterns[0].speed = 4 * s;
            }
            if (phase >= 4) {
                patterns[0].count = Math.floor(24 * d);
                patterns[0].speed = 5 * s;
            }
            return patterns;
        }
    },

    updatePlayerBullets() {
        for (let i = this.playerBullets.length - 1; i >= 0; i--) {
            const b = this.playerBullets[i];
            if (b.weaponType === 'laser') {
                b.life = (b.life || 3) - 1;
                if (b.life <= 0) this.playerBullets.splice(i, 1);
            } else if (b.weaponType === 'missile') {
                this.updateMissile(b, i);
            } else {
                b.x += b.vx || 0;
                b.y += b.speed || -10;
                if (b.y + b.height < 0) this.playerBullets.splice(i, 1);
            }
        }
    },

    updateMissile(bullet, index) {
        let target = null;
        let minDist = Infinity;

        for (const enemy of EnemyManager.enemies) {
            const dist = MathUtils.distance(
                bullet.x, bullet.y,
                enemy.x + enemy.width / 2, enemy.y + enemy.height / 2
            );
            if (dist < minDist) {
                minDist = dist;
                target = enemy;
            }
        }

        if (target) {
            const angle = MathUtils.angleTo(
                bullet.x, bullet.y,
                target.x + target.width / 2, target.y + target.height / 2
            );
            const speed = Math.abs(bullet.speed);
            bullet.vx = (bullet.vx || 0) * 0.9 + Math.cos(angle) * speed * 0.1;
            bullet.speed = bullet.speed * 0.9 + Math.sin(angle) * speed * 0.1;
        }

        bullet.x += bullet.vx || 0;
        bullet.y += bullet.speed || -6;

        if (bullet.y < -30 || bullet.y > CANVAS_HEIGHT + 30 ||
            bullet.x < -30 || bullet.x > CANVAS_WIDTH + 30) {
            this.playerBullets.splice(index, 1);
        }
    },

    updateEnemyBullets() {
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            const b = this.enemyBullets[i];
            b.x += b.vx || 0;
            b.y += b.vy || 4;

            if (!b.trail) b.trail = [];
            b.trail.push({ x: b.x, y: b.y });
            if (b.trail.length > 8) b.trail.shift();

            if (b.y > CANVAS_HEIGHT + 20 || b.x < -20 || b.x > CANVAS_WIDTH + 20 || b.y < -20) {
                this.enemyBullets.splice(i, 1);
            }
        }
    },

    update() {
        this.updatePlayerBullets();
        this.updateEnemyBullets();
    },

    getPlayerBullets() { return this.playerBullets; },
    getEnemyBullets() { return this.enemyBullets; }
};
