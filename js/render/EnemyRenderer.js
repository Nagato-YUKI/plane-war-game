const EnemyRenderer = {
    draw(ctx, enemies) {
        for (const enemy of enemies) {
            const asset = getAsset(`enemy_${enemy.type}`);
            if (asset) {
                ctx.drawImage(asset, enemy.x, enemy.y, enemy.width, enemy.height);
            } else {
                this.drawFallback(ctx, enemy);
            }

            if (enemy.type === 'boss') {
                this.drawBossHpBar(ctx, enemy);
            }
        }
    },

    drawFallback(ctx, enemy) {
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
            3, 0, Math.PI * 2
        );
        ctx.fill();
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
