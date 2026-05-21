let currentState = GAME_STATE.START;
let gameLoopId = null;
let score = 0;
let highScore = parseInt(localStorage.getItem('planeWarHighScore') || '0', 10);
let totalScore = parseInt(localStorage.getItem('planeWarTotalScore') || '0', 10);
let gameTime = 0;
let gameStartTime = 0;
let waveNumber = 1;
let bossActive = false;

let playerBullets = [];
let lastBulletTime = 0;
let enemies = [];
let enemyBullets = [];
let lastEnemySpawnTime = 0;
let items = [];
let scorePopups = [];
let unlockNotifications = [];
let screenShake = { x: 0, y: 0, intensity: 0 };

let selectedSkin = localStorage.getItem('planeWarCurrentSkin') || 'default';
let selectedWeapon = localStorage.getItem('planeWarCurrentWeapon') || 'vulcan';

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
    weaponLevel: 1
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

function checkCollisionRect(r1, r2) {
    return (
        r1.x < r2.x + r2.width &&
        r1.x + r1.width > r2.x &&
        r1.y < r2.y + r2.height &&
        r1.y + r1.height > r2.y
    );
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
    if (newTotal >= 1500 && !uw.includes('plasma')) {
        uw.push('plasma');
        saveUnlockedWeapons(uw);
        newUnlocks.push('等离子武器');
    }
    if (newTotal >= 500 && !us.includes('stealth')) {
        us.push('stealth');
        saveUnlockedSkins(us);
        newUnlocks.push('隐身战机皮肤');
    }
    if (newTotal >= 1000 && !us.includes('fighter')) {
        us.push('fighter');
        saveUnlockedSkins(us);
        newUnlocks.push('战斗机皮肤');
    }
    if (newTotal >= 2000 && !us.includes('gold')) {
        us.push('gold');
        saveUnlockedSkins(us);
        newUnlocks.push('黄金战机皮肤');
    }

    for (const name of newUnlocks) {
        unlockNotifications.push({
            text: `解锁: ${name}!`,
            life: 180,
            maxLife: 180
        });
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
    scorePopups.push({ x, y, value, life: 40, maxLife: 40, vy: -2 });
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
        if (keys['ArrowUp']) {
            targetY = player.y - player.speed;
            isMoving = true;
        }
        if (keys['ArrowDown']) {
            targetY = player.y + player.speed;
            isMoving = true;
        }
        if (keys['ArrowLeft']) {
            targetX = player.x - player.speed;
            isMoving = true;
        }
        if (keys['ArrowRight']) {
            targetX = player.x + player.speed;
            isMoving = true;
        }
    }

    if (isMoving && (mouseControl || touchControl)) {
        const dx = targetX - player.x;
        const dy = targetY - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 1) {
            const moveSpeed = Math.min(player.speed * 1.2, dist);
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
    if (player.x + player.width > CANVAS_WIDTH) {
        player.x = CANVAS_WIDTH - player.width;
    }
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > CANVAS_HEIGHT) {
        player.y = CANVAS_HEIGHT - player.height;
    }
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
            width: level.width || 8,
            height: CANVAS_HEIGHT,
            weaponType: 'laser',
            damage: level.damage || 2,
            speed: 0
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
                damage: 4
            });
        }
    } else if (player.weapon === 'plasma') {
        const count = level.count || 2;
        const spread = (level.spread || 30) * (Math.PI / 180);
        for (let i = 0; i < count; i++) {
            const angle = count === 1 ? 0 : (i / (count - 1) - 0.5) * spread * 2;
            playerBullets.push({
                x: player.x + player.width / 2,
                y: player.y,
                width: 8,
                height: 14,
                weaponType: 'plasma',
                speed: -(level.speed || 8),
                vx: Math.sin(angle) * (level.speed || 8),
                damage: level.damage || 2
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
                damage: 1
            });
        }
    }
}

function updateBullets() {
    for (let i = playerBullets.length - 1; i >= 0; i--) {
        const b = playerBullets[i];
        if (b.weaponType === 'laser') {
            b.life = (b.life || 5) - 1;
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
        if (dist < minDist) {
            minDist = dist;
            target = enemy;
        }
    }
    if (target) {
        const dx = target.x + target.width / 2 - b.x;
        const dy = target.y + target.height / 2 - b.y;
        const angle = Math.atan2(dy, dx);
        const speed = Math.abs(b.speed);
        b.vx = b.vx * 0.9 + Math.cos(angle) * speed * 0.1;
        b.speed = b.speed * 0.9 + Math.sin(angle) * speed * 0.1;
    }
    b.x += b.vx || 0;
    b.y += b.speed || -6;
    if (
        b.y < -30 ||
        b.y > CANVAS_HEIGHT + 30 ||
        b.x < -30 ||
        b.x > CANVAS_WIDTH + 30
    ) {
        playerBullets.splice(index, 1);
    }
}

function spawnEnemy() {
    if (currentState !== GAME_STATE.PLAYING || bossActive) return;
    const maxEnemies = Math.min(8 + Math.floor(waveNumber / 3), 15);
    if (enemies.length >= maxEnemies) return;

    const now = Date.now();
    const spawnInterval = Math.max(300, 1000 - waveNumber * 30);
    if (now - lastEnemySpawnTime < spawnInterval) return;
    lastEnemySpawnTime = now;

    const isBossWave = waveNumber % 5 === 0 && waveNumber > 0;
    if (isBossWave && !bossActive) {
        spawnBoss();
        return;
    }

    const type = waveNumber >= 4 && Math.random() < 0.25 ? 'medium' : 'small';
    const typeDef = ENEMY_TYPES[type];
    const x = Math.random() * (CANVAS_WIDTH - typeDef.width);
    enemies.push({
        x,
        y: -typeDef.height,
        width: typeDef.width,
        height: typeDef.height,
        type,
        hp: typeDef.hp,
        maxHp: typeDef.hp,
        speed: typeDef.speedBase + Math.random() * typeDef.speedVar,
        canShoot: typeDef.canShoot,
        lastShootTime: 0
    });
}

function spawnBoss() {
    bossActive = true;
    const typeDef = ENEMY_TYPES.boss;
    const bossAppearances = Math.floor((waveNumber - 1) / 5);
    const hp = Math.floor(typeDef.hp * Math.pow(1.3, bossAppearances));
    enemies.push({
        x: CANVAS_WIDTH / 2 - typeDef.width / 2,
        y: -typeDef.height,
        width: typeDef.width,
        height: typeDef.height,
        type: 'boss',
        hp,
        maxHp: hp,
        speed: typeDef.speedBase,
        canShoot: true,
        lastShootTime: 0,
        patternIndex: 0,
        patternSwitchTime: 0,
        hoverDir: 1,
        hoverX: CANVAS_WIDTH / 2
    });
}

function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        if (enemy.type === 'boss') {
            updateBossMovement(enemy);
        } else {
            enemy.y += enemy.speed;
        }
        if (enemy.y > CANVAS_HEIGHT + 50) {
            enemies.splice(i, 1);
            if (enemy.type === 'boss') bossActive = false;
        }
    }
}

function updateBossMovement(enemy) {
    if (enemy.y < 80) {
        enemy.y += enemy.speed;
    } else {
        enemy.hoverX += enemy.hoverDir * 1.5;
        if (
            enemy.hoverX < enemy.width / 2 + 20 ||
            enemy.hoverX > CANVAS_WIDTH - enemy.width / 2 - 20
        ) {
            enemy.hoverDir *= -1;
        }
        enemy.x = enemy.hoverX - enemy.width / 2;
    }
}

function tryEnemyShoot() {
    const now = Date.now();
    for (const enemy of enemies) {
        if (!enemy.canShoot) continue;
        if (enemy.type === 'boss') {
            tryBossShoot(enemy, now);
        } else {
            tryRegularEnemyShoot(enemy, now);
        }
    }
}

function tryBossShoot(enemy, now) {
    if (now - enemy.patternSwitchTime > 5000) {
        enemy.patternIndex = (enemy.patternIndex + 1) % 3;
        enemy.patternSwitchTime = now;
    }
    const patterns = [
        { count: 1, speed: 5, interval: 800, width: 6, height: 12 },
        { count: 5, speed: 4, interval: 1200, width: 5, height: 10, spread: 60 },
        { count: 12, speed: 3, interval: 2000, width: 5, height: 10, spread: 360 }
    ];
    const pat = patterns[enemy.patternIndex];
    if (now - enemy.lastShootTime < pat.interval) return;
    enemy.lastShootTime = now;

    const cx = enemy.x + enemy.width / 2;
    const cy = enemy.y + enemy.height;
    const baseAngle =
        enemy.patternIndex === 0
            ? Math.atan2(player.y - cy, player.x - cx)
            : -Math.PI / 2;
    for (let i = 0; i < pat.count; i++) {
        const angle = pat.spread
            ? baseAngle +
              (i / pat.count - 0.5) *
                  (pat.spread * Math.PI / 180) *
                  (pat.spread === 360 ? 2 : 1)
            : baseAngle;
        enemyBullets.push({
            x: cx,
            y: cy,
            width: pat.width,
            height: pat.height,
            vx: Math.cos(angle) * pat.speed,
            vy: Math.sin(angle) * pat.speed
        });
    }
}

function tryRegularEnemyShoot(enemy, now) {
    const typeDef = ENEMY_TYPES[enemy.type];
    if (now - enemy.lastShootTime < typeDef.shootInterval) return;
    enemy.lastShootTime = now;

    const dx = player.x + player.width / 2 - (enemy.x + enemy.width / 2);
    const dy = player.y + player.height / 2 - (enemy.y + enemy.height);
    const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
    enemyBullets.push({
        x: enemy.x + enemy.width / 2,
        y: enemy.y + enemy.height,
        width: 4,
        height: 10,
        vx: (dx / dist) * typeDef.bulletSpeed * 0.3,
        vy: typeDef.bulletSpeed
    });
}

function updateEnemyBullets() {
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const b = enemyBullets[i];
        b.x += b.vx || 0;
        b.y += b.vy || 4;
        if (
            b.y > CANVAS_HEIGHT + 20 ||
            b.x < -20 ||
            b.x > CANVAS_WIDTH + 20
        ) {
            enemyBullets.splice(i, 1);
        }
    }
}

function dropItems(enemy) {
    for (const [itemType, config] of Object.entries(ITEM_TYPES)) {
        const rate = config.dropRates[enemy.type];
        if (Math.random() < rate) {
            items.push({
                x: enemy.x + enemy.width / 2 - config.size / 2,
                y: enemy.y + enemy.height / 2 - config.size / 2,
                width: config.size,
                height: config.size,
                itemType,
                speed: 2
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
        if (
            checkCollisionWithHitbox(
                player,
                PLAYER_HITBOX_RATIO,
                item,
                ITEM_HITBOX_RATIO
            )
        ) {
            applyItemEffect(item.itemType);
            items.splice(i, 1);
        }
    }
}

function applyItemEffect(itemType) {
    const config = ITEM_TYPES[itemType];
    if (config.effect === 'weaponLevelUp') {
        if (player.weaponLevel < 3) {
            player.weaponLevel++;
        } else {
            const unlocked = getUnlockedWeapons();
            const weaponIds = Object.keys(WEAPONS);
            const currentIdx = weaponIds.indexOf(player.weapon);
            for (let i = 1; i < weaponIds.length; i++) {
                const nextIdx = (currentIdx + i) % weaponIds.length;
                if (unlocked.includes(weaponIds[nextIdx])) {
                    player.weapon = weaponIds[nextIdx];
                    player.weaponLevel = 1;
                    break;
                }
            }
        }
    } else if (config.effect === 'addBomb') {
        if (player.bombs < PLAYER_MAX_BOMBS) player.bombs++;
    } else if (config.effect === 'addShield') {
        player.shieldUntil = Date.now() + 3000;
    } else if (config.effect === 'addLife') {
        if (player.lives < player.maxLives) player.lives++;
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
    if (
        laserRight > enemy.x &&
        laserX < enemy.x + enemy.width &&
        bullet.y > enemy.y
    ) {
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
    if (
        checkCollisionWithHitbox(
            bulletRect,
            BULLET_HITBOX_RATIO,
            enemy,
            ENEMY_HITBOX_RATIO
        )
    ) {
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
    const typeDef = ENEMY_TYPES[enemy.type];
    createExplosion(
        ex,
        ey,
        typeDef.colors.glow,
        typeDef.colors.core,
        enemy.type === 'boss' ? 40 : 20
    );
    addScorePopup(ex, ey - 10, typeDef.score);
    addScreenShake(enemy.type === 'boss' ? 10 : 3);
    dropItems(enemy);
    enemies.splice(index, 1);
    score += typeDef.score;
    if (enemy.type === 'boss') {
        bossActive = false;
        waveNumber++;
    }
}

function checkPlayerCollisions() {
    const isInvincible = Date.now() < player.invincibleUntil;
    const hasShield = Date.now() < player.shieldUntil;
    if (isInvincible || hasShield) return;

    for (const enemy of enemies) {
        if (
            checkCollisionWithHitbox(
                player,
                PLAYER_HITBOX_RATIO,
                enemy,
                ENEMY_HITBOX_RATIO
            )
        ) {
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
        if (
            checkCollisionWithHitbox(
                player,
                PLAYER_HITBOX_RATIO,
                bulletRect,
                BULLET_HITBOX_RATIO
            )
        ) {
            playerHit();
            return;
        }
    }
}

function playerHit() {
    player.lives--;
    createExplosion(
        player.x + player.width / 2,
        player.y + player.height / 2,
        '#00ffff',
        '#ffffff',
        30
    );
    addScreenShake(8);
    if (player.lives <= 0) {
        gameOver();
    } else {
        player.invincibleUntil = Date.now() + PLAYER_INVINCIBLE_MS;
        if (player.weaponLevel > 1) player.weaponLevel--;
    }
}

function gameOver() {
    currentState = GAME_STATE.GAME_OVER;
    if (score > highScore) {
        highScore = Math.floor(score);
        localStorage.setItem('planeWarHighScore', highScore.toString());
    }
    totalScore += Math.floor(score);
    localStorage.setItem('planeWarTotalScore', totalScore.toString());
    checkUnlocks(totalScore);
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
    updateItems();
    checkBulletEnemyCollisions();
    checkPlayerCollisions();
    updateParticles();
    updateScorePopups();
    updateUnlockNotifications();
    updateScreenShake();
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
