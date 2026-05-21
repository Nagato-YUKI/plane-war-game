const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 640;

const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 60;
const PLAYER_SPEED = 5;

const BULLET_WIDTH = 6;
const BULLET_HEIGHT = 18;
const BULLET_SPEED = 10;
const BULLET_INTERVAL = 150;

const ENEMY_WIDTH = 45;
const ENEMY_HEIGHT = 45;
const ENEMY_SPEED_BASE = 2;
const ENEMY_SPAWN_INTERVAL = 1000;

const ENEMY_BULLET_WIDTH = 4;
const ENEMY_BULLET_HEIGHT = 10;
const ENEMY_BULLET_SPEED = 4;
const ENEMY_SHOOT_INTERVAL = 1500;
const ENEMY_MAX_COUNT = 8;

const STAR_COUNT = 120;
const PARTICLE_LIMIT = 200;

const GAME_STATE = {
    START: 'start',
    PLAYING: 'playing',
    GAME_OVER: 'game_over'
};

let currentState = GAME_STATE.START;
let gameLoopId = null;

const player = {
    x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2,
    y: CANVAS_HEIGHT - PLAYER_HEIGHT - 20,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    speed: PLAYER_SPEED
};

const keys = {};
let mouseControl = false;
let mouseX = 0;
let mouseY = 0;
let isMouseDown = false;
let touchControl = false;
let touchX = 0;
let touchY = 0;

let playerBullets = [];
let lastBulletTime = 0;
let enemies = [];
let enemyBullets = [];
let lastEnemySpawnTime = 0;

let score = 0;
let highScore = parseInt(localStorage.getItem('planeWarHighScore') || '0', 10);
let gameTime = 0;
let gameStartTime = 0;

let stars = [];
let particles = [];
let scorePopups = [];
let screenShake = { x: 0, y: 0, intensity: 0 };

let frameCount = 0;

function initStars() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
            x: Math.random() * CANVAS_WIDTH,
            y: Math.random() * CANVAS_HEIGHT,
            size: Math.random() * 2 + 0.5,
            speed: Math.random() * 1.5 + 0.5,
            brightness: Math.random() * 0.5 + 0.5
        });
    }
}

function updateStars() {
    for (const star of stars) {
        star.y += star.speed;
        if (star.y > CANVAS_HEIGHT) {
            star.y = 0;
            star.x = Math.random() * CANVAS_WIDTH;
        }
        star.brightness = 0.5 + Math.sin(frameCount * 0.02 + star.x) * 0.3;
    }
}

function drawStars() {
    for (const star of stars) {
        const alpha = Math.max(0.1, Math.min(1, star.brightness));
        ctx.fillStyle = `rgba(200, 220, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function createParticle(x, y, vx, vy, color, life, size) {
    if (particles.length >= PARTICLE_LIMIT) return;
    particles.push({ x, y, vx, vy, color, life, maxLife: life, size });
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        p.vx *= 0.98;
        p.vy *= 0.98;
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function drawParticles() {
    for (const p of particles) {
        const alpha = Math.max(0, p.life / p.maxLife);
        const size = p.size * alpha;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = alpha * 0.4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size * 2, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

function createExplosion(x, y, color1, color2, count) {
    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
        const speed = Math.random() * 4 + 1;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        const color = Math.random() > 0.5 ? color1 : color2;
        const life = Math.floor(Math.random() * 20 + 15);
        const size = Math.random() * 3 + 1;
        createParticle(x, y, vx, vy, color, life, size);
    }
    for (let i = 0; i < 5; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2 + 0.5;
        createParticle(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, '#ffffff', 10, 2);
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
    scorePopups.push({
        x, y, value,
        life: 40,
        maxLife: 40,
        vy: -2
    });
}

function updateScorePopups() {
    for (let i = scorePopups.length - 1; i >= 0; i--) {
        const popup = scorePopups[i];
        popup.y += popup.vy;
        popup.life--;
        if (popup.life <= 0) {
            scorePopups.splice(i, 1);
        }
    }
}

function drawScorePopups() {
    for (const popup of scorePopups) {
        const alpha = popup.life / popup.maxLife;
        ctx.globalAlpha = alpha;
        ctx.font = '14px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#00ffff';
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 8;
        ctx.fillText(`+${popup.value}`, popup.x, popup.y);
        ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#050510');
    gradient.addColorStop(0.5, '#0a0a20');
    gradient.addColorStop(1, '#050510');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    drawStars();

    drawNebula();
}

function drawNebula() {
    const t = frameCount * 0.003;
    ctx.globalAlpha = 0.04;
    const grad = ctx.createRadialGradient(
        CANVAS_WIDTH * 0.3 + Math.sin(t) * 50, CANVAS_HEIGHT * 0.4 + Math.cos(t) * 30, 0,
        CANVAS_WIDTH * 0.3 + Math.sin(t) * 50, CANVAS_HEIGHT * 0.4 + Math.cos(t) * 30, 200
    );
    grad.addColorStop(0, '#ff00ff');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const grad2 = ctx.createRadialGradient(
        CANVAS_WIDTH * 0.7 + Math.cos(t) * 40, CANVAS_HEIGHT * 0.6 + Math.sin(t) * 50, 0,
        CANVAS_WIDTH * 0.7 + Math.cos(t) * 40, CANVAS_HEIGHT * 0.6 + Math.sin(t) * 50, 180
    );
    grad2.addColorStop(0, '#00ffff');
    grad2.addColorStop(1, 'transparent');
    ctx.fillStyle = grad2;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.globalAlpha = 1;
}

function drawPlayerEngineTrail() {
    const cx = player.x + player.width / 2;
    const by = player.y + player.height;

    for (let i = 0; i < 2; i++) {
        const ox = (i === 0) ? -8 : 8;
        const vx = (Math.random() - 0.5) * 0.8;
        const vy = Math.random() * 2 + 1;
        const colors = ['#00ffff', '#00aaff', '#0066ff', '#ffffff'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        createParticle(cx + ox, by, vx, vy, color, Math.floor(Math.random() * 10 + 5), Math.random() * 2 + 1);
    }
}

function drawPlayer() {
    const cx = player.x + player.width / 2;
    const top = player.y;
    const bot = player.y + player.height;

    ctx.save();
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 15;

    ctx.fillStyle = '#005577';
    ctx.beginPath();
    ctx.moveTo(cx, top);
    ctx.lineTo(player.x, bot - 8);
    ctx.lineTo(player.x + 8, bot);
    ctx.lineTo(player.x + player.width - 8, bot);
    ctx.lineTo(player.x + player.width, bot - 8);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#00ccff';
    ctx.beginPath();
    ctx.moveTo(cx, top + 5);
    ctx.lineTo(player.x + 8, bot - 10);
    ctx.lineTo(player.x + player.width - 8, bot - 10);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#00ffff';
    ctx.beginPath();
    ctx.moveTo(cx - 3, top + 10);
    ctx.lineTo(cx - 6, bot - 15);
    ctx.lineTo(cx + 6, bot - 15);
    ctx.lineTo(cx + 3, top + 10);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#44eeff';
    ctx.beginPath();
    ctx.moveTo(cx, top + 12);
    ctx.lineTo(cx - 3, bot - 18);
    ctx.lineTo(cx + 3, bot - 18);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, top + 20, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    drawPlayerEngineTrail();
}

function drawEnemy(enemy) {
    const cx = enemy.x + enemy.width / 2;
    const top = enemy.y;
    const bot = enemy.y + enemy.height;

    ctx.save();
    ctx.shadowColor = '#ff0044';
    ctx.shadowBlur = 12;

    ctx.fillStyle = '#770022';
    ctx.beginPath();
    ctx.moveTo(enemy.x, top + 5);
    ctx.lineTo(cx, bot);
    ctx.lineTo(enemy.x + enemy.width, top + 5);
    ctx.lineTo(enemy.x + enemy.width - 5, top);
    ctx.lineTo(enemy.x + 5, top);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ff2244';
    ctx.beginPath();
    ctx.moveTo(enemy.x + 5, top + 8);
    ctx.lineTo(cx, bot - 5);
    ctx.lineTo(enemy.x + enemy.width - 5, top + 8);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ff4466';
    ctx.beginPath();
    ctx.moveTo(cx - 5, top + 12);
    ctx.lineTo(cx, bot - 10);
    ctx.lineTo(cx + 5, top + 12);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffaa00';
    ctx.beginPath();
    ctx.arc(cx, top + 15, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    if (enemy.canShoot) {
        ctx.save();
        ctx.globalAlpha = 0.5 + Math.sin(frameCount * 0.1) * 0.3;
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 6;
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(cx - 6, top + 8, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + 6, top + 8, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function drawBullets() {
    for (const bullet of playerBullets) {
        ctx.save();
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 10;
        const gradient = ctx.createLinearGradient(bullet.x, bullet.y, bullet.x, bullet.y + bullet.height);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.3, '#00ffff');
        gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        ctx.restore();

        if (frameCount % 2 === 0) {
            createParticle(
                bullet.x + bullet.width / 2,
                bullet.y + bullet.height,
                (Math.random() - 0.5) * 0.5,
                Math.random() * 1 + 0.5,
                '#00ffff',
                Math.floor(Math.random() * 6 + 3),
                1
            );
        }
    }
}

function drawEnemyBullets() {
    for (const bullet of enemyBullets) {
        ctx.save();
        ctx.shadowColor = '#ff0044';
        ctx.shadowBlur = 8;
        const gradient = ctx.createLinearGradient(bullet.x, bullet.y, bullet.x, bullet.y + bullet.height);
        gradient.addColorStop(0, 'rgba(255, 0, 68, 0)');
        gradient.addColorStop(0.7, '#ff0044');
        gradient.addColorStop(1, '#ffffff');
        ctx.fillStyle = gradient;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        ctx.restore();
    }
}

function drawScore() {
    ctx.save();
    ctx.font = '12px "Press Start 2P", monospace';
    ctx.textAlign = 'right';
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#00ffff';
    ctx.fillText(`SCORE ${score}`, CANVAS_WIDTH - 15, 25);
    ctx.shadowColor = '#ff00ff';
    ctx.fillStyle = '#ff88ff';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillText(`HI ${highScore}`, CANVAS_WIDTH - 15, 42);
    ctx.shadowBlur = 0;
    ctx.restore();
}

function drawStartScreen() {
    drawBackground();

    ctx.save();
    ctx.textAlign = 'center';

    const titleY = CANVAS_HEIGHT / 2 - 60;

    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#00ffff';
    ctx.font = '24px "Press Start 2P", monospace';
    ctx.fillText('PLANE WAR', CANVAS_WIDTH / 2, titleY);

    ctx.shadowColor = '#ff00ff';
    ctx.fillStyle = '#ff00ff';
    ctx.fillText('PLANE WAR', CANVAS_WIDTH / 2 + 2, titleY + 2);
    ctx.globalAlpha = 0.3;
    ctx.fillText('PLANE WAR', CANVAS_WIDTH / 2 + 4, titleY + 4);
    ctx.globalAlpha = 1;

    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#88ccff';
    ctx.font = '14px "Press Start 2P", monospace';
    ctx.fillText('飞 机 大 战', CANVAS_WIDTH / 2, titleY + 35);

    const blink = Math.sin(frameCount * 0.05) > 0;
    if (blink) {
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 6;
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.fillText('PRESS SPACE OR TAP', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
    }

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#446688';
    ctx.font = '10px "VT323", monospace';
    ctx.fillText('ARROW KEYS: MOVE  |  SPACE: FIRE', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 100);
    ctx.fillText('MOUSE DRAG: MOVE + AUTO FIRE', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 120);

    ctx.restore();
}

function drawGameOverScreen() {
    drawBackground();

    ctx.save();
    ctx.fillStyle = 'rgba(5, 5, 16, 0.6)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.textAlign = 'center';

    ctx.shadowColor = '#ff0044';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#ff0044';
    ctx.font = '20px "Press Start 2P", monospace';
    ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ff88aa';
    ctx.font = '14px "VT323", monospace';
    ctx.fillText(`WAVE TIME: ${Math.floor(gameTime)}s`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 25);

    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#00ffff';
    ctx.font = '12px "Press Start 2P", monospace';
    ctx.fillText(`SCORE: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);

    ctx.shadowColor = '#ff00ff';
    ctx.fillStyle = '#ff88ff';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText(`BEST: ${highScore}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 35);

    const blink = Math.sin(frameCount * 0.05) > 0;
    if (blink) {
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 6;
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.fillText('PRESS SPACE TO RETRY', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 75);
    }

    ctx.restore();
}

function checkCollision(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

function updateGame() {
    gameTime = (Date.now() - gameStartTime) / 1000;
    updatePlayer();
    updateBullets();
    tryFireBullet();
    spawnEnemy();
    updateEnemies();
    tryEnemyShoot();
    updateEnemyBullets();
    checkBulletEnemyCollisions();
    checkPlayerCollisions();
    updateParticles();
    updateScorePopups();
    updateScreenShake();
}

function checkBulletEnemyCollisions() {
    for (let i = playerBullets.length - 1; i >= 0; i--) {
        const bullet = playerBullets[i];
        let hit = false;
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            if (checkCollision(bullet, enemy)) {
                const ex = enemy.x + enemy.width / 2;
                const ey = enemy.y + enemy.height / 2;
                createExplosion(ex, ey, '#ff4444', '#ffaa00', 20);
                addScorePopup(ex, ey - 10, 10);
                addScreenShake(3);
                playerBullets.splice(i, 1);
                enemies.splice(j, 1);
                score += 10;
                hit = true;
                break;
            }
        }
        if (hit) break;
    }
}

function checkPlayerCollisions() {
    for (const enemy of enemies) {
        if (checkCollision(player, enemy)) {
            const ex = (player.x + player.width / 2 + enemy.x + enemy.width / 2) / 2;
            const ey = (player.y + player.height / 2 + enemy.y + enemy.height / 2) / 2;
            createExplosion(player.x + player.width / 2, player.y + player.height / 2, '#00ffff', '#ffffff', 30);
            createExplosion(ex, ey, '#ff4444', '#ffaa00', 20);
            addScreenShake(8);
            gameOver();
            return;
        }
    }
    for (const bullet of enemyBullets) {
        if (checkCollision(player, bullet)) {
            createExplosion(player.x + player.width / 2, player.y + player.height / 2, '#00ffff', '#ffffff', 30);
            addScreenShake(8);
            gameOver();
            return;
        }
    }
}

function gameOver() {
    currentState = GAME_STATE.GAME_OVER;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('planeWarHighScore', highScore.toString());
    }
}

function drawGame() {
    ctx.save();
    ctx.translate(screenShake.x, screenShake.y);

    drawBackground();
    drawBullets();
    drawEnemyBullets();
    drawEnemies();
    drawPlayer();
    drawParticles();
    drawScorePopups();
    drawScore();

    drawScanlines();

    ctx.restore();
}

function drawScanlines() {
    ctx.globalAlpha = 0.03;
    ctx.fillStyle = '#000000';
    for (let y = 0; y < CANVAS_HEIGHT; y += 4) {
        ctx.fillRect(0, y, CANVAS_WIDTH, 2);
    }
    ctx.globalAlpha = 1;
}

function updatePlayer() {
    if (touchControl) {
        player.x = touchX - player.width / 2;
        player.y = touchY - player.height / 2;
    } else if (mouseControl) {
        player.x = mouseX - player.width / 2;
        player.y = mouseY - player.height / 2;
    } else {
        if (keys['ArrowUp']) player.y -= player.speed;
        if (keys['ArrowDown']) player.y += player.speed;
        if (keys['ArrowLeft']) player.x -= player.speed;
        if (keys['ArrowRight']) player.x += player.speed;
    }
    clampPlayerPosition();
}

function clampPlayerPosition() {
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > CANVAS_WIDTH) player.x = CANVAS_WIDTH - player.width;
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > CANVAS_HEIGHT) player.y = CANVAS_HEIGHT - player.height;
}

function handleKeyDown(event) {
    if (event.code === 'Space') {
        event.preventDefault();
        keys['Space'] = true;
        if (currentState === GAME_STATE.START || currentState === GAME_STATE.GAME_OVER) {
            startGame();
        }
    }
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) {
        event.preventDefault();
        keys[event.code] = true;
        mouseControl = false;
        touchControl = false;
    }
}

function tryFireBullet() {
    if (currentState !== GAME_STATE.PLAYING) return;
    const shouldFire = keys['Space'] || mouseControl || touchControl;
    if (!shouldFire) return;

    const now = Date.now();
    if (now - lastBulletTime < BULLET_INTERVAL) return;

    lastBulletTime = now;
    createBullet();
}

function createBullet() {
    playerBullets.push({
        x: player.x + player.width / 2 - BULLET_WIDTH / 2,
        y: player.y,
        width: BULLET_WIDTH,
        height: BULLET_HEIGHT,
        speed: BULLET_SPEED
    });
}

function updateBullets() {
    for (let i = playerBullets.length - 1; i >= 0; i--) {
        const bullet = playerBullets[i];
        bullet.y -= bullet.speed;
        if (bullet.y + bullet.height < 0) {
            playerBullets.splice(i, 1);
        }
    }
}

function handleKeyUp(event) {
    if (event.code === 'Space') {
        keys['Space'] = false;
    }
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) {
        keys[event.code] = false;
    }
}

function handleTouchStart(event) {
    event.preventDefault();
    const touch = event.touches[0];
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    touchX = (touch.clientX - rect.left) * scaleX;
    touchY = (touch.clientY - rect.top) * scaleY;
    touchControl = true;
    mouseControl = false;

    if (currentState === GAME_STATE.START || currentState === GAME_STATE.GAME_OVER) {
        startGame();
    }
}

function handleTouchMove(event) {
    event.preventDefault();
    if (!touchControl) return;
    const touch = event.touches[0];
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    touchX = (touch.clientX - rect.left) * scaleX;
    touchY = (touch.clientY - rect.top) * scaleY;
}

function handleTouchEnd(event) {
    event.preventDefault();
    touchControl = false;
}

function handleMouseDown(event) {
    isMouseDown = true;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    mouseX = (event.clientX - rect.left) * scaleX;
    mouseY = (event.clientY - rect.top) * scaleY;
    mouseControl = true;
    touchControl = false;

    if (currentState === GAME_STATE.START || currentState === GAME_STATE.GAME_OVER) {
        startGame();
    }
}

function handleMouseMove(event) {
    if (!isMouseDown) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    mouseX = (event.clientX - rect.left) * scaleX;
    mouseY = (event.clientY - rect.top) * scaleY;
    mouseControl = true;
}

function handleMouseUp() {
    isMouseDown = false;
    mouseControl = false;
}

function handleMouseLeave() {
    isMouseDown = false;
    mouseControl = false;
}

function startGame() {
    currentState = GAME_STATE.PLAYING;
    score = 0;
    gameStartTime = Date.now();
    gameTime = 0;
    resetPlayer();
    resetBullets();
    resetEnemies();
    particles = [];
    scorePopups = [];
    screenShake = { x: 0, y: 0, intensity: 0 };
}

function resetPlayer() {
    player.x = CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2;
    player.y = CANVAS_HEIGHT - PLAYER_HEIGHT - 20;
    mouseControl = false;
    touchControl = false;
    Object.keys(keys).forEach((key) => { keys[key] = false; });
}

function resetBullets() {
    playerBullets = [];
    enemyBullets = [];
    lastBulletTime = 0;
}

function getDifficultyMultiplier() {
    return 1 + Math.floor(gameTime / 15) * 0.15;
}

function spawnEnemy() {
    if (currentState !== GAME_STATE.PLAYING) return;
    const maxCount = Math.min(ENEMY_MAX_COUNT + Math.floor(gameTime / 20), 15);
    if (enemies.length >= maxCount) return;

    const diff = getDifficultyMultiplier();
    const interval = Math.max(400, ENEMY_SPAWN_INTERVAL / diff);
    const now = Date.now();
    if (now - lastEnemySpawnTime < interval) return;

    lastEnemySpawnTime = now;
    createEnemy();
}

function createEnemy() {
    const diff = getDifficultyMultiplier();
    const x = Math.random() * (CANVAS_WIDTH - ENEMY_WIDTH);
    const canShoot = Math.random() < Math.min(0.3 + gameTime * 0.005, 0.6);
    enemies.push({
        x,
        y: -ENEMY_HEIGHT,
        width: ENEMY_WIDTH,
        height: ENEMY_HEIGHT,
        speed: ENEMY_SPEED_BASE * diff * (0.8 + Math.random() * 0.4),
        canShoot,
        lastShootTime: 0
    });
}

function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.y += enemy.speed;
        if (enemy.y > CANVAS_HEIGHT) {
            enemies.splice(i, 1);
        }
    }
}

function tryEnemyShoot() {
    const now = Date.now();
    const diff = getDifficultyMultiplier();
    const interval = Math.max(600, ENEMY_SHOOT_INTERVAL / diff);
    for (const enemy of enemies) {
        if (!enemy.canShoot) continue;
        if (now - enemy.lastShootTime < interval) continue;
        enemy.lastShootTime = now;
        createEnemyBullet(enemy);
    }
}

function createEnemyBullet(enemy) {
    const diff = getDifficultyMultiplier();
    const dx = (player.x + player.width / 2) - (enemy.x + enemy.width / 2);
    const dy = (player.y + player.height / 2) - (enemy.y + enemy.height);
    const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
    const speed = ENEMY_BULLET_SPEED * diff;
    enemyBullets.push({
        x: enemy.x + enemy.width / 2 - ENEMY_BULLET_WIDTH / 2,
        y: enemy.y + enemy.height,
        width: ENEMY_BULLET_WIDTH,
        height: ENEMY_BULLET_HEIGHT,
        vx: (dx / dist) * speed * 0.3,
        vy: speed,
        speed
    });
}

function updateEnemyBullets() {
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const bullet = enemyBullets[i];
        bullet.x += bullet.vx || 0;
        bullet.y += bullet.vy || bullet.speed;
        if (bullet.y > CANVAS_HEIGHT || bullet.x < -20 || bullet.x > CANVAS_WIDTH + 20) {
            enemyBullets.splice(i, 1);
        }
    }
}

function drawEnemies() {
    for (const enemy of enemies) {
        drawEnemy(enemy);
    }
}

function resetEnemies() {
    enemies = [];
    enemyBullets = [];
    lastEnemySpawnTime = 0;
}

function gameLoop() {
    frameCount++;
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    updateStars();

    switch (currentState) {
        case GAME_STATE.START:
            updateParticles();
            drawStartScreen();
            break;
        case GAME_STATE.PLAYING:
            updateGame();
            drawGame();
            break;
        case GAME_STATE.GAME_OVER:
            updateParticles();
            updateScreenShake();
            ctx.save();
            ctx.translate(screenShake.x, screenShake.y);
            drawGameOverScreen();
            drawParticles();
            ctx.restore();
            break;
    }

    gameLoopId = requestAnimationFrame(gameLoop);
}

function init() {
    initStars();

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    gameLoopId = requestAnimationFrame(gameLoop);
}

window.addEventListener('load', init);
