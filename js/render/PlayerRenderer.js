const PlayerRenderer = {
    draw(ctx, player, selectedSkin) {
        const isInvincible = player.isInvincible();

        if (isInvincible && Math.floor(Date.now() / 100) % 2 === 0) {
            ctx.globalAlpha = 0.3;
        }

        const skin = SKINS[selectedSkin] || SKINS.default;

        ctx.save();
        ctx.translate(player.getCenterX(), player.getCenterY());

        // 左右倾斜动画
        const tiltAngle = player.tiltAngle || 0;
        ctx.rotate(tiltAngle * Math.PI / 180);

        // 绘制矢量飞机（高精度，无方形边框）
        this.drawVectorPlane(ctx, player, skin);

        // 受击红屏叠加
        if (player.hitFlash > 0) {
            ctx.fillStyle = `rgba(255, 0, 0, ${player.hitFlash})`;
            ctx.fillRect(-player.width / 2, -player.height / 2, player.width, player.height);
            player.hitFlash -= 0.1;
        }

        // 射击时枪管发光
        if (player.isShooting) {
            this.drawMuzzleGlow(ctx, player, skin);
        }

        ctx.restore();

        // 护盾（在飞机外部绘制）
        if (player.hasShield()) {
            const shieldAlpha = 0.3 + Math.sin(Date.now() / 200) * 0.2;
            ctx.strokeStyle = `rgba(0, 170, 255, ${shieldAlpha})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(
                player.getCenterX(),
                player.getCenterY(),
                player.width * 0.7,
                0, Math.PI * 2
            );
            ctx.stroke();
        }

        // 引擎尾焰
        this.drawEngineFlame(ctx, player, skin);

        ctx.globalAlpha = 1;
    },

    drawVectorPlane(ctx, player, skin) {
        const w = player.width;
        const h = player.height;
        const c = skin.colors;

        // 主体机翼 - 流线型战斗机形状
        ctx.fillStyle = c.primary;
        ctx.beginPath();
        ctx.moveTo(0, -h / 2 + 4);
        ctx.lineTo(-w / 2 + 4, h / 2 - 12);
        ctx.lineTo(-w / 2 + 10, h / 2 - 4);
        ctx.lineTo(-w / 4, h / 2 - 8);
        ctx.lineTo(0, h / 2 - 16);
        ctx.lineTo(w / 4, h / 2 - 8);
        ctx.lineTo(w / 2 - 10, h / 2 - 4);
        ctx.lineTo(w / 2 - 4, h / 2 - 12);
        ctx.closePath();
        ctx.fill();

        // 机翼高光边缘
        ctx.strokeStyle = c.accent;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 机身中部
        ctx.fillStyle = c.secondary;
        ctx.beginPath();
        ctx.moveTo(0, -h / 2 + 12);
        ctx.lineTo(-w / 4 + 2, h / 2 - 20);
        ctx.lineTo(w / 4 - 2, h / 2 - 20);
        ctx.closePath();
        ctx.fill();

        // 驾驶舱
        ctx.fillStyle = c.core;
        ctx.beginPath();
        ctx.ellipse(0, -h / 2 + 22, w / 8, h / 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // 驾驶舱发光
        ctx.shadowColor = c.glow;
        ctx.shadowBlur = 8;
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.beginPath();
        ctx.ellipse(-2, -h / 2 + 20, w / 16, h / 16, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // 引擎喷口
        ctx.fillStyle = c.accent;
        ctx.beginPath();
        ctx.ellipse(-w / 4, h / 2 - 6, w / 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(w / 4, h / 2 - 6, w / 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // 机翼装饰线
        ctx.strokeStyle = c.accent;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-w / 2 + 8, h / 2 - 14);
        ctx.lineTo(-w / 4, 0);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(w / 2 - 8, h / 2 - 14);
        ctx.lineTo(w / 4, 0);
        ctx.stroke();

        // 整体外发光
        ctx.shadowColor = c.glow;
        ctx.shadowBlur = 6;
        ctx.strokeStyle = c.glow;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(0, -h / 2 + 4);
        ctx.lineTo(-w / 2 + 4, h / 2 - 12);
        ctx.lineTo(-w / 2 + 10, h / 2 - 4);
        ctx.lineTo(-w / 4, h / 2 - 8);
        ctx.lineTo(0, h / 2 - 16);
        ctx.lineTo(w / 4, h / 2 - 8);
        ctx.lineTo(w / 2 - 10, h / 2 - 4);
        ctx.lineTo(w / 2 - 4, h / 2 - 12);
        ctx.closePath();
        ctx.stroke();
        ctx.shadowBlur = 0;
    },

    drawEngineFlame(ctx, player, skin) {
        const colors = skin.colors.engine;
        const time = Date.now() / 50;

        for (let i = 0; i < 5; i++) {
            const offset = (i - 2) * 6;
            const flameLength = 12 + Math.sin(time + i) * 6 + Math.random() * 4;
            const flameWidth = 4 + Math.sin(time * 1.5 + i) * 2;
            const alpha = 0.7 - i * 0.1;

            const grad = ctx.createLinearGradient(
                player.getCenterX() + offset,
                player.getEngineY(),
                player.getCenterX() + offset,
                player.getEngineY() + flameLength
            );
            grad.addColorStop(0, colors[0]);
            grad.addColorStop(0.5, colors[1]);
            grad.addColorStop(1, 'transparent');

            ctx.fillStyle = grad;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.ellipse(
                player.getCenterX() + offset,
                player.getEngineY() + flameLength / 2,
                flameWidth / 2,
                flameLength / 2,
                0, 0, Math.PI * 2
            );
            ctx.fill();
        }

        // 中心强光
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = colors[3];
        ctx.shadowColor = colors[0];
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(player.getCenterX(), player.getEngineY() + 4, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
    },

    drawMuzzleGlow(ctx, player, skin) {
        const glowColor = skin.colors.glow;
        ctx.globalAlpha = 0.6 + Math.sin(Date.now() / 30) * 0.3;
        ctx.fillStyle = glowColor;
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 15;

        const wpn = WEAPONS[player.weapon];
        const level = wpn.levels[Math.min(player.weaponLevel - 1, wpn.levels.length - 1)];
        const count = level.count || 1;

        for (let i = 0; i < count; i++) {
            const spread = (level.spread || 0) * (Math.PI / 180);
            const angle = count === 1 ? 0 : (i / (count - 1) - 0.5) * spread * 2;
            const offsetX = Math.sin(angle) * 15;
            ctx.beginPath();
            ctx.arc(offsetX, -player.height / 2 - 2, 4, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
    }
};
