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

        ctx.shadowColor = '#ff00ff';
        ctx.shadowBlur = 15;
        ctx.fillStyle = grad;
        ctx.fillRect(bullet.x - bullet.width / 2, 0, bullet.width, CANVAS_HEIGHT);

        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 8;
        ctx.fillRect(bullet.x - bullet.width / 4, 0, bullet.width / 2, CANVAS_HEIGHT);
        ctx.shadowBlur = 0;
    },

    drawRegularPlayerBullet(ctx, bullet) {
        const wpn = WEAPONS[bullet.weaponType] || WEAPONS.vulcan;
        const pulse = 0.8 + Math.sin(Date.now() / 30) * 0.2;

        // 外发光
        ctx.shadowColor = wpn.color;
        ctx.shadowBlur = 12 * pulse;

        // 子弹主体 - 菱形
        ctx.fillStyle = wpn.color;
        ctx.beginPath();
        ctx.moveTo(bullet.x, bullet.y - bullet.height / 2);
        ctx.lineTo(bullet.x + bullet.width / 2, bullet.y);
        ctx.lineTo(bullet.x, bullet.y + bullet.height / 2);
        ctx.lineTo(bullet.x - bullet.width / 2, bullet.y);
        ctx.closePath();
        ctx.fill();

        // 核心高光
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.width / 4, 0, Math.PI * 2);
        ctx.fill();

        // 子弹拖尾 - 渐变长度
        const trailLength = bullet.height * 2;
        const trailGrad = ctx.createLinearGradient(
            bullet.x, bullet.y,
            bullet.x, bullet.y + trailLength
        );
        trailGrad.addColorStop(0, wpn.color);
        trailGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = trailGrad;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.moveTo(bullet.x, bullet.y + bullet.height / 2);
        ctx.lineTo(bullet.x + bullet.width / 4, bullet.y + trailLength);
        ctx.lineTo(bullet.x - bullet.width / 4, bullet.y + trailLength);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
    },

    drawEnemyBullets(ctx, bullets) {
        for (const bullet of bullets) {
            const pulse = 0.8 + Math.sin(Date.now() / 40 + bullet.x * 0.01) * 0.2;

            // 拖尾效果
            if (bullet.trail && bullet.trail.length > 1) {
                this.drawBulletTrail(ctx, bullet);
            }

            // 外发光 - 脉冲效果
            ctx.shadowColor = bullet.color || '#ff0044';
            ctx.shadowBlur = 12 * pulse;

            // 子弹主体 - 根据类型绘制不同形状
            const size = (bullet.width / 2 + 1) * pulse;
            ctx.fillStyle = bullet.color || '#ff0044';

            if (bullet.shape === 'diamond') {
                ctx.beginPath();
                ctx.moveTo(bullet.x, bullet.y - size);
                ctx.lineTo(bullet.x + size, bullet.y);
                ctx.lineTo(bullet.x, bullet.y + size);
                ctx.lineTo(bullet.x - size, bullet.y);
                ctx.closePath();
                ctx.fill();
            } else if (bullet.shape === 'square') {
                ctx.fillRect(bullet.x - size, bullet.y - size, size * 2, size * 2);
            } else if (bullet.shape === 'star') {
                this.drawStar(ctx, bullet.x, bullet.y, 5, size, size * 0.5);
            } else {
                // 默认圆形
                ctx.beginPath();
                ctx.arc(bullet.x, bullet.y, size, 0, Math.PI * 2);
                ctx.fill();
            }

            // 核心高光
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 4;
            ctx.beginPath();
            ctx.arc(bullet.x - 1, bullet.y - 1, size * 0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    },

    drawBulletTrail(ctx, bullet) {
        const maxTrailLen = bullet.trail.length;
        for (let i = 0; i < maxTrailLen - 1; i++) {
            const alpha = (i / maxTrailLen) * 0.5;
            const width = bullet.width * (i / maxTrailLen) * 0.8;

            const grad = ctx.createLinearGradient(
                bullet.trail[i].x, bullet.trail[i].y,
                bullet.trail[i + 1].x, bullet.trail[i + 1].y
            );
            grad.addColorStop(0, bullet.color || '#ff0044');
            grad.addColorStop(1, 'transparent');

            ctx.strokeStyle = grad;
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
    },

    drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.fill();
    }
};
