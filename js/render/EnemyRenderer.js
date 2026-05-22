const EnemyRenderer = {
    draw(ctx, enemies) {
        for (const enemy of enemies) {
            ctx.save();
            ctx.translate(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);

            // 入场动画缩放
            if (enemy.entryAnimation) {
                const scale = 0.5 + enemy.entryProgress * 0.5;
                ctx.scale(scale, scale);
            }

            // 被击中闪烁
            if (enemy.hitFlash > 0) {
                ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 20) * 0.5;
            }

            // 绘制矢量敌人（无方形边框）
            this.drawVectorEnemy(ctx, enemy);

            // 射击时武器发光
            if (enemy.isShooting) {
                this.drawWeaponGlow(ctx, enemy);
            }

            ctx.restore();

            if (enemy.type === 'boss') {
                this.drawBossHpBar(ctx, enemy);
            }
        }
    },

    drawVectorEnemy(ctx, enemy) {
        const typeDef = ENEMY_TYPES[enemy.type] || BOSS_TYPES[enemy.bossType];
        if (!typeDef) return;

        const w = enemy.width;
        const h = enemy.height;
        const c = typeDef.colors;

        if (enemy.type === 'drone') {
            // 小型无人机 - 三角翼设计
            ctx.fillStyle = c.primary;
            ctx.beginPath();
            ctx.moveTo(0, h / 2 - 2);
            ctx.lineTo(-w / 2 + 2, -h / 2 + 10);
            ctx.lineTo(-w / 4, -h / 2 + 4);
            ctx.lineTo(0, -h / 2 + 2);
            ctx.lineTo(w / 4, -h / 2 + 4);
            ctx.lineTo(w / 2 - 2, -h / 2 + 10);
            ctx.closePath();
            ctx.fill();

            // 核心发光
            ctx.shadowColor = c.glow;
            ctx.shadowBlur = 10;
            ctx.fillStyle = c.core;
            ctx.beginPath();
            ctx.arc(0, -h / 2 + 14, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

        } else if (enemy.type === 'fighter') {
            // 中型战斗机 - 宽翼设计
            ctx.fillStyle = c.primary;
            ctx.beginPath();
            ctx.moveTo(0, h / 2 - 2);
            ctx.lineTo(-w / 2 + 2, -h / 2 + 14);
            ctx.lineTo(-w / 4, -h / 2 + 6);
            ctx.lineTo(0, -h / 2 + 2);
            ctx.lineTo(w / 4, -h / 2 + 6);
            ctx.lineTo(w / 2 - 2, -h / 2 + 14);
            ctx.closePath();
            ctx.fill();

            // 机身
            ctx.fillStyle = c.secondary;
            ctx.beginPath();
            ctx.moveTo(0, h / 2 - 8);
            ctx.lineTo(-w / 6, -h / 2 + 10);
            ctx.lineTo(w / 6, -h / 2 + 10);
            ctx.closePath();
            ctx.fill();

            // 核心
            ctx.shadowColor = c.glow;
            ctx.shadowBlur = 8;
            ctx.fillStyle = c.core;
            ctx.beginPath();
            ctx.arc(0, -h / 2 + 12, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

        } else if (enemy.type === 'bomber') {
            // 重型轰炸机 -  bulky设计
            ctx.fillStyle = c.primary;
            ctx.beginPath();
            ctx.moveTo(0, h / 2 - 4);
            ctx.lineTo(-w / 2 + 4, -h / 2 + 18);
            ctx.lineTo(-w / 3, -h / 2 + 8);
            ctx.lineTo(0, -h / 2 + 2);
            ctx.lineTo(w / 3, -h / 2 + 8);
            ctx.lineTo(w / 2 - 4, -h / 2 + 18);
            ctx.closePath();
            ctx.fill();

            // 装甲板
            ctx.fillStyle = c.secondary;
            ctx.fillRect(-w / 4, -h / 2 + 12, w / 2, h / 3);

            // 多个核心
            ctx.shadowColor = c.glow;
            ctx.shadowBlur = 10;
            ctx.fillStyle = c.core;
            ctx.beginPath();
            ctx.arc(-w / 6, -h / 2 + 16, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(w / 6, -h / 2 + 16, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

        } else if (enemy.type === 'elite') {
            // 精英战机 - 尖锐设计
            ctx.fillStyle = c.primary;
            ctx.beginPath();
            ctx.moveTo(0, h / 2 - 2);
            ctx.lineTo(-w / 2 + 2, -h / 2 + 8);
            ctx.lineTo(-w / 2 + 8, -h / 2 + 2);
            ctx.lineTo(0, -h / 2 + 2);
            ctx.lineTo(w / 2 - 8, -h / 2 + 2);
            ctx.lineTo(w / 2 - 2, -h / 2 + 8);
            ctx.closePath();
            ctx.fill();

            // 翼刃
            ctx.strokeStyle = c.accent;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-w / 2 + 6, -h / 2 + 6);
            ctx.lineTo(-w / 4, h / 2 - 6);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(w / 2 - 6, -h / 2 + 6);
            ctx.lineTo(w / 4, h / 2 - 6);
            ctx.stroke();

            // 核心
            ctx.shadowColor = c.glow;
            ctx.shadowBlur = 12;
            ctx.fillStyle = c.core;
            ctx.beginPath();
            ctx.arc(0, -h / 2 + 14, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

        } else if (enemy.type === 'boss') {
            this.drawVectorBoss(ctx, enemy, typeDef);
        }

        // 外发光效果
        ctx.shadowColor = c.glow;
        ctx.shadowBlur = 4;
        ctx.strokeStyle = c.glow;
        ctx.lineWidth = 0.5;
        ctx.globalAlpha = 0.3;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
    },

    drawVectorBoss(ctx, enemy, typeDef) {
        const w = enemy.width;
        const h = enemy.height;
        const c = typeDef.colors;

        // Boss主体 - 巨大装甲
        ctx.fillStyle = c.primary;
        ctx.beginPath();
        ctx.moveTo(0, h / 2 - 4);
        ctx.lineTo(-w / 2 + 8, -h / 2 + 28);
        ctx.lineTo(-w / 2 + 18, -h / 2 + 10);
        ctx.lineTo(-w / 4, -h / 2 + 2);
        ctx.lineTo(0, -h / 2 + 2);
        ctx.lineTo(w / 4, -h / 2 + 2);
        ctx.lineTo(w / 2 - 18, -h / 2 + 10);
        ctx.lineTo(w / 2 - 8, -h / 2 + 28);
        ctx.closePath();
        ctx.fill();

        // 装甲板
        ctx.fillStyle = c.secondary;
        ctx.beginPath();
        ctx.moveTo(0, h / 2 - 20);
        ctx.lineTo(-w / 3, -h / 2 + 24);
        ctx.lineTo(w / 3, -h / 2 + 24);
        ctx.closePath();
        ctx.fill();

        // 主炮
        ctx.fillStyle = c.accent;
        ctx.fillRect(-8, h / 2 - 12, 16, 10);

        // 核心眼
        ctx.shadowColor = c.glow;
        ctx.shadowBlur = 15;
        ctx.fillStyle = c.core;
        ctx.beginPath();
        ctx.arc(0, -h / 2 + 36, 12, 0, Math.PI * 2);
        ctx.fill();

        // 瞳孔
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(0, -h / 2 + 36, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // 侧翼炮塔
        ctx.fillStyle = c.accent;
        ctx.beginPath();
        ctx.arc(-w / 3, -h / 2 + 20, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(w / 3, -h / 2 + 20, 6, 0, Math.PI * 2);
        ctx.fill();
    },

    drawWeaponGlow(ctx, enemy) {
        const typeDef = ENEMY_TYPES[enemy.type] || BOSS_TYPES[enemy.bossType];
        if (!typeDef) return;

        const glowColor = typeDef.colors.glow;
        ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 40) * 0.3;
        ctx.fillStyle = glowColor;
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 12;

        ctx.beginPath();
        ctx.arc(0, enemy.height / 2, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
    },

    drawBossHpBar(ctx, enemy) {
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
};
