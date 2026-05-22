const UIHUD = {
    _time: 0,

    draw(ctx, player, difficulty, waveNumber, selectedSkin, selectedWeapon, weaponDurationRatio) {
        this._time = Date.now();
        this.drawTopBar(ctx, waveNumber, difficulty);
        this.drawLivesBar(ctx, player);
        this.drawBombsBar(ctx, player);
        this.drawWeaponInfo(ctx, player, weaponDurationRatio);
        this.drawBossHPBar(ctx);
        this.drawCombo(ctx);
        this.drawSkinIndicator(ctx, selectedSkin);
    },

    drawTopBar(ctx, waveNumber, difficulty) {
        ctx.save();

        const grad = ctx.createLinearGradient(0, 0, 0, 38);
        grad.addColorStop(0, 'rgba(5,5,20,0.92)');
        grad.addColorStop(1, 'rgba(5,5,20,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, CANVAS_WIDTH, 38);

        ctx.strokeStyle = UI_COLORS.borderDim;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 37);
        ctx.lineTo(CANVAS_WIDTH, 37);
        ctx.stroke();

        ctx.textBaseline = 'middle';

        ctx.font = 'bold 11px "JetBrains Mono", sans-serif';
        ctx.fillStyle = UI_COLORS.cyan;
        ctx.textAlign = 'left';
        ctx.shadowColor = UI_COLORS.cyan;
        ctx.shadowBlur = 4;
        ctx.fillText('\u5206\u6570', 8, 10);
        ctx.shadowBlur = 0;
        ctx.font = 'bold 16px "JetBrains Mono", monospace';
        ctx.fillStyle = UI_COLORS.white;
        ctx.fillText(Math.floor(ScoreSystem.getScore()).toString().padStart(8, '0'), 8, 27);

        ctx.font = 'bold 11px "JetBrains Mono", sans-serif';
        ctx.fillStyle = UI_COLORS.dim;
        ctx.textAlign = 'center';
        ctx.fillText('\u6CE2\u6B21', CANVAS_WIDTH / 2, 10);
        ctx.font = 'bold 20px Orbitron, monospace';
        ctx.fillStyle = UI_COLORS.green;
        ctx.shadowColor = UI_COLORS.green;
        ctx.shadowBlur = 6;
        ctx.fillText(waveNumber.toString(), CANVAS_WIDTH / 2, 27);
        ctx.shadowBlur = 0;

        const diffDef = DIFFICULTY[difficulty] || DIFFICULTY.NORMAL;
        const diffColors = { EASY: UI_COLORS.green, NORMAL: UI_COLORS.cyan, HARD: UI_COLORS.orange, LUNATIC: UI_COLORS.magenta };
        ctx.font = 'bold 9px "JetBrains Mono", sans-serif';
        ctx.fillStyle = diffColors[difficulty] || UI_COLORS.cyan;
        ctx.fillText(diffDef.name, CANVAS_WIDTH / 2, 36);

        ctx.font = 'bold 10px "JetBrains Mono", sans-serif';
        ctx.fillStyle = UI_COLORS.dim;
        ctx.textAlign = 'right';
        ctx.fillText('\u6700\u9AD8\u5206', CANVAS_WIDTH - 8, 10);
        ctx.font = 'bold 14px "JetBrains Mono", monospace';
        ctx.fillStyle = UI_COLORS.orange;
        ctx.shadowColor = UI_COLORS.orange;
        ctx.shadowBlur = 3;
        ctx.fillText(Math.floor(ScoreSystem.getHighScore()).toString().padStart(8, '0'), CANVAS_WIDTH - 8, 27);
        ctx.shadowBlur = 0;

        ctx.restore();
    },

    drawLivesBar(ctx, player) {
        ctx.save();
        const y = CANVAS_HEIGHT - 28;

        ctx.fillStyle = UI_COLORS.bgPanel;
        ctx.fillRect(0, y - 4, 110, 32);
        ctx.strokeStyle = UI_COLORS.borderDim;
        ctx.lineWidth = 1;
        ctx.strokeRect(0, y - 4, 110, 32);

        ctx.font = 'bold 10px "JetBrains Mono", sans-serif';
        ctx.fillStyle = UI_COLORS.dim;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText('\u751F\u547D', 6, y + 4);

        for (let i = 0; i < player.lives; i++) {
            const ix = 48 + i * 16;
            ctx.fillStyle = UI_COLORS.green;
            ctx.shadowColor = UI_COLORS.green;
            ctx.shadowBlur = 3;
            ctx.beginPath();
            ctx.moveTo(ix, y);
            ctx.lineTo(ix - 5, y + 8);
            ctx.lineTo(ix, y + 6);
            ctx.lineTo(ix + 5, y + 8);
            ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        ctx.restore();
    },

    drawBombsBar(ctx, player) {
        ctx.save();
        const y = CANVAS_HEIGHT - 28;
        const startX = 115;

        ctx.fillStyle = UI_COLORS.bgPanel;
        ctx.fillRect(startX, y - 4, 80, 32);
        ctx.strokeStyle = UI_COLORS.borderDim;
        ctx.lineWidth = 1;
        ctx.strokeRect(startX, y - 4, 80, 32);

        ctx.font = 'bold 10px "JetBrains Mono", sans-serif';
        ctx.fillStyle = UI_COLORS.dim;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText('\u70B8\u5F39', startX + 4, y + 4);

        for (let i = 0; i < player.bombs; i++) {
            const ix = startX + 50 + i * 10;
            ctx.fillStyle = UI_COLORS.orange;
            ctx.shadowColor = UI_COLORS.orange;
            ctx.shadowBlur = 2;
            ctx.beginPath();
            ctx.arc(ix, y + 4, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        ctx.restore();
    },

    drawWeaponInfo(ctx, player, weaponDurationRatio) {
        ctx.save();
        const wpn = WEAPONS[player.weapon];
        const y = CANVAS_HEIGHT - 28;
        const x = CANVAS_WIDTH - 140;

        ctx.fillStyle = UI_COLORS.bgPanel;
        ctx.fillRect(x, y - 4, 140, 32);
        ctx.strokeStyle = UI_COLORS.borderDim;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y - 4, 140, 32);

        ctx.font = 'bold 10px "JetBrains Mono", sans-serif';
        ctx.fillStyle = UI_COLORS.dim;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText('\u6B66\u5668', x + 6, y + 2);

        ctx.font = 'bold 12px "JetBrains Mono", monospace';
        ctx.fillStyle = wpn.color || UI_COLORS.cyan;
        ctx.shadowColor = wpn.color || UI_COLORS.cyan;
        ctx.shadowBlur = 3;
        ctx.fillText(`${wpn.name} Lv.${player.weaponLevel}`, x + 44, y + 2);
        ctx.shadowBlur = 0;

        if (weaponDurationRatio > 0 && player.weaponLevel > 1) {
            const barX = x + 6;
            const barY = y + 12;
            const barW = 128;
            const barH = 5;

            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fillRect(barX, barY, barW, barH);

            const r = Math.floor((1 - weaponDurationRatio) * 255);
            const g = Math.floor(weaponDurationRatio * 200);
            ctx.fillStyle = `rgb(${r},${g},0)`;
            ctx.shadowColor = `rgb(${r},${g},0)`;
            ctx.shadowBlur = 3;
            ctx.fillRect(barX, barY, barW * weaponDurationRatio, barH);
            ctx.shadowBlur = 0;

            if (weaponDurationRatio < 0.2 && Math.floor(this._time / 200) % 2 === 0) {
                ctx.fillStyle = 'rgba(255,0,0,0.3)';
                ctx.fillRect(barX, barY, barW, barH);
            }
        }

        ctx.restore();
    },

    drawBossHPBar(ctx) {
        const enemies = EnemyManager.getEnemies();
        let boss = null;
        for (const e of enemies) {
            if (e.type === 'boss') { boss = e; break; }
        }
        if (!boss) return;

        ctx.save();
        const barW = CANVAS_WIDTH - 80;
        const barH = 10;
        const barX = 40;
        const barY = 46;
        const ratio = Math.max(0, boss.hp / boss.maxHp);

        ctx.fillStyle = UI_COLORS.bgPanel;
        ctx.fillRect(barX - 4, barY - 14, barW + 8, barH + 22);
        UICommon.drawHUDBrackets(ctx, barX - 4, barY - 14, barW + 8, barH + 22);

        ctx.font = 'bold 10px "JetBrains Mono", sans-serif';
        ctx.fillStyle = UI_COLORS.red;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = UI_COLORS.red;
        ctx.shadowBlur = 3;
        const bossType = BOSS_TYPES[boss.bossType];
        ctx.fillText(bossType ? bossType.name : 'BOSS', barX, barY - 4);
        ctx.shadowBlur = 0;

        ctx.fillStyle = 'rgba(40,0,0,0.8)';
        ctx.fillRect(barX, barY + 2, barW, barH);

        const hpGrad = ctx.createLinearGradient(barX, 0, barX + barW * ratio, 0);
        hpGrad.addColorStop(0, '#ff3366');
        hpGrad.addColorStop(1, '#ff6644');
        ctx.fillStyle = hpGrad;
        ctx.shadowColor = UI_COLORS.red;
        ctx.shadowBlur = 4;
        ctx.fillRect(barX, barY + 2, barW * ratio, barH);
        ctx.shadowBlur = 0;

        ctx.restore();
    },

    drawCombo(ctx) {
        const combo = ScoreSystem.getComboCount();
        if (combo <= 0) return;

        ctx.save();
        const alpha = Math.min(1, combo / 10);
        const size = 18 + Math.min(combo, 20) * 0.5;
        const y = CANVAS_HEIGHT - 60;

        ctx.font = `bold ${size}px "JetBrains Mono", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.fillStyle = `rgba(255, 200, 0, ${alpha * 0.3})`;
        ctx.shadowColor = '#ff8800';
        ctx.shadowBlur = 8;
        ctx.fillText(`${combo}\u8FDE\u51FB`, CANVAS_WIDTH / 2, y);
        ctx.shadowBlur = 0;

        ctx.fillStyle = `rgba(255, 220, 50, ${alpha})`;
        ctx.fillText(`${combo}\u8FDE\u51FB`, CANVAS_WIDTH / 2, y);

        ctx.restore();
    },

    drawSkinIndicator(ctx, selectedSkin) {
        const skin = SKINS[selectedSkin];
        if (!skin) return;

        ctx.save();
        ctx.font = 'bold 9px "JetBrains Mono", sans-serif';
        ctx.fillStyle = skin.colors.glow || UI_COLORS.dim;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(skin.name, 6, 44);
        ctx.restore();
    },

    drawScorePopups(ctx, popups) {
        for (const popup of popups) {
            const alpha = popup.life / popup.maxLife;
            ctx.save();
            ctx.fillStyle = `rgba(255, 255, 100, ${alpha})`;
            ctx.font = `bold ${14 + alpha * 4}px "JetBrains Mono", monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = 'rgba(255,200,0,0.5)';
            ctx.shadowBlur = 3;
            ctx.fillText(`+${popup.value}`, popup.x, popup.y);
            ctx.shadowBlur = 0;
            ctx.restore();
        }
    },

    drawNotifications(ctx, notifications) {
        for (let i = 0; i < notifications.length; i++) {
            const notif = notifications[i];
            const alpha = notif.life / notif.maxLife;
            const y = CANVAS_HEIGHT / 2 - 40 - i * 36;

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.font = 'bold 18px "JetBrains Mono", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            ctx.fillStyle = UI_COLORS.orange;
            ctx.shadowColor = UI_COLORS.orange;
            ctx.shadowBlur = 8;
            ctx.fillText(notif.text, CANVAS_WIDTH / 2, y);
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 0;
            ctx.fillText(notif.text, CANVAS_WIDTH / 2, y);
            ctx.restore();
        }
    }
};
