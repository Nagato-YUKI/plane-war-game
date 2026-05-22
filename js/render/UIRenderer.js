const UIRenderer = {
    drawHUD(ctx, player, difficulty, waveNumber, selectedSkin, selectedWeapon, weaponDurationRatio) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`分数: ${ScoreSystem.getScore()}`, 10, 10);
        ctx.fillText(`最高分: ${ScoreSystem.getHighScore()}`, 10, 30);
        ctx.fillText(`累计: ${ScoreSystem.getTotalScore()}`, 10, 50);

        ctx.textAlign = 'right';
        ctx.fillText(`波次: ${waveNumber}`, CANVAS_WIDTH - 10, 10);
        ctx.fillText(
            `武器: ${WEAPONS[player.weapon].name} Lv.${player.weaponLevel}`,
            CANVAS_WIDTH - 10, 30
        );

        // 武器持续时间条
        if (weaponDurationRatio > 0 && player.weaponLevel > 1) {
            this.drawWeaponDurationBar(ctx, weaponDurationRatio);
        }

        ctx.textAlign = 'left';
        ctx.fillText(`生命: ${player.lives}`, 10, CANVAS_HEIGHT - 30);
        ctx.fillText(`炸弹: ${player.bombs}`, 10, CANVAS_HEIGHT - 50);

        const skin = SKINS[selectedSkin];
        ctx.fillText(`皮肤: ${skin.name}`, 10, 70);

        // 连击显示 - 修复：使用整数
        const combo = ScoreSystem.getComboCount();
        if (combo > 0) {
            const comboAlpha = Math.min(1, combo / 10);
            ctx.fillStyle = `rgba(255, 200, 0, ${comboAlpha})`;
            ctx.font = `bold ${16 + Math.min(combo, 20)}px monospace`;
            ctx.textAlign = 'center';
            ctx.fillText(`${combo}连击!`, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 80);
        }
    },

    drawWeaponDurationBar(ctx, ratio) {
        const barWidth = 120;
        const barHeight = 6;
        const barX = CANVAS_WIDTH - 10 - barWidth;
        const barY = 50;

        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        const r = Math.floor((1 - ratio) * 255);
        const g = Math.floor(ratio * 255);
        ctx.fillStyle = `rgb(${r},${g},0)`;
        ctx.fillRect(barX, barY, barWidth * ratio, barHeight);

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);

        if (ratio < 0.2 && Math.floor(Date.now() / 200) % 2 === 0) {
            ctx.fillStyle = 'rgba(255,0,0,0.3)';
            ctx.fillRect(barX, barY, barWidth, barHeight);
        }
    },

    drawScorePopups(ctx, popups) {
        for (const popup of popups) {
            const alpha = popup.life / popup.maxLife;
            ctx.fillStyle = `rgba(255, 255, 0, ${alpha})`;
            ctx.font = `bold ${16 + alpha * 4}px monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`+${popup.value}`, popup.x, popup.y);
        }
    },

    drawNotifications(ctx, notifications) {
        for (let i = 0; i < notifications.length; i++) {
            const notif = notifications[i];
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
    },

    drawStartScreen(ctx) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 48px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 20;
        ctx.fillText('雷电战机', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 100);
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#ffffff';
        ctx.font = '20px monospace';
        ctx.fillText('按空格键开始', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        ctx.fillText('方向键移动 | 空格射击 | B炸弹', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
        ctx.fillText('鼠标/触摸: 拖动移动+自动射击', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 55);

        this.drawSkinSelection(ctx);
        this.drawWeaponSelection(ctx);
    },

    drawSkinSelection(ctx) {
        const unlocked = getUnlockedSkins();
        const y = CANVAS_HEIGHT / 2 + 100;
        const spacing = 80;
        const totalWidth = unlocked.length * spacing;
        const startX = (CANVAS_WIDTH - totalWidth) / 2 + spacing / 2;
        const currentSkin = GameEngine ? GameEngine.getSelectedSkin() : 'default';

        ctx.fillStyle = '#ffffff';
        ctx.font = '14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('选择皮肤:', CANVAS_WIDTH / 2, y - 30);

        for (let i = 0; i < unlocked.length; i++) {
            const skinId = unlocked[i];
            const skin = SKINS[skinId];
            const x = startX + i * spacing;
            const isSelected = skinId === currentSkin;

            if (isSelected) {
                ctx.strokeStyle = '#00ff00';
                ctx.lineWidth = 2;
                ctx.strokeRect(x - 24, y - 10, 48, 48);
            }

            // 绘制矢量飞机预览
            ctx.save();
            ctx.translate(x, y + 16);
            this.drawSkinPreview(ctx, skin);
            ctx.restore();

            ctx.fillStyle = isSelected ? '#00ff00' : '#aaaaaa';
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            if (skin && skin.name) {
                ctx.fillText(skin.name, x, y + 45);
            }
        }
    },

    drawWeaponSelection(ctx) {
        const unlocked = getUnlockedWeapons();
        const y = CANVAS_HEIGHT / 2 + 190;
        const spacing = 90;
        const totalWidth = unlocked.length * spacing;
        const startX = (CANVAS_WIDTH - totalWidth) / 2 + spacing / 2;
        const currentWeapon = GameEngine ? GameEngine.getSelectedWeapon() : 'vulcan';

        ctx.fillStyle = '#ffffff';
        ctx.font = '14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('选择武器:', CANVAS_WIDTH / 2, y - 20);

        for (let i = 0; i < unlocked.length; i++) {
            const wpnId = unlocked[i];
            const wpn = WEAPONS[wpnId];
            const x = startX + i * spacing;
            const isSelected = wpnId === currentWeapon;

            if (isSelected) {
                ctx.strokeStyle = '#00ff00';
                ctx.lineWidth = 2;
                ctx.strokeRect(x - 35, y - 5, 70, 30);
            }

            ctx.fillStyle = isSelected ? wpn.color : '#888888';
            ctx.font = '12px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(wpn.name, x, y + 10);
        }
    },

    drawSkinPreview(ctx, skin) {
        const w = 36;
        const h = 40;
        const c = skin.colors;

        ctx.globalAlpha = skin.opacity || 1;

        // 主体机翼
        ctx.fillStyle = c.primary;
        ctx.beginPath();
        ctx.moveTo(0, -h / 2 + 2);
        ctx.lineTo(-w / 2 + 2, h / 2 - 8);
        ctx.lineTo(-w / 2 + 6, h / 2 - 2);
        ctx.lineTo(-w / 4, h / 2 - 6);
        ctx.lineTo(0, h / 2 - 10);
        ctx.lineTo(w / 4, h / 2 - 6);
        ctx.lineTo(w / 2 - 6, h / 2 - 2);
        ctx.lineTo(w / 2 - 2, h / 2 - 8);
        ctx.closePath();
        ctx.fill();

        // 机身
        ctx.fillStyle = c.secondary;
        ctx.beginPath();
        ctx.moveTo(0, -h / 2 + 8);
        ctx.lineTo(-w / 6, h / 2 - 12);
        ctx.lineTo(w / 6, h / 2 - 12);
        ctx.closePath();
        ctx.fill();

        // 驾驶舱
        ctx.fillStyle = c.core;
        ctx.beginPath();
        ctx.ellipse(0, -h / 2 + 14, w / 10, h / 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // 外发光
        ctx.shadowColor = c.glow;
        ctx.shadowBlur = 6;
        ctx.strokeStyle = c.glow;
        ctx.lineWidth = 0.5;
        ctx.globalAlpha = 0.5;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
    },

    drawGameOverScreen(ctx) {
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
        ctx.fillText(`最终分数: ${ScoreSystem.getScore()}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);
        ctx.fillText(`最高分: ${ScoreSystem.getHighScore()}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
        ctx.fillText(`累计分数: ${ScoreSystem.getTotalScore()}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 70);

        ctx.font = '18px monospace';
        ctx.fillText('按空格键重新开始', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 120);
    }
};
