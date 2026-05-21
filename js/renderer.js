let canvas, ctx;
let stars = [];
let particles = [];

function initRenderer() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    initStars();
}

function initStars() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
            x: Math.random() * CANVAS_WIDTH,
            y: Math.random() * CANVAS_HEIGHT,
            size: Math.random() * 2 + 0.5,
            speed: Math.random() * 1.5 + 0.5,
            brightness: Math.random()
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
    }
}

function drawStars() {
    for (const star of stars) {
        ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function createExplosion(x, y, color1, color2, count) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1;
        createParticle(
            x,
            y,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            Math.random() > 0.5 ? color1 : color2,
            Math.random() * 30 + 10,
            Math.random() * 3 + 1
        );
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
        if (p.life <= 0) particles.splice(i, 1);
    }
}

function drawParticles() {
    for (const p of particles) {
        const alpha = p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

function drawPlayer() {
    const isInvincible = Date.now() < player.invincibleUntil;
    const hasShield = Date.now() < player.shieldUntil;

    if (isInvincible && Math.floor(Date.now() / 100) % 2 === 0) {
        ctx.globalAlpha = 0.3;
    }

    const skin = SKINS[selectedSkin] || SKINS.default;
    const asset = getAsset(`player_${selectedSkin}`);

    if (asset) {
        ctx.globalAlpha = skin.opacity || 1;
        ctx.drawImage(asset, player.x, player.y, player.width, player.height);
        ctx.globalAlpha = 1;
    } else {
        drawPlayerFallback(skin);
    }

    if (hasShield) {
        const shieldAlpha = 0.3 + Math.sin(Date.now() / 200) * 0.2;
        ctx.strokeStyle = `rgba(0, 170, 255, ${shieldAlpha})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(
            player.x + player.width / 2,
            player.y + player.height / 2,
            player.width * 0.7,
            0,
            Math.PI * 2
        );
        ctx.stroke();
    }

    ctx.globalAlpha = 1;
}

function drawPlayerFallback(skin) {
    ctx.fillStyle = skin.colors.primary;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.fillStyle = skin.colors.secondary;
    ctx.fillRect(player.x + 5, player.y + 5, player.width - 10, player.height - 10);
    ctx.fillStyle = skin.colors.accent;
    ctx.fillRect(player.x + player.width / 2 - 2, player.y, 4, player.height);
    ctx.fillStyle = skin.colors.core;
    ctx.beginPath();
    ctx.arc(
        player.x + player.width / 2,
        player.y + player.height / 2,
        3,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

function drawBullets() {
    for (const bullet of playerBullets) {
        if (bullet.weaponType === 'laser') {
            const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.3, '#ff00ff');
            grad.addColorStop(1, 'rgba(255,0,255,0)');
            ctx.fillStyle = grad;
            ctx.fillRect(
                bullet.x - bullet.width / 2,
                0,
                bullet.width,
                CANVAS_HEIGHT
            );
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(
                bullet.x - bullet.width / 4,
                0,
                bullet.width / 2,
                CANVAS_HEIGHT
            );
        } else {
            const asset = getAsset(`bullet_${bullet.weaponType}`);
            if (asset) {
                ctx.drawImage(
                    asset,
                    bullet.x - bullet.width / 2,
                    bullet.y,
                    bullet.width,
                    bullet.height
                );
            } else {
                const wpn = WEAPONS[bullet.weaponType] || WEAPONS.vulcan;
                ctx.fillStyle = wpn.color;
                ctx.fillRect(
                    bullet.x - bullet.width / 2,
                    bullet.y,
                    bullet.width,
                    bullet.height
                );
            }
        }
    }

    for (const bullet of enemyBullets) {
        const asset = getAsset('bullet_enemy');
        if (asset) {
            ctx.drawImage(
                asset,
                bullet.x - bullet.width / 2,
                bullet.y,
                bullet.width,
                bullet.height
            );
        } else {
            ctx.fillStyle = '#ff0044';
            ctx.fillRect(
                bullet.x - bullet.width / 2,
                bullet.y,
                bullet.width,
                bullet.height
            );
        }
    }
}

function drawEnemies() {
    for (const enemy of enemies) {
        const asset = getAsset(`enemy_${enemy.type}`);
        if (asset) {
            ctx.drawImage(asset, enemy.x, enemy.y, enemy.width, enemy.height);
        } else {
            drawEnemyFallback(enemy);
        }

        if (enemy.type === 'boss') {
            drawBossHpBar(enemy);
        }
    }
}

function drawEnemyFallback(enemy) {
    const typeDef = ENEMY_TYPES[enemy.type];
    ctx.fillStyle = typeDef.colors.primary;
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    ctx.fillStyle = typeDef.colors.secondary;
    ctx.fillRect(enemy.x + 3, enemy.y + 3, enemy.width - 6, enemy.height - 6);
    ctx.fillStyle = typeDef.colors.core;
    ctx.beginPath();
    ctx.arc(
        enemy.x + enemy.width / 2,
        enemy.y + enemy.height / 2,
        3,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

function drawBossHpBar(enemy) {
    const barWidth = enemy.width;
    const barHeight = 6;
    const barX = enemy.x;
    const barY = enemy.y - 12;
    const hpRatio = enemy.hp / enemy.maxHp;

    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    const grad = ctx.createLinearGradient(barX, 0, barX + barWidth, 0);
    grad.addColorStop(0, '#ff0000');
    grad.addColorStop(0.5, '#ffaa00');
    grad.addColorStop(1, '#00ff00');
    ctx.fillStyle = grad;
    ctx.fillRect(barX, barY, barWidth * hpRatio, barHeight);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
}

function drawItems() {
    for (const item of items) {
        const asset = getAsset(`item_${item.itemType}`);
        if (asset) {
            ctx.drawImage(asset, item.x, item.y, item.width, item.height);
        } else {
            const typeDef = ITEM_TYPES[item.itemType];
            ctx.fillStyle = typeDef.color;
            ctx.shadowColor = typeDef.color;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(
                item.x + item.width / 2,
                item.y + item.height / 2,
                item.width / 2 - 2,
                0,
                Math.PI * 2
            );
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#000000';
            ctx.font = `bold ${item.width * 0.5}px monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(
                typeDef.label,
                item.x + item.width / 2,
                item.y + item.height / 2 + 1
            );
        }
    }
}

function drawScorePopups() {
    for (const popup of scorePopups) {
        const alpha = popup.life / popup.maxLife;
        ctx.fillStyle = `rgba(255, 255, 0, ${alpha})`;
        ctx.font = `bold ${16 + alpha * 4}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`+${popup.value}`, popup.x, popup.y);
    }
}

function drawUnlockNotifications() {
    for (let i = 0; i < unlockNotifications.length; i++) {
        const notif = unlockNotifications[i];
        const alpha = notif.life / notif.maxLife;
        const y = CANVAS_HEIGHT / 2 - i * 40;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#ffaa00';
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#ff6600';
        ctx.shadowBlur = 10;
        ctx.fillText(notif.text, CANVAS_WIDTH / 2, y);
        ctx.shadowBlur = 0;
        ctx.restore();
    }
}

function drawHUD() {
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`分数: ${Math.floor(score)}`, 10, 10);
    ctx.fillText(`最高分: ${highScore}`, 10, 30);
    ctx.fillText(`累计: ${totalScore}`, 10, 50);

    ctx.textAlign = 'right';
    ctx.fillText(`波次: ${waveNumber}`, CANVAS_WIDTH - 10, 10);
    ctx.fillText(
        `武器: ${WEAPONS[player.weapon].name} Lv.${player.weaponLevel}`,
        CANVAS_WIDTH - 10,
        30
    );

    ctx.textAlign = 'left';
    ctx.fillText(`生命: ${player.lives}`, 10, CANVAS_HEIGHT - 30);
    ctx.fillText(`炸弹: ${player.bombs}`, 10, CANVAS_HEIGHT - 50);

    const skin = SKINS[selectedSkin];
    ctx.fillText(`皮肤: ${skin.name}`, 10, 70);
}

function drawStartScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 20;
    ctx.fillText('飞机大战', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 100);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#ffffff';
    ctx.font = '20px monospace';
    ctx.fillText('按空格键开始', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    ctx.fillText(
        '方向键移动 | 空格射击 | B炸弹',
        CANVAS_WIDTH / 2,
        CANVAS_HEIGHT / 2 + 30
    );
    ctx.fillText(
        '鼠标/触摸: 拖动移动+自动射击',
        CANVAS_WIDTH / 2,
        CANVAS_HEIGHT / 2 + 55
    );

    drawSkinSelection();
    drawWeaponSelection();
}

function drawSkinSelection() {
    const unlocked = getUnlockedSkins();
    const y = CANVAS_HEIGHT / 2 + 100;
    const spacing = 80;
    const totalWidth = unlocked.length * spacing;
    const startX = (CANVAS_WIDTH - totalWidth) / 2 + spacing / 2;

    ctx.fillStyle = '#ffffff';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('选择皮肤:', CANVAS_WIDTH / 2, y - 30);

    for (let i = 0; i < unlocked.length; i++) {
        const skinId = unlocked[i];
        const skin = SKINS[skinId];
        const x = startX + i * spacing;
        const isSelected = skinId === selectedSkin;

        if (isSelected) {
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2;
            ctx.strokeRect(x - 24, y - 10, 48, 48);
        }

        const asset = getAsset(`player_${skinId}`);
        if (asset) {
            ctx.globalAlpha = skin.opacity || 1;
            ctx.drawImage(asset, x - 20, y - 6, 40, 44);
            ctx.globalAlpha = 1;
        }

        ctx.fillStyle = isSelected ? '#00ff00' : '#aaaaaa';
        ctx.font = '10px monospace';
        ctx.fillText(skin.name, x, y + 45);
    }
}

function drawWeaponSelection() {
    const unlocked = getUnlockedWeapons();
    const y = CANVAS_HEIGHT / 2 + 190;
    const spacing = 90;
    const totalWidth = unlocked.length * spacing;
    const startX = (CANVAS_WIDTH - totalWidth) / 2 + spacing / 2;

    ctx.fillStyle = '#ffffff';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('选择武器:', CANVAS_WIDTH / 2, y - 20);

    for (let i = 0; i < unlocked.length; i++) {
        const wpnId = unlocked[i];
        const wpn = WEAPONS[wpnId];
        const x = startX + i * spacing;
        const isSelected = wpnId === selectedWeapon;

        if (isSelected) {
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2;
            ctx.strokeRect(x - 35, y - 5, 70, 30);
        }

        ctx.fillStyle = isSelected ? wpn.color : '#888888';
        ctx.font = '12px monospace';
        ctx.fillText(wpn.name, x, y + 10);
    }
}

function drawGameOverScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = '#ff4444';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 20;
    ctx.fillText('游戏结束', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#ffffff';
    ctx.font = '24px monospace';
    ctx.fillText(
        `最终分数: ${Math.floor(score)}`,
        CANVAS_WIDTH / 2,
        CANVAS_HEIGHT / 2 + 10
    );
    ctx.fillText(
        `最高分: ${highScore}`,
        CANVAS_WIDTH / 2,
        CANVAS_HEIGHT / 2 + 40
    );
    ctx.fillText(
        `累计分数: ${totalScore}`,
        CANVAS_WIDTH / 2,
        CANVAS_HEIGHT / 2 + 70
    );

    ctx.font = '18px monospace';
    ctx.fillText(
        '按空格键重新开始',
        CANVAS_WIDTH / 2,
        CANVAS_HEIGHT / 2 + 120
    );
}

function render() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.save();
    if (screenShake.intensity > 0) {
        ctx.translate(screenShake.x, screenShake.y);
    }

    updateStars();
    drawStars();
    drawParticles();

    if (currentState === GAME_STATE.PLAYING) {
        drawItems();
        drawEnemies();
        drawBullets();
        drawPlayer();
        drawScorePopups();
        drawUnlockNotifications();
        drawHUD();
    } else if (currentState === GAME_STATE.START) {
        drawStartScreen();
    } else if (currentState === GAME_STATE.GAME_OVER) {
        drawItems();
        drawEnemies();
        drawBullets();
        drawPlayer();
        drawScorePopups();
        drawUnlockNotifications();
        drawHUD();
        drawGameOverScreen();
    }

    ctx.restore();
}
