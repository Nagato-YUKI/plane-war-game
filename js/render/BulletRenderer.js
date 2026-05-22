const BulletRenderer = {
    draw(ctx, playerBullets, enemyBullets) {
        this.drawPlayerBullets(ctx, playerBullets);
        this.drawEnemyBullets(ctx, enemyBullets);
    },

    drawPlayerBullets(ctx, bullets) {
        for (const bullet of bullets) {
            if (bullet.weaponType === 'laser') {
                this.drawLaser(ctx, bullet);
            } else {
                this.drawRegularPlayerBullet(ctx, bullet);
            }
        }
    },

    drawLaser(ctx, bullet) {
        const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, '#ff00ff');
        grad.addColorStop(1, 'rgba(255,0,255,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(bullet.x - bullet.width / 2, 0, bullet.width, CANVAS_HEIGHT);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(bullet.x - bullet.width / 4, 0, bullet.width / 2, CANVAS_HEIGHT);
    },

    drawRegularPlayerBullet(ctx, bullet) {
        const wpn = WEAPONS[bullet.weaponType] || WEAPONS.vulcan;
        ctx.fillStyle = wpn.color;
        ctx.shadowColor = wpn.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y + bullet.height / 2, bullet.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // 子弹拖尾
        ctx.fillStyle = wpn.color;
        ctx.globalAlpha = 0.5;
        ctx.fillRect(bullet.x - bullet.width / 4, bullet.y, bullet.width / 2, bullet.height);
        ctx.globalAlpha = 1;
    },

    drawEnemyBullets(ctx, bullets) {
        for (const bullet of bullets) {
            // 拖尾效果
            if (bullet.trail && bullet.trail.length > 1) {
                this.drawBulletTrail(ctx, bullet);
            }

            // 发光效果
            ctx.shadowColor = bullet.color || '#ff0044';
            ctx.shadowBlur = 10;

            // 子弹主体
            ctx.fillStyle = bullet.color || '#ff0044';
            ctx.beginPath();
            ctx.arc(bullet.x, bullet.y, bullet.width / 2 + 1, 0, Math.PI * 2);
            ctx.fill();

            // 核心高光
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.arc(bullet.x - 1, bullet.y - 1, bullet.width / 4, 0, Math.PI * 2);
            ctx.fill();
        }
    },

    drawBulletTrail(ctx, bullet) {
        for (let i = 0; i < bullet.trail.length - 1; i++) {
            const alpha = (i / bullet.trail.length) * 0.6;
            const width = bullet.width * (i / bullet.trail.length);

            ctx.strokeStyle = bullet.color || '#ff0044';
            ctx.globalAlpha = alpha;
            ctx.lineWidth = width;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(bullet.trail[i].x, bullet.trail[i].y);
            ctx.lineTo(bullet.trail[i + 1].x, bullet.trail[i + 1].y);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
        ctx.lineCap = 'butt';
    }
};
