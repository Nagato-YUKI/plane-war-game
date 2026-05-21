/**
 * 飞机大战 - 游戏主逻辑
 */

// 获取画布和绘图上下文
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 游戏常量
const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 640;

// 玩家飞机尺寸
const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 60;
const PLAYER_SPEED = 5;

// 子弹参数
const BULLET_WIDTH = 4;
const BULLET_HEIGHT = 12;
const BULLET_SPEED = 8;
const BULLET_INTERVAL = 200; // 子弹发射间隔（毫秒）

// 敌机参数
const ENEMY_WIDTH = 40;
const ENEMY_HEIGHT = 40;
const ENEMY_SPEED_BASE = 2;
const ENEMY_SPAWN_INTERVAL = 1000; // 敌机生成间隔（毫秒）

// 游戏状态枚举
const GAME_STATE = {
    START: 'start',
    PLAYING: 'playing',
    GAME_OVER: 'game_over'
};

// 当前游戏状态
let currentState = GAME_STATE.START;

// 游戏循环ID
let gameLoopId = null;

// 玩家飞机对象
const player = {
    x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2,
    y: CANVAS_HEIGHT - PLAYER_HEIGHT - 20,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    speed: PLAYER_SPEED
};

// 按键状态记录
const keys = {};

// 鼠标控制状态
let mouseControl = false;
let mouseX = 0;
let mouseY = 0;

// 子弹数组
let playerBullets = [];

// 上次发射子弹时间
let lastBulletTime = 0;

// 敌机数组
let enemies = [];

// 敌机子弹数组
let enemyBullets = [];

// 上次生成敌机时间
let lastEnemySpawnTime = 0;

// 分数系统
let score = 0;
let highScore = parseInt(localStorage.getItem('planeWarHighScore') || '0', 10);

// 敌机子弹参数
const ENEMY_BULLET_WIDTH = 4;
const ENEMY_BULLET_HEIGHT = 8;
const ENEMY_BULLET_SPEED = 4;
const ENEMY_SHOOT_INTERVAL = 1500; // 敌机发射间隔（毫秒）
const ENEMY_MAX_COUNT = 8; // 最大敌机数量

/**
 * 初始化游戏
 */
function init() {
    // 绑定键盘事件
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // 绑定触摸事件（移动端支持）
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    // 绑定鼠标事件
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // 开始游戏循环
    gameLoopId = requestAnimationFrame(gameLoop);
}

/**
 * 游戏主循环
 */
function gameLoop() {
    // 清空画布
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    switch (currentState) {
        case GAME_STATE.START:
            drawStartScreen();
            break;
        case GAME_STATE.PLAYING:
            updateGame();
            drawGame();
            break;
        case GAME_STATE.GAME_OVER:
            drawGameOverScreen();
            break;
    }

    gameLoopId = requestAnimationFrame(gameLoop);
}

/**
 * 绘制开始界面
 */
function drawStartScreen() {
    ctx.fillStyle = '#0f0f23';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = '#00d4ff';
    ctx.font = 'bold 36px Microsoft YaHei';
    ctx.textAlign = 'center';
    ctx.fillText('飞机大战', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);

    ctx.fillStyle = '#ffffff';
    ctx.font = '18px Microsoft YaHei';
    ctx.fillText('按空格键或点击屏幕开始游戏', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
}

/**
 * 绘制实时分数（右上角）
 */
function drawScore() {
    ctx.fillStyle = '#ffffff';
    ctx.font = '18px Microsoft YaHei';
    ctx.textAlign = 'right';
    ctx.fillText(`分数: ${score}`, CANVAS_WIDTH - 20, 30);
}

/**
 * 绘制游戏结束界面
 */
function drawGameOverScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = '#ff4444';
    ctx.font = 'bold 36px Microsoft YaHei';
    ctx.textAlign = 'center';
    ctx.fillText('游戏结束', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);

    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Microsoft YaHei';
    ctx.fillText(`最终分数: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 10);
    ctx.fillText(`最高分: ${highScore}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 25);

    ctx.font = '18px Microsoft YaHei';
    ctx.fillText('按空格键重新开始', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 70);
}

/**
 * 碰撞检测（AABB - 轴对齐边界框）
 * 判断两个矩形是否重叠：
 * 当 rect1 的右边缘 > rect2 的左边缘，且 rect1 的左边缘 < rect2 的右边缘，
 * 且 rect1 的下边缘 > rect2 的上边缘，且 rect1 的上边缘 < rect2 的下边缘时，
 * 两个矩形在 x 和 y 轴上均存在重叠，即发生碰撞
 */
function checkCollision(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

/**
 * 更新游戏逻辑
 */
function updateGame() {
    updatePlayer();
    updateBullets();
    tryFireBullet();
    spawnEnemy();
    updateEnemies();
    tryEnemyShoot();
    updateEnemyBullets();
    checkBulletEnemyCollisions();
    checkPlayerCollisions();
}

/**
 * 检测我方子弹与敌机的碰撞
 * 一个子弹只能击中一架敌机，避免一弹多杀
 */
function checkBulletEnemyCollisions() {
    for (let i = playerBullets.length - 1; i >= 0; i--) {
        const bullet = playerBullets[i];
        let hit = false;
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            if (checkCollision(bullet, enemy)) {
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

/**
 * 检测敌机及敌机子弹与玩家的碰撞
 */
function checkPlayerCollisions() {
    for (const enemy of enemies) {
        if (checkCollision(player, enemy)) {
            gameOver();
            return;
        }
    }
    for (const bullet of enemyBullets) {
        if (checkCollision(player, bullet)) {
            gameOver();
            return;
        }
    }
}

/**
 * 游戏结束处理
 */
function gameOver() {
    currentState = GAME_STATE.GAME_OVER;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('planeWarHighScore', highScore.toString());
    }
}

/**
 * 绘制游戏画面
 */
function drawGame() {
    drawBackground();
    drawPlayer();
    drawBullets();
    drawEnemies();
    drawEnemyBullets();
    drawScore();
}

/**
 * 绘制游戏背景
 */
function drawBackground() {
    ctx.fillStyle = '#0f0f23';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

/**
 * 更新玩家飞机位置
 */
function updatePlayer() {
    if (mouseControl) {
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

/**
 * 限制玩家飞机在画布边界内
 */
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

/**
 * 绘制玩家飞机
 */
function drawPlayer() {
    const cx = player.x + player.width / 2;
    const cy = player.y + player.height / 2;
    ctx.fillStyle = '#00d4ff';
    ctx.beginPath();
    // 三角形机身
    ctx.moveTo(cx, player.y);
    ctx.lineTo(player.x, player.y + player.height);
    ctx.lineTo(player.x + player.width, player.y + player.height);
    ctx.closePath();
    ctx.fill();
    // 机翼
    ctx.fillStyle = '#00aaff';
    ctx.beginPath();
    ctx.moveTo(cx, player.y + player.height * 0.3);
    ctx.lineTo(player.x - player.width * 0.3, player.y + player.height * 0.7);
    ctx.lineTo(player.x + player.width * 1.3, player.y + player.height * 0.7);
    ctx.closePath();
    ctx.fill();
}

/**
 * 处理键盘按下事件
 */
function handleKeyDown(event) {
    if (event.code === 'Space') {
        event.preventDefault();
        if (currentState === GAME_STATE.START || currentState === GAME_STATE.GAME_OVER) {
            startGame();
        }
    }
    // 记录方向键状态，并阻止默认滚动行为
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) {
        event.preventDefault();
        keys[event.code] = true;
        mouseControl = false;
    }
}

/**
 * 尝试发射子弹
 * 空格键按住且在 PLAYING 状态下，按间隔发射
 */
function tryFireBullet() {
    if (currentState !== GAME_STATE.PLAYING) return;
    if (!keys['Space']) return;

    const now = Date.now();
    if (now - lastBulletTime < BULLET_INTERVAL) return;

    lastBulletTime = now;
    createBullet();
}

/**
 * 创建子弹对象，从飞机头部中央发射
 */
function createBullet() {
    const bullet = {
        x: player.x + player.width / 2 - BULLET_WIDTH / 2,
        y: player.y,
        width: BULLET_WIDTH,
        height: BULLET_HEIGHT,
        speed: BULLET_SPEED
    };
    playerBullets.push(bullet);
}

/**
 * 更新所有子弹位置，移除越界子弹
 */
function updateBullets() {
    for (let i = playerBullets.length - 1; i >= 0; i--) {
        const bullet = playerBullets[i];
        bullet.y -= bullet.speed;
        if (bullet.y + bullet.height < 0) {
            playerBullets.splice(i, 1);
        }
    }
}

/**
 * 绘制所有子弹
 */
function drawBullets() {
    ctx.fillStyle = '#ffdd00';
    for (const bullet of playerBullets) {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }
}

/**
 * 处理键盘释放事件
 */
function handleKeyUp(event) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) {
        keys[event.code] = false;
    }
}

/**
 * 处理触摸开始事件
 */
function handleTouchStart(event) {
    event.preventDefault();
    if (currentState === GAME_STATE.START || currentState === GAME_STATE.GAME_OVER) {
        startGame();
    }
}

/**
 * 处理触摸移动事件
 */
function handleTouchMove(event) {
    event.preventDefault();
    // TODO: 实现触摸移动处理
}

/**
 * 处理触摸结束事件
 */
function handleTouchEnd(event) {
    event.preventDefault();
    // TODO: 实现触摸结束处理
}

/**
 * 处理鼠标移动事件
 */
function handleMouseMove(event) {
    const rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
    mouseControl = true;
}

/**
 * 处理鼠标离开画布事件
 */
function handleMouseLeave() {
    mouseControl = false;
}

/**
 * 开始游戏
 */
function startGame() {
    currentState = GAME_STATE.PLAYING;
    score = 0;
    resetPlayer();
    resetBullets();
    resetEnemies();
}

/**
 * 重置玩家飞机位置
 */
function resetPlayer() {
    player.x = CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2;
    player.y = CANVAS_HEIGHT - PLAYER_HEIGHT - 20;
    mouseControl = false;
    Object.keys(keys).forEach((key) => delete keys[key]);
}

/**
 * 重置子弹状态
 */
function resetBullets() {
    playerBullets = [];
    lastBulletTime = 0;
}

/**
 * 生成敌机
 * 在 PLAYING 状态下，按间隔生成，控制最大数量
 */
function spawnEnemy() {
    if (currentState !== GAME_STATE.PLAYING) return;
    if (enemies.length >= ENEMY_MAX_COUNT) return;

    const now = Date.now();
    if (now - lastEnemySpawnTime < ENEMY_SPAWN_INTERVAL) return;

    lastEnemySpawnTime = now;
    createEnemy();
}

/**
 * 创建单个敌机对象
 */
function createEnemy() {
    const x = Math.random() * (CANVAS_WIDTH - ENEMY_WIDTH);
    const canShoot = Math.random() < 0.3;
    const enemy = {
        x,
        y: -ENEMY_HEIGHT,
        width: ENEMY_WIDTH,
        height: ENEMY_HEIGHT,
        speed: ENEMY_SPEED_BASE,
        canShoot,
        lastShootTime: 0
    };
    enemies.push(enemy);
}

/**
 * 更新所有敌机位置，移除越界敌机
 */
function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.y += enemy.speed;
        if (enemy.y > CANVAS_HEIGHT) {
            enemies.splice(i, 1);
        }
    }
}

/**
 * 敌机尝试发射子弹
 */
function tryEnemyShoot() {
    const now = Date.now();
    for (const enemy of enemies) {
        if (!enemy.canShoot) continue;
        if (now - enemy.lastShootTime < ENEMY_SHOOT_INTERVAL) continue;

        enemy.lastShootTime = now;
        createEnemyBullet(enemy);
    }
}

/**
 * 创建敌机子弹
 */
function createEnemyBullet(enemy) {
    const bullet = {
        x: enemy.x + enemy.width / 2 - ENEMY_BULLET_WIDTH / 2,
        y: enemy.y + enemy.height,
        width: ENEMY_BULLET_WIDTH,
        height: ENEMY_BULLET_HEIGHT,
        speed: ENEMY_BULLET_SPEED
    };
    enemyBullets.push(bullet);
}

/**
 * 更新敌机子弹位置，移除越界子弹
 */
function updateEnemyBullets() {
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const bullet = enemyBullets[i];
        bullet.y += bullet.speed;
        if (bullet.y > CANVAS_HEIGHT) {
            enemyBullets.splice(i, 1);
        }
    }
}

/**
 * 绘制所有敌机
 */
function drawEnemies() {
    for (const enemy of enemies) {
        drawEnemy(enemy);
    }
}

/**
 * 绘制单个敌机（倒三角形）
 */
function drawEnemy(enemy) {
    const cx = enemy.x + enemy.width / 2;
    const cy = enemy.y + enemy.height / 2;
    ctx.fillStyle = '#ff4444';
    ctx.beginPath();
    ctx.moveTo(enemy.x, enemy.y);
    ctx.lineTo(enemy.x + enemy.width, enemy.y);
    ctx.lineTo(cx, enemy.y + enemy.height);
    ctx.closePath();
    ctx.fill();
}

/**
 * 绘制所有敌机子弹
 */
function drawEnemyBullets() {
    ctx.fillStyle = '#ff4444';
    for (const bullet of enemyBullets) {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }
}

/**
 * 重置敌机状态
 */
function resetEnemies() {
    enemies = [];
    enemyBullets = [];
    lastEnemySpawnTime = 0;
}

// 页面加载完成后初始化游戏
window.addEventListener('load', init);
