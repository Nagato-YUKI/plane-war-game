let currentState = GAME_STATE.START;
let gameLoopId = null;
let score = 0;
let highScore = parseInt(localStorage.getItem('planeWarHighScore') || '0', 10);
let totalScore = parseInt(localStorage.getItem('planeWarTotalScore') || '0', 10);
let gameTime = 0;
let gameStartTime = 0;
let waveNumber = 1;
let bossActive = false;
let currentDifficulty = 'NORMAL';
let selectedSkin = localStorage.getItem('planeWarCurrentSkin') || 'default';
let selectedWeapon = localStorage.getItem('planeWarCurrentWeapon') || 'vulcan';

let playerBullets = [];
let lastBulletTime = 0;
let enemies = [];
let enemyBullets = [];
let lastEnemySpawnTime = 0;
let items = [];
let scorePopups = [];
let unlockNotifications = [];
let screenShake = { x: 0, y: 0, intensity: 0 };

let comboCount = 0;
let comboTimer = 0;
let comboMax = 0;
let grazeCount = 0;
let grazeTotal = 0;
let bossNoDamage = true;
let currentBossType = null;

// 武器持续时间系统
let weaponDurationTimer = 0;
let weaponDurationMax = 0;
let weaponLevelTimer = 0;

const player = {
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
    speedBoostLevel: 0
};

const keys = {};
let mouseControl = false;
let mouseX = 0;
let mouseY = 0;
let isMouseDown = false;
let touchControl = false;
let touchX = 0;
let touchY = 0;

function getHitbox(entity, ratio) {
    const w = entity.width * ratio;
    const h = entity.height * ratio;
    return {
        x: entity.x + (entity.width - w) / 2,
        y: entity.y + (entity.height - h) / 2,
        width: w,
        height: h
    };
}

function checkCollisionWithHitbox(e1, r1, e2, r2) {
    const h1 = getHitbox(e1, r1);
    const h2 = getHitbox(e2, r2);
    return (
        h1.x < h2.x + h2.width &&
        h1.x + h1.width > h2.x &&
        h1.y < h2.y + h2.height &&
        h1.y + h1.height > h2.y
    );
}

function checkGraze(player, bullet) {
    const playerHitbox = getHitbox(player, PLAYER_HITBOX_RATIO);
    const bulletHitbox = getHitbox(bullet, BULLET_HITBOX_RATIO);
    
    const grazeDistance = 20;
    const expandedPlayer = {
        x: playerHitbox.x - grazeDistance,
        y: playerHitbox.y - grazeDistance,
        width: playerHitbox.width + grazeDistance * 2,
        height: playerHitbox.height + grazeDistance * 2
    };
    
    const isNear = (
        expandedPlayer.x < bulletHitbox.x + bulletHitbox.width &&
        expandedPlayer.x + expandedPlayer.width > bulletHitbox.x &&
        expandedPlayer.y < bulletHitbox.y + bulletHitbox.height &&
        expandedPlayer.y + expandedPlayer.height > bulletHitbox.y
    );
    
    const isHit = checkCollisionWithHitbox(player, PLAYER_HITBOX_RATIO, bullet, BULLET_HITBOX_RATIO);
    
    return isNear && !isHit && !bullet.grazed;
}

function addCombo(amount) {
    comboCount += amount;
    comboTimer = 180;
    if (comboCount > comboMax) comboMax = comboCount;
}

function updateCombo() {
    if (comboTimer > 0) {
        comboTimer--;
    } else {
        comboCount = Math.max(0, comboCount - 5);
    }
}

function getComboMultiplier() {
    if (comboCount >= 100) return 5.0;
    if (comboCount >= 50) return 3.0;
    if (comboCount >= 30) return 2.0;
    if (comboCount >= 10) return 1.5;
    return 1.0;
}

function checkUnlocks(newTotal) {
    const uw = getUnlockedWeapons();
    const us = getUnlockedSkins();
    const newUnlocks = [];

    if (newTotal >= 300 && !uw.includes('laser')) {
        uw.push('laser');
        saveUnlockedWeapons(uw);
        newUnlocks.push('激光武器');
    }
    if (newTotal >= 800 && !uw.includes('missile')) {
        uw.push('missile');
        saveUnlockedWeapons(uw);
        newUnlocks.push('导弹武器');
    }
    if (newTotal >= 500 && !us.includes('flame')) {
        us.push('flame');
        saveUnlockedSkins(us);
        newUnlocks.push('烈焰战机皮肤');
    }
    if (newTotal >= 1500 && !us.includes('ice')) {
        us.push('ice');
        saveUnlockedSkins(us);
        newUnlocks.push('冰霜战机皮肤');
    }
    if (newTotal >= 3000 && !us.includes('shadow')) {
        us.push('shadow');
        saveUnlockedSkins(us);
        newUnlocks.push('暗影战机皮肤');
    }
    if (newTotal >= 5000 && !us.includes('holy')) {
        us.push('holy');
        saveUnlockedSkins(us);
        newUnlocks.push('圣光战机皮肤');
    }

    for (const name of newUnlocks) {
        unlockNotifications.push({
            text: `解锁: ${name}!`,
            life: 180,
            maxLife: 180
        });
    }
}

function checkAchievements() {
    const achievements = getAchievements();
    const newAchievements = [];

    if (grazeTotal >= 1000 && !achievements.grazeMaster) {
        achievements.grazeMaster = true;
        newAchievements.push(ACHIEVEMENTS.grazeMaster);
    }
    if (comboMax >= 100 && !achievements.comboKing) {
        achievements.comboKing = true;
        newAchievements.push(ACHIEVEMENTS.comboKing);
    }
    if (bossNoDamage && !achievements.noDamageBoss) {
        achievements.noDamageBoss = true;
        newAchievements.push(ACHIEVEMENTS.noDamageBoss);
    }
    if (currentDifficulty === 'LUNATIC' && !achievements.lunaticClear) {
        achievements.lunaticClear = true;
        newAchievements.push(ACHIEVEMENTS.lunaticClear);
    }

    if (newAchievements.length > 0) {
        saveAchievements(achievements);
        for (const ach of newAchievements) {
            unlockNotifications.push({
                text: `成就: ${ach.name}! +${ach.reward}分`,
                life: 240,
                maxLife: 240
            });
            score += ach.reward;
        }
    }
}

function addScreenShake(intensity) {
    screenShake.intensity = Math.max(screenShake.intensity, intensity);
}

function updateScreenShake() {
    if (screenShake.intensity > 0) {
        screenShake.x = (Math.random() - 0.5) * screenShake.intensity * 2;
        screenShake.y = (Math.random() - 0.5) * screenShake.intensity * 2;
        screenShake.intensity *= 0.9;
        if (screenShake.intensity < 0.5) {
            screenShake.intensity = 0;
            screenShake.x = 0;
            screenShake.y = 0;
        }
    }
}

function addScorePopup(x, y, value) {
    const mult = getComboMultiplier();
    const finalValue = Math.floor(value * mult * DIFFICULTY[currentDifficulty].scoreMult);
    scorePopups.push({ x, y, value: finalValue, life: 40, maxLife: 40, vy: -2 });
    return finalValue;
}

function updateScorePopups() {
    for (let i = scorePopups.length - 1; i >= 0; i--) {
        const p = scorePopups[i];
        p.y += p.vy;
        p.life--;
        if (p.life <= 0) scorePopups.splice(i, 1);
    }
}

function updateUnlockNotifications() {
    for (let i = unlockNotifications.length - 1; i >= 0; i--) {
        unlockNotifications[i].life--;
        if (unlockNotifications[i].life <= 0) {
            unlockNotifications.splice(i, 1);
        }
    }
}

function useBomb() {
    if (player.bombs <= 0 || currentState !== GAME_STATE.PLAYING) return;
    player.bombs--;
    addScreenShake(12);
    
    for (const enemy of enemies) {
        createExplosion(
            enemy.x + enemy.width / 2,
            enemy.y + enemy.height / 2,
            '#ff4444',
            '#ffaa00',
            15
        );
    }
    
    enemies = [];
    enemyBullets = [];
    bossActive = false;
    player.invincibleUntil = Date.now() + 3000;
    
    for (let i = 0; i < 30; i++) {
        createParticle(
            CANVAS_WIDTH / 2,
            CANVAS_HEIGHT / 2,
            (Math.random() - 0.5) * 15,
            (Math.random() - 0.5) * 15,
            '#ffffff',
            20,
            3
        );
    }
}

function updatePlayer() {
    let targetX = player.x;
    let targetY = player.y;
    let isMoving = false;

    if (touchControl) {
        targetX = touchX - player.width / 2;
        targetY = touchY - player.height / 2;
        isMoving = true;
    } else if (mouseControl) {
        targetX = mouseX - player.width / 2;
        targetY = mouseY - player.height / 2;
        isMoving = true;
    } else {
        if (keys['ArrowUp']) { targetY = player.y - player.speed; isMoving = true; }
        if (keys['ArrowDown']) { targetY = player.y + player.speed; isMoving = true; }
        if (keys['ArrowLeft']) { targetX = player.x - player.speed; isMoving = true; }
        if (keys['ArrowRight']) { targetX = player.x + player.speed; isMoving = true; }
    }

    const currentSpeed = Date.now() < player.speedBoostUntil 
        ? player.speed * (1 + player.speedBoostLevel * 0.2)
        : player.speed;

    if (isMoving && (mouseControl || touchControl)) {
        const dx = targetX - player.x;
        const dy = targetY - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 1) {
            const moveSpeed = Math.min(currentSpeed * 1.2, dist);
            player.x += (dx / dist) * moveSpeed;
            player.y += (dy / dist) * moveSpeed;
        }
    } else {
        player.x = targetX;
        player.y = targetY;
    }

    clampPlayerPosition();
}

function clampPlayerPosition() {
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > CANVAS_WIDTH) player.x = CANVAS_WIDTH - player.width;
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > CANVAS_HEIGHT) player.y = CANVAS_HEIGHT - player.height;
}

function tryFireBullet() {
    if (currentState !== GAME_STATE.PLAYING) return;
    const shouldFire = keys['Space'] || mouseControl || touchControl;
    if (!shouldFire) return;

    const now = Date.now();
    const wpn = WEAPONS[player.weapon];
    const level = wpn.levels[Math.min(player.weaponLevel - 1, wpn.levels.length - 1)];
    const interval = level.interval || 150;
    if (now - lastBulletTime < interval) return;

    lastBulletTime = now;

    if (player.weapon === 'laser') {
        playerBullets.push({
            x: player.x + player.width / 2,
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
            playerBullets.push({
                x: player.x + player.width / 2 + offset,
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
            playerBullets.push({
                x: player.x + player.width / 2,
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
}

function updateBullets() {
    for (let i = playerBullets.length - 1; i >= 0; i--) {
        const b = playerBullets[i];
        if (b.weaponType === 'laser') {
            b.life = (b.life || 3) - 1;
            if (b.life <= 0) playerBullets.splice(i, 1);
        } else if (b.weaponType === 'missile') {
            updateMissileBullet(b, i);
        } else {
            b.x += b.vx || 0;
            b.y += b.speed || -10;
            if (b.y + b.height < 0) playerBullets.splice(i, 1);
        }
    }
}

function updateMissileBullet(b, index) {
    let target = null;
    let minDist = Infinity;
    for (const enemy of enemies) {
        const dx = enemy.x + enemy.width / 2 - b.x;
        const dy = enemy.y + enemy.height / 2 - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDist) { minDist = dist; target = enemy; }
    }
    if (target) {
        const dx = target.x + target.width / 2 - b.x;
        const dy = target.y + target.height / 2 - b.y;
        const angle = Math.atan2(dy, dx);
        const speed = Math.abs(b.speed);
        b.vx = (b.vx || 0) * 0.9 + Math.cos(angle) * speed * 0.1;
        b.speed = b.speed * 0.9 + Math.sin(angle) * speed * 0.1;
    }
    b.x += b.vx || 0;
    b.y += b.speed || -6;
    if (b.y < -30 || b.y > CANVAS_HEIGHT + 30 || b.x < -30 || b.x > CANVAS_WIDTH + 30) {
        playerBullets.splice(index, 1);
    }
}

function spawnEnemy() {
    if (currentState !== GAME_STATE.PLAYING || bossActive) return;
    
    const diff = DIFFICULTY[currentDifficulty];
    const maxEnemies = Math.min(Math.floor(diff.enemyCount + waveNumber * 2), 30);
    if (enemies.length >= maxEnemies) return;

    const now = Date.now();
    const spawnInterval = Math.max(150, 600 - waveNumber * 30);
    if (now - lastEnemySpawnTime < spawnInterval) return;
    lastEnemySpawnTime = now;

    const isBossWave = waveNumber % 5 === 0 && waveNumber > 0;
    if (isBossWave && !bossActive) {
        spawnBoss();
        return;
    }

    // 弹幕阵型生成
    const formationType = Math.random();
    if (formationType < 0.3 && waveNumber >= 2) {
        spawnFormation();
    } else {
        spawnSingleEnemy();
    }
}

function spawnSingleEnemy() {
    const rand = Math.random();
    let type = 'drone';
    if (waveNumber >= 3 && rand < 0.2) type = 'bomber';
    else if (waveNumber >= 2 && rand < 0.4) type = 'fighter';
    else if (waveNumber >= 4 && rand < 0.5) type = 'elite';

    const typeDef = ENEMY_TYPES[type];
    const x = Math.random() * (CANVAS_WIDTH - typeDef.width);
    
    enemies.push({
        x,
        y: -typeDef.height,
        width: typeDef.width,
        height: typeDef.height,
        type,
        hp: Math.floor(typeDef.hp * DIFFICULTY[currentDifficulty].hpMult),
        maxHp: Math.floor(typeDef.hp * DIFFICULTY[currentDifficulty].hpMult),
        speed: typeDef.speedBase + Math.random() * typeDef.speedVar,
        canShoot: typeDef.canShoot,
        lastShootTime: 0,
        shootPattern: 0,
        entryAnimation: true,
        entryProgress: 0
    });
}

function spawnFormation() {
    const types = ['drone', 'fighter', 'elite'];
    const type = types[Math.floor(Math.random() * Math.min(types.length, waveNumber))];
    const typeDef = ENEMY_TYPES[type];
    const count = Math.min(3 + Math.floor(waveNumber / 2), 8);
    const startX = Math.random() * (CANVAS_WIDTH - count * typeDef.width);
    
    for (let i = 0; i < count; i++) {
        enemies.push({
            x: startX + i * (typeDef.width + 10),
            y: -typeDef.height - Math.random() * 50,
            width: typeDef.width,
            height: typeDef.height,
            type,
            hp: Math.floor(typeDef.hp * DIFFICULTY[currentDifficulty].hpMult),
            maxHp: Math.floor(typeDef.hp * DIFFICULTY[currentDifficulty].hpMult),
            speed: typeDef.speedBase,
            canShoot: typeDef.canShoot,
            lastShootTime: 0,
            shootPattern: 0,
            entryAnimation: true,
            entryProgress: 0,
            formationIndex: i,
            formationCount: count
        });
    }
}

function spawnBoss() {
    bossActive = true;
    bossNoDamage = true;
    currentBossType = waveNumber % 10 === 5 ? 'mech' : 'bio';
    const typeDef = BOSS_TYPES[currentBossType];
    const diff = DIFFICULTY[currentDifficulty];
    const hp = Math.floor(typeDef.hp * diff.hpMult * Math.pow(1.3, Math.floor((waveNumber - 1) / 5)));
    
    enemies.push({
        x: CANVAS_WIDTH / 2 - typeDef.width / 2,
        y: -typeDef.height,
        width: typeDef.width,
        height: typeDef.height,
        type: 'boss',
        bossType: currentBossType,
        hp,
        maxHp: hp,
        speed: typeDef.speedBase,
        canShoot: true,
        lastShootTime: 0,
        patternIndex: 0,
        patternSwitchTime: 0,
        hoverDir: 1,
        hoverX: CANVAS_WIDTH / 2,
        phase: 1,
        entryAnimation: true,
        entryProgress: 0
    });
}

function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        
        // 入场动画
        if (enemy.entryAnimation) {
            enemy.entryProgress += 0.02;
            if (enemy.entryProgress >= 1) {
                enemy.entryAnimation = false;
            }
        }
        
        if (enemy.type === 'boss') {
            updateBossMovement(enemy);
        } else {
            enemy.y += enemy.speed;
            // 阵型移动
            if (enemy.formationIndex !== undefined) {
                enemy.x += Math.sin(gameTime * 2 + enemy.formationIndex) * 0.5;
            }
        }
        if (enemy.y > CANVAS_HEIGHT + 50) {
            enemies.splice(i, 1);
            if (enemy.type === 'boss') bossActive = false;
        }
    }
}

function updateBossMovement(enemy) {
    const typeDef = BOSS_TYPES[enemy.bossType];
    if (enemy.y < 80) {
        enemy.y += enemy.speed;
    } else {
        enemy.hoverX += enemy.hoverDir * 1.5;
        if (enemy.hoverX < enemy.width / 2 + 20 || enemy.hoverX > CANVAS_WIDTH - enemy.width / 2 - 20) {
            enemy.hoverDir *= -1;
        }
        enemy.x = enemy.hoverX - enemy.width / 2;
    }
    
    const hpRatio = enemy.hp / enemy.maxHp;
    const newPhase = hpRatio > 0.7 ? 1 : hpRatio > 0.4 ? 2 : hpRatio > 0.1 ? 3 : 4;
    if (newPhase !== enemy.phase) {
        enemy.phase = newPhase;
        enemy.patternIndex = 0;
        enemy.patternSwitchTime = Date.now();
        // 阶段转换时增加弹幕密度
        addScreenShake(5);
    }
}

function tryEnemyShoot() {
    const now = Date.now();
    const diff = DIFFICULTY[currentDifficulty];
    
    for (const enemy of enemies) {
        if (!enemy.canShoot) continue;
        if (enemy.type === 'boss') {
            tryBossShoot(enemy, now, diff);
        } else {
            tryRegularEnemyShoot(enemy, now, diff);
        }
    }
}

function tryBossShoot(enemy, now, diff) {
    const typeDef = BOSS_TYPES[enemy.bossType];
    if (now - enemy.patternSwitchTime > 6000) {
        enemy.patternIndex = (enemy.patternIndex + 1) % 3;
        enemy.patternSwitchTime = now;
    }
    
    const patterns = getBossPatterns(enemy.bossType, enemy.phase, diff);
    const pat = patterns[enemy.patternIndex];
    if (!pat || now - enemy.lastShootTime < pat.interval) return;
    enemy.lastShootTime = now;

    const cx = enemy.x + enemy.width / 2;
    const cy = enemy.y + enemy.height;
    
    for (let i = 0; i < pat.count; i++) {
        let angle;
        if (pat.aimPlayer) {
            const dx = player.x + player.width / 2 - cx;
            const dy = player.y + player.height / 2 - cy;
            angle = Math.atan2(dy, dx);
        } else {
            angle = pat.baseAngle + (i / pat.count) * Math.PI * 2;
        }
        
        if (pat.spread && pat.count > 1) {
            angle += (i / (pat.count - 1) - 0.5) * pat.spread;
        }
        
        enemyBullets.push({
            x: cx,
            y: cy,
            width: pat.width || 6,
            height: pat.height || 6,
            vx: Math.cos(angle) * pat.speed,
            vy: Math.sin(angle) * pat.speed,
            color: pat.color || '#ff0044',
            grazed: false,
            trail: []
        });
    }
}

function getBossPatterns(bossType, phase, diff) {
    const s = diff.bulletSpeed;
    const density = diff.density;
    if (bossType === 'mech') {
        if (phase === 1) return [
            { count: Math.floor(8 * density), speed: 3 * s, interval: 2000, aimPlayer: false, baseAngle: 0, width: 6, height: 6, color: '#ff4444' },
            { count: Math.floor(2 * density), speed: 5 * s, interval: 1500, aimPlayer: true, width: 6, height: 6, color: '#ff8844' },
            { count: Math.floor(4 * density), speed: 4 * s, interval: 1800, aimPlayer: false, baseAngle: Math.PI / 4, width: 6, height: 6, color: '#ff4444' }
        ];
        if (phase === 2) return [
            { count: Math.floor(12 * density), speed: 3.5 * s, interval: 1800, aimPlayer: false, baseAngle: 0, width: 5, height: 5, color: '#ff6644' },
            { count: Math.floor(4 * density), speed: 5 * s, interval: 2000, aimPlayer: true, spread: Math.PI / 6, width: 5, height: 5, color: '#ffaa44' },
            { count: Math.floor(6 * density), speed: 4 * s, interval: 1500, aimPlayer: false, baseAngle: Math.PI / 6, width: 5, height: 5, color: '#ff6644' }
        ];
        if (phase === 3) return [
            { count: Math.floor(16 * density), speed: 4 * s, interval: 1500, aimPlayer: false, baseAngle: 0, width: 5, height: 5, color: '#ff4444' },
            { count: Math.floor(6 * density), speed: 6 * s, interval: 1200, aimPlayer: true, spread: Math.PI / 4, width: 5, height: 5, color: '#ff8844' },
            { count: Math.floor(8 * density), speed: 3 * s, interval: 1000, aimPlayer: false, baseAngle: Math.PI / 8, width: 5, height: 5, color: '#ff4444' }
        ];
        return [
            { count: Math.floor(20 * density), speed: 5 * s, interval: 1200, aimPlayer: false, baseAngle: 0, width: 4, height: 4, color: '#ff0000' },
            { count: Math.floor(8 * density), speed: 7 * s, interval: 1000, aimPlayer: true, spread: Math.PI / 3, width: 4, height: 4, color: '#ff4400' },
            { count: Math.floor(12 * density), speed: 4 * s, interval: 800, aimPlayer: false, baseAngle: Math.PI / 12, width: 4, height: 4, color: '#ff0000' }
        ];
    } else {
        if (phase === 1) return [
            { count: Math.floor(6 * density), speed: 3 * s, interval: 2000, aimPlayer: false, baseAngle: 0, width: 6, height: 6, color: '#44ff44' },
            { count: Math.floor(2 * density), speed: 4 * s, interval: 2500, aimPlayer: true, width: 6, height: 6, color: '#88ff44' },
            { count: Math.floor(4 * density), speed: 3.5 * s, interval: 1800, aimPlayer: false, baseAngle: Math.PI / 4, width: 6, height: 6, color: '#44ff44' }
        ];
        if (phase === 2) return [
            { count: Math.floor(10 * density), speed: 3.5 * s, interval: 1800, aimPlayer: false, baseAngle: 0, width: 5, height: 5, color: '#66ff66' },
            { count: Math.floor(4 * density), speed: 5 * s, interval: 2000, aimPlayer: true, spread: Math.PI / 6, width: 5, height: 5, color: '#aaff66' },
            { count: Math.floor(6 * density), speed: 4 * s, interval: 1500, aimPlayer: false, baseAngle: Math.PI / 6, width: 5, height: 5, color: '#66ff66' }
        ];
        if (phase === 3) return [
            { count: Math.floor(14 * density), speed: 4 * s, interval: 1500, aimPlayer: false, baseAngle: 0, width: 5, height: 5, color: '#44ff44' },
            { count: Math.floor(6 * density), speed: 6 * s, interval: 1200, aimPlayer: true, spread: Math.PI / 4, width: 5, height: 5, color: '#88ff44' },
            { count: Math.floor(8 * density), speed: 3.5 * s, interval: 1000, aimPlayer: false, baseAngle: Math.PI / 8, width: 5, height: 5, color: '#44ff44' }
        ];
        return [
            { count: Math.floor(18 * density), speed: 5 * s, interval: 1200, aimPlayer: false, baseAngle: 0, width: 4, height: 4, color: '#00ff00' },
            { count: Math.floor(8 * density), speed: 7 * s, interval: 1000, aimPlayer: true, spread: Math.PI / 3, width: 4, height: 4, color: '#44ff00' },
            { count: Math.floor(12 * density), speed: 4 * s, interval: 800, aimPlayer: false, baseAngle: Math.PI / 12, width: 4, height: 4, color: '#00ff00' }
        ];
    }
}

function tryRegularEnemyShoot(enemy, now, diff) {
    const typeDef = ENEMY_TYPES[enemy.type];
    if (now - enemy.lastShootTime < typeDef.shootInterval / diff.density) return;
    enemy.lastShootTime = now;

    const cx = enemy.x + enemy.width / 2;
    const cy = enemy.y + enemy.height;
    
    if (enemy.type === 'drone') {
        const dx = player.x + player.width / 2 - cx;
        const dy = player.y + player.height / 2 - cy;
        const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
        enemyBullets.push({
            x: cx, y: cy,
            width: 5, height: 8,
            vx: (dx / dist) * typeDef.bulletSpeed * diff.bulletSpeed * 0.5,
            vy: typeDef.bulletSpeed * diff.bulletSpeed,
            color: '#ff4444', grazed: false, trail: []
        });
    } else if (enemy.type === 'fighter') {
        for (let i = -1; i <= 1; i++) {
            const angle = Math.PI / 2 + i * 0.3;
            enemyBullets.push({
                x: cx, y: cy,
                width: 5, height: 8,
                vx: Math.cos(angle) * typeDef.bulletSpeed * diff.bulletSpeed,
                vy: Math.sin(angle) * typeDef.bulletSpeed * diff.bulletSpeed,
                color: '#ff8844', grazed: false, trail: []
            });
        }
    } else if (enemy.type === 'bomber') {
        const count = typeDef.bulletCount;
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            enemyBullets.push({
                x: cx, y: cy,
                width: 6, height: 6,
                vx: Math.cos(angle) * typeDef.bulletSpeed * diff.bulletSpeed,
                vy: Math.sin(angle) * typeDef.bulletSpeed * diff.bulletSpeed,
                color: '#ff66ff', grazed: false, trail: []
            });
        }
    } else if (enemy.type === 'elite') {
        const dx = player.x + player.width / 2 - cx;
        const dy = player.y + player.height / 2 - cy;
        const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
        for (let i = 0; i < 3; i++) {
            enemyBullets.push({
                x: cx, y: cy,
                width: 5, height: 5,
                vx: (dx / dist) * typeDef.bulletSpeed * diff.bulletSpeed * (0.8 + i * 0.2),
                vy: (dy / dist) * typeDef.bulletSpeed * diff.bulletSpeed * (0.8 + i * 0.2),
                color: '#ff44ff', grazed: false, trail: []
            });
        }
    }
}

function updateEnemyBullets() {
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const b = enemyBullets[i];
        b.x += b.vx || 0;
        b.y += b.vy || 4;
        
        // 子弹拖尾效果
        if (!b.trail) b.trail = [];
        b.trail.push({ x: b.x, y: b.y });
        if (b.trail.length > 5) b.trail.shift();
        
        if (b.y > CANVAS_HEIGHT + 20 || b.x < -20 || b.x > CANVAS_WIDTH + 20 || b.y < -20) {
            enemyBullets.splice(i, 1);
        }
    }
}

function checkGrazeBullets() {
    for (const bullet of enemyBullets) {
        if (checkGraze(player, bullet)) {
            bullet.grazed = true;
            grazeCount++;
            grazeTotal++;
            addCombo(0.1);
            createParticle(
                bullet.x, bullet.y,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
                '#ffffff',
                10, 2
            );
        }
    }
}

function dropItems(enemy) {
    for (const [itemType, config] of Object.entries(ITEM_TYPES)) {
        const rate = config.dropRates[enemy.type] || 0;
        if (Math.random() < rate) {
            items.push({
                x: enemy.x + enemy.width / 2 - config.size / 2,
                y: enemy.y + enemy.height / 2 - config.size / 2,
                width: config.size,
                height: config.size,
                itemType,
                speed: 2,
                duration: config.duration || 0
            });
        }
    }
}

function updateItems() {
    for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        item.y += item.speed;
        if (item.y > CANVAS_HEIGHT + 30) {
            items.splice(i, 1);
            continue;
        }
        if (checkCollisionWithHitbox(player, PLAYER_HITBOX_RATIO, item, ITEM_HITBOX_RATIO)) {
            applyItemEffect(item.itemType);
            items.splice(i, 1);
        }
    }
}

function applyItemEffect(itemType) {
    const config = ITEM_TYPES[itemType];
    if (config.effect === 'weaponLevelUp') {
        if (player.weaponLevel < WEAPONS[player.weapon].maxLevel) {
            player.weaponLevel++;
            // 设置武器持续时间
            const duration = Math.max(WEAPON_MIN_DURATION, WEAPON_DURATION - (player.weaponLevel - 1) * WEAPON_DURATION_PER_LEVEL);
            weaponDurationMax = duration;
            weaponDurationTimer = duration;
        }
        addCombo(5);
    } else if (config.effect === 'switchWeapon') {
        const unlocked = getUnlockedWeapons();
        const weaponIds = Object.keys(WEAPONS);
        const currentIdx = weaponIds.indexOf(player.weapon);
        for (let i = 1; i < weaponIds.length; i++) {
            const nextIdx = (currentIdx + i) % weaponIds.length;
            if (unlocked.includes(weaponIds[nextIdx])) {
                player.weapon = weaponIds[nextIdx];
                player.weaponLevel = Math.max(1, player.weaponLevel - 1);
                // 设置新武器持续时间
                const duration = WEAPONS[player.weapon].duration || WEAPON_DURATION;
                weaponDurationMax = duration;
                weaponDurationTimer = duration;
                break;
            }
        }
        addCombo(3);
    } else if (config.effect === 'speedUp') {
        player.speedBoostUntil = Date.now() + config.duration;
        player.speedBoostLevel = Math.min(player.speedBoostLevel + 1, 2);
        addCombo(2);
    } else if (config.effect === 'addBomb') {
        if (player.bombs < PLAYER_MAX_BOMBS) player.bombs++;
        addCombo(2);
    } else if (config.effect === 'addLife') {
        if (player.lives < 8) player.lives++;
        addCombo(10);
    }
}

// 更新武器持续时间
function updateWeaponDuration() {
    if (weaponDurationTimer > 0) {
        weaponDurationTimer -= 16; // 约60fps
        if (weaponDurationTimer <= 0) {
            // 武器等级下降
            if (player.weaponLevel > 1) {
                player.weaponLevel--;
                const duration = Math.max(WEAPON_MIN_DURATION, WEAPON_DURATION - (player.weaponLevel - 1) * WEAPON_DURATION_PER_LEVEL);
                weaponDurationMax = duration;
                weaponDurationTimer = duration;
            }
        }
    }
}

function checkBulletEnemyCollisions() {
    for (let i = playerBullets.length - 1; i >= 0; i--) {
        const bullet = playerBullets[i];
        let hit = false;
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            if (bullet.weaponType === 'laser') {
                checkLaserCollision(bullet, enemy, j);
            } else {
                hit = checkRegularBulletCollision(bullet, enemy, i, j);
                if (hit) break;
            }
        }
        if (hit) break;
    }
}

function checkLaserCollision(bullet, enemy, enemyIndex) {
    const laserX = bullet.x - bullet.width / 2;
    const laserRight = bullet.x + bullet.width / 2;
    if (laserRight > enemy.x && laserX < enemy.x + enemy.width && bullet.y > enemy.y) {
        enemy.hp -= bullet.damage || 2;
        if (enemy.hp <= 0) destroyEnemy(enemy, enemyIndex);
    }
}

function checkRegularBulletCollision(bullet, enemy, bulletIndex, enemyIndex) {
    const bulletRect = {
        x: bullet.x - bullet.width / 2,
        y: bullet.y,
        width: bullet.width,
        height: bullet.height
    };
    if (checkCollisionWithHitbox(bulletRect, BULLET_HITBOX_RATIO, enemy, ENEMY_HITBOX_RATIO)) {
        enemy.hp -= bullet.damage || 1;
        playerBullets.splice(bulletIndex, 1);
        if (enemy.hp <= 0) destroyEnemy(enemy, enemyIndex);
        return true;
    }
    return false;
}

function destroyEnemy(enemy, index) {
    const ex = enemy.x + enemy.width / 2;
    const ey = enemy.y + enemy.height / 2;
    
    if (enemy.type === 'boss') {
        const typeDef = BOSS_TYPES[enemy.bossType];
        createExplosion(ex, ey, typeDef.colors.glow, typeDef.colors.core, 50);
        addScreenShake(15);
        const scoreValue = addScorePopup(ex, ey - 10, typeDef.score);
        score += scoreValue;
        checkAchievements();
        bossActive = false;
    } else {
        const typeDef = ENEMY_TYPES[enemy.type];
        createExplosion(ex, ey, typeDef.colors.glow, typeDef.colors.core, enemy.type === 'bomber' ? 30 : 15);
        addScreenShake(enemy.type === 'bomber' ? 5 : 2);
        const scoreValue = addScorePopup(ex, ey - 10, typeDef.score);
        score += scoreValue;
        addCombo(1);
    }
    
    dropItems(enemy);
    enemies.splice(index, 1);
}

function checkPlayerCollisions() {
    const isInvincible = Date.now() < player.invincibleUntil;
    const hasShield = Date.now() < player.shieldUntil;
    if (isInvincible || hasShield) return;

    for (const enemy of enemies) {
        if (checkCollisionWithHitbox(player, PLAYER_HITBOX_RATIO, enemy, ENEMY_HITBOX_RATIO)) {
            playerHit();
            return;
        }
    }
    for (const bullet of enemyBullets) {
        const bulletRect = {
            x: bullet.x - bullet.width / 2,
            y: bullet.y,
            width: bullet.width,
            height: bullet.height
        };
        if (checkCollisionWithHitbox(player, PLAYER_HITBOX_RATIO, bulletRect, BULLET_HITBOX_RATIO)) {
            playerHit();
            return;
        }
    }
}

function playerHit() {
    player.lives--;
    bossNoDamage = false;
    createExplosion(
        player.x + player.width / 2,
        player.y + player.height / 2,
        '#00ffff', '#ffffff', 30
    );
    addScreenShake(8);
    
    if (player.lives <= 0) {
        gameOver();
    } else {
        player.invincibleUntil = Date.now() + PLAYER_INVINCIBLE_MS;
        player.weaponLevel = Math.max(1, player.weaponLevel - 2);
        comboCount = 0;
    }
}

function gameOver() {
    currentState = GAME_STATE.GAME_OVER;
    const finalScore = Math.floor(score);
    if (finalScore > highScore) {
        highScore = finalScore;
        localStorage.setItem('planeWarHighScore', highScore.toString());
    }
    totalScore += finalScore;
    localStorage.setItem('planeWarTotalScore', totalScore.toString());
    checkUnlocks(totalScore);
    checkAchievements();
}

function updateGame() {
    gameTime = (Date.now() - gameStartTime) / 1000;
    if (!bossActive && gameTime > waveNumber * 30) waveNumber++;
    
    updatePlayer();
    updateBullets();
    tryFireBullet();
    spawnEnemy();
    updateEnemies();
    tryEnemyShoot();
    updateEnemyBullets();
    checkGrazeBullets();
    updateItems();
    updateWeaponDuration();
    checkBulletEnemyCollisions();
    checkPlayerCollisions();
    updateParticles();
    updateScorePopups();
    updateUnlockNotifications();
    updateScreenShake();
    updateCombo();
    
    score += 10 / 60;
}

function selectSkin(skinId) {
    if (getUnlockedSkins().includes(skinId)) {
        selectedSkin = skinId;
        localStorage.setItem('planeWarCurrentSkin', skinId);
    }
}

function selectWeapon(weaponId) {
    if (getUnlockedWeapons().includes(weaponId)) {
        selectedWeapon = weaponId;
        localStorage.setItem('planeWarCurrentWeapon', weaponId);
    }
}

function selectDifficulty(diff) {
    if (DIFFICULTY[diff]) {
        currentDifficulty = diff;
    }
}
