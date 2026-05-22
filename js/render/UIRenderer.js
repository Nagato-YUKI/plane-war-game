const UI_COLORS = {
    cyan: '#00ffff',
    green: '#00ff88',
    magenta: '#ff00ff',
    orange: '#ff8800',
    red: '#ff3366',
    white: '#e8ecf0',
    dim: '#5a6a7a',
    bgDark: 'rgba(5,5,15,0.85)',
    bgPanel: 'rgba(10,15,30,0.75)',
    borderGlow: 'rgba(0,255,255,0.4)',
    borderDim: 'rgba(0,255,255,0.15)'
};

const UIRenderer = {
    _time: 0,
    _showLeaderboard: false,
    _inputBuffer: '',
    _inputActive: false,

    drawHUD(ctx, player, difficulty, waveNumber, selectedSkin, selectedWeapon, weaponDurationRatio) {
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
        this.drawHUDBrackets(ctx, barX - 4, barY - 14, barW + 8, barH + 22);

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

    drawHUDBrackets(ctx, x, y, w, h) {
        ctx.strokeStyle = UI_COLORS.cyan;
        ctx.lineWidth = 1;
        ctx.shadowColor = UI_COLORS.cyan;
        ctx.shadowBlur = 2;
        const c = 6;
        ctx.beginPath();
        ctx.moveTo(x, y + c); ctx.lineTo(x, y); ctx.lineTo(x + c, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + w - c, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + c);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y + h - c); ctx.lineTo(x, y + h); ctx.lineTo(x + c, y + h);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + w - c, y + h); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w, y + h - c);
        ctx.stroke();
        ctx.shadowBlur = 0;
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
    },

    drawStartScreen(ctx) {
        this._time = Date.now();

        if (this._showLeaderboard) {
            this.drawLeaderboardScreen(ctx);
            return;
        }

        ctx.fillStyle = 'rgba(5, 5, 15, 0.85)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        this.drawVignette(ctx);

        this.drawTitleSection(ctx);
        this.drawPlayerIdInput(ctx);
        this.drawDifficultySelection(ctx);
        this.drawSkinSelection(ctx);
        this.drawWeaponSelection(ctx);
        this.drawControlsInfo(ctx);
    },

    drawTitleSection(ctx) {
        const cx = CANVAS_WIDTH / 2;
        const cy = 68;
        const pulse = Math.sin(this._time / 600) * 0.15 + 0.85;

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.font = '900 36px Orbitron, monospace';
        ctx.fillStyle = `rgba(0, 255, 255, ${pulse})`;
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 16;
        ctx.fillText('RAIDEN', cx, cy);
        ctx.shadowBlur = 0;

        ctx.font = '400 14px Orbitron, monospace';
        ctx.fillStyle = `rgba(0, 255, 136, ${pulse * 0.9})`;
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 8;
        ctx.fillText('FIGHTER', cx, cy + 26);
        ctx.shadowBlur = 0;

        const lineY = cy + 42;
        ctx.strokeStyle = `rgba(0, 255, 255, ${pulse * 0.5})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx - 100, lineY);
        ctx.lineTo(cx + 100, lineY);
        ctx.stroke();

        const blink = Math.floor(this._time / 800) % 2;
        if (blink) {
            ctx.font = 'bold 12px "JetBrains Mono", sans-serif';
            ctx.fillStyle = UI_COLORS.white;
            ctx.fillText('\u6309\u7A7A\u683C\u952E\u5F00\u59CB', cx, cy + 58);
        }

        ctx.restore();
    },

    drawPlayerIdInput(ctx) {
        const cx = CANVAS_WIDTH / 2;
        const y = 148;
        const isInputting = InputHandler.isInputActive();
        const currentId = isInputting ? InputHandler._inputBuffer : LeaderboardSystem.getPlayerId();

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.font = 'bold 10px "JetBrains Mono", sans-serif';
        ctx.fillStyle = UI_COLORS.dim;
        ctx.fillText('\u73A9\u5BB6ID', cx, y - 14);

        const boxW = 160;
        const boxH = 24;
        const boxX = cx - boxW / 2;

        ctx.strokeStyle = isInputting ? UI_COLORS.green : (currentId ? UI_COLORS.cyan : UI_COLORS.borderDim);
        ctx.lineWidth = isInputting ? 2 : 1;
        if (isInputting || currentId) {
            ctx.shadowColor = isInputting ? UI_COLORS.green : UI_COLORS.cyan;
            ctx.shadowBlur = isInputting ? 6 : 3;
        }
        ctx.strokeRect(boxX, y - 2, boxW, boxH);
        ctx.shadowBlur = 0;

        if (currentId || isInputting) {
            ctx.fillStyle = isInputting ? 'rgba(0,255,136,0.08)' : 'rgba(0,255,255,0.06)';
            ctx.fillRect(boxX + 1, y - 1, boxW - 2, boxH - 2);
        }

        ctx.font = 'bold 14px "JetBrains Mono", monospace';
        ctx.fillStyle = isInputting ? UI_COLORS.green : (currentId ? UI_COLORS.cyan : '#3a4a5a');
        const displayText = currentId || '\u70B9\u51FB\u8F93\u5165ID';
        const cursor = (isInputting && Math.floor(this._time / 400) % 2) ? '_' : '';
        ctx.fillText(displayText + cursor, cx, y + 10);

        ctx.font = 'bold 9px "JetBrains Mono", sans-serif';
        ctx.fillStyle = UI_COLORS.orange;
        ctx.fillText('\u70B9\u51FB\u8F93\u5165 / Tab\u5207\u6362\u6392\u884C\u699C', cx, y + 30);

        ctx.restore();
    },

    drawDifficultySelection(ctx) {
        const cx = CANVAS_WIDTH / 2;
        const y = 206;
        const keys = Object.keys(DIFFICULTY);
        const currentDiff = GameEngine ? GameEngine.getDifficulty() : 'NORMAL';
        const spacing = 90;

        ctx.save();
        ctx.font = 'bold 10px "JetBrains Mono", sans-serif';
        ctx.fillStyle = UI_COLORS.dim;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('\u96BE\u5EA6\u9009\u62E9', cx, y - 14);

        const diffColors = {
            EASY: UI_COLORS.green,
            NORMAL: UI_COLORS.cyan,
            HARD: UI_COLORS.orange,
            LUNATIC: UI_COLORS.magenta
        };

        for (let i = 0; i < keys.length; i++) {
            const diff = DIFFICULTY[keys[i]];
            const dx = cx + (i - 1.5) * spacing;
            const isSelected = keys[i] === currentDiff;

            if (isSelected) {
                ctx.strokeStyle = diffColors[keys[i]] || UI_COLORS.cyan;
                ctx.lineWidth = 1;
                ctx.shadowColor = diffColors[keys[i]] || UI_COLORS.cyan;
                ctx.shadowBlur = 4;
                ctx.strokeRect(dx - 36, y - 4, 72, 22);
                ctx.shadowBlur = 0;
                ctx.fillStyle = `rgba(${this.hexToRgb(diffColors[keys[i]])}, 0.1)`;
                ctx.fillRect(dx - 36, y - 4, 72, 22);
            }

            ctx.font = isSelected ? 'bold 12px "JetBrains Mono", sans-serif' : '11px "JetBrains Mono", sans-serif';
            ctx.fillStyle = isSelected ? (diffColors[keys[i]] || UI_COLORS.cyan) : UI_COLORS.dim;
            ctx.fillText(diff.name, dx, y + 7);
        }

        ctx.restore();
    },

    hexToRgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `${r},${g},${b}`;
    },

    drawSkinSelection(ctx) {
        const unlocked = getUnlockedSkins();
        const y = 256;
        const spacing = 75;
        const totalWidth = unlocked.length * spacing;
        const startX = (CANVAS_WIDTH - totalWidth) / 2 + spacing / 2;
        const currentSkin = GameEngine ? GameEngine.getSelectedSkin() : 'default';

        ctx.save();
        ctx.font = 'bold 10px "JetBrains Mono", sans-serif';
        ctx.fillStyle = UI_COLORS.dim;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('\u9009\u62E9\u76AE\u80A4', CANVAS_WIDTH / 2, y - 18);

        for (let i = 0; i < unlocked.length; i++) {
            const skinId = unlocked[i];
            const skin = SKINS[skinId];
            if (!skin) continue;
            const x = startX + i * spacing;
            const isSelected = skinId === currentSkin;

            if (isSelected) {
                ctx.strokeStyle = skin.colors.glow || UI_COLORS.cyan;
                ctx.lineWidth = 1;
                ctx.shadowColor = skin.colors.glow || UI_COLORS.cyan;
                ctx.shadowBlur = 4;
                this.drawChamferedRect(ctx, x - 26, y - 10, 52, 52, 4);
                ctx.stroke();
                ctx.shadowBlur = 0;
                ctx.fillStyle = `rgba(${this.hexToRgb(skin.colors.glow || '#00ffff')}, 0.08)`;
                this.drawChamferedRect(ctx, x - 26, y - 10, 52, 52, 4);
                ctx.fill();
            } else {
                ctx.strokeStyle = UI_COLORS.borderDim;
                ctx.lineWidth = 1;
                this.drawChamferedRect(ctx, x - 26, y - 10, 52, 52, 4);
                ctx.stroke();
            }

            ctx.save();
            ctx.translate(x, y + 14);
            this.drawSkinPreview(ctx, skin);
            ctx.restore();

            ctx.fillStyle = isSelected ? (skin.colors.glow || UI_COLORS.cyan) : UI_COLORS.dim;
            ctx.font = isSelected ? 'bold 9px "JetBrains Mono", sans-serif' : '9px "JetBrains Mono", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(skin.name, x, y + 48);
        }

        ctx.restore();
    },

    drawWeaponSelection(ctx) {
        const unlocked = getUnlockedWeapons();
        const y = 340;
        const spacing = 120;
        const totalWidth = unlocked.length * spacing;
        const startX = (CANVAS_WIDTH - totalWidth) / 2 + spacing / 2;
        const currentWeapon = GameEngine ? GameEngine.getSelectedWeapon() : 'vulcan';

        ctx.save();
        ctx.font = 'bold 10px "JetBrains Mono", sans-serif';
        ctx.fillStyle = UI_COLORS.dim;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('\u9009\u62E9\u6B66\u5668', CANVAS_WIDTH / 2, y - 14);

        for (let i = 0; i < unlocked.length; i++) {
            const wpnId = unlocked[i];
            const wpn = WEAPONS[wpnId];
            if (!wpn) continue;
            const x = startX + i * spacing;
            const isSelected = wpnId === currentWeapon;

            if (isSelected) {
                ctx.strokeStyle = wpn.color || UI_COLORS.cyan;
                ctx.lineWidth = 1;
                ctx.shadowColor = wpn.color || UI_COLORS.cyan;
                ctx.shadowBlur = 4;
                this.drawChamferedRect(ctx, x - 48, y - 2, 96, 30, 4);
                ctx.stroke();
                ctx.shadowBlur = 0;
                ctx.fillStyle = `rgba(${this.hexToRgb(wpn.color || '#00ffff')}, 0.08)`;
                this.drawChamferedRect(ctx, x - 48, y - 2, 96, 30, 4);
                ctx.fill();
            } else {
                ctx.strokeStyle = UI_COLORS.borderDim;
                ctx.lineWidth = 1;
                this.drawChamferedRect(ctx, x - 48, y - 2, 96, 30, 4);
                ctx.stroke();
            }

            ctx.fillStyle = isSelected ? (wpn.color || UI_COLORS.cyan) : UI_COLORS.dim;
            ctx.font = isSelected ? 'bold 12px "JetBrains Mono", sans-serif' : '11px "JetBrains Mono", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(wpn.name, x, y + 13);
        }

        ctx.restore();
    },

    drawControlsInfo(ctx) {
        const cx = CANVAS_WIDTH / 2;
        const y = 400;

        ctx.save();
        ctx.strokeStyle = UI_COLORS.borderDim;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(40, y - 8);
        ctx.lineTo(CANVAS_WIDTH - 40, y - 8);
        ctx.stroke();

        ctx.font = '11px "JetBrains Mono", sans-serif';
        ctx.fillStyle = UI_COLORS.dim;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.fillText('WASD/\u65B9\u5411\u952E:\u79FB\u52A8 | \u7A7A\u683C:\u5C04\u51FB | B:\u70B8\u5F39', cx, y + 8);
        ctx.fillText('\u9F20\u6807/\u89E6\u6478:\u62D6\u52A8\u79FB\u52A8+\u81EA\u52A8\u5C04\u51FB', cx, y + 24);

        const total = ScoreSystem.getTotalScore();
        ctx.font = 'bold 11px "JetBrains Mono", sans-serif';
        ctx.fillStyle = UI_COLORS.orange;
        ctx.fillText(`\u7D2F\u8BA1\u5206\u6570: ${Math.floor(total)}`, cx, y + 46);

        ctx.restore();
    },

    drawChamferedRect(ctx, x, y, w, h, c) {
        ctx.beginPath();
        ctx.moveTo(x + c, y);
        ctx.lineTo(x + w - c, y);
        ctx.lineTo(x + w, y + c);
        ctx.lineTo(x + w, y + h - c);
        ctx.lineTo(x + w - c, y + h);
        ctx.lineTo(x + c, y + h);
        ctx.lineTo(x, y + h - c);
        ctx.lineTo(x, y + c);
        ctx.closePath();
    },

    drawSkinPreview(ctx, skin) {
        if (!skin || !skin.colors) return;
        const w = 36;
        const h = 40;
        const c = skin.colors;

        ctx.globalAlpha = skin.opacity || 1;

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

        ctx.fillStyle = c.secondary;
        ctx.beginPath();
        ctx.moveTo(0, -h / 2 + 8);
        ctx.lineTo(-w / 6, h / 2 - 12);
        ctx.lineTo(w / 6, h / 2 - 12);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = c.core;
        ctx.beginPath();
        ctx.ellipse(0, -h / 2 + 14, w / 10, h / 12, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowColor = c.glow;
        ctx.shadowBlur = 4;
        ctx.strokeStyle = c.glow;
        ctx.lineWidth = 0.5;
        ctx.globalAlpha = 0.5;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
    },

    drawGameOverScreen(ctx) {
        this._time = Date.now();

        ctx.fillStyle = 'rgba(20, 0, 0, 0.85)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        this.drawVignette(ctx, '#ff3366');

        const cx = CANVAS_WIDTH / 2;
        const pulse = Math.sin(this._time / 400) * 0.2 + 0.8;

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.font = 'bold 32px "JetBrains Mono", sans-serif';
        ctx.fillStyle = `rgba(255, 51, 102, ${pulse})`;
        ctx.shadowColor = '#ff3366';
        ctx.shadowBlur = 16;
        ctx.fillText('\u6E38\u620F\u7ED3\u675F', cx, 120);
        ctx.shadowBlur = 0;

        const panelX = cx - 140;
        const panelY = 155;
        const panelW = 280;
        const panelH = 180;

        ctx.fillStyle = 'rgba(10, 5, 15, 0.8)';
        this.drawChamferedRect(ctx, panelX, panelY, panelW, panelH, 6);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 51, 102, 0.4)';
        ctx.lineWidth = 1;
        ctx.shadowColor = 'rgba(255, 51, 102, 0.3)';
        ctx.shadowBlur = 3;
        this.drawChamferedRect(ctx, panelX, panelY, panelW, panelH, 6);
        ctx.stroke();
        ctx.shadowBlur = 0;
        this.drawHUDBrackets(ctx, panelX + 4, panelY + 4, panelW - 8, panelH - 8);

        const stats = [
            { label: '\u5206\u6570', value: Math.floor(ScoreSystem.getScore()), color: UI_COLORS.cyan },
            { label: '\u6700\u9AD8\u5206', value: Math.floor(ScoreSystem.getHighScore()), color: UI_COLORS.orange },
            { label: '\u7D2F\u8BA1', value: Math.floor(ScoreSystem.getTotalScore()), color: UI_COLORS.green }
        ];

        stats.forEach((s, i) => {
            const sy = panelY + 24 + i * 44;

            ctx.font = 'bold 10px "JetBrains Mono", sans-serif';
            ctx.fillStyle = UI_COLORS.dim;
            ctx.textAlign = 'left';
            ctx.fillText(s.label, panelX + 20, sy);

            ctx.font = 'bold 18px "JetBrains Mono", monospace';
            ctx.fillStyle = s.color;
            ctx.shadowColor = s.color;
            ctx.shadowBlur = 3;
            ctx.textAlign = 'right';
            ctx.fillText(s.value.toString().padStart(8, '0'), panelX + panelW - 20, sy);
            ctx.shadowBlur = 0;

            if (i < stats.length - 1) {
                ctx.strokeStyle = UI_COLORS.borderDim;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(panelX + 16, sy + 18);
                ctx.lineTo(panelX + panelW - 16, sy + 18);
                ctx.stroke();
            }
        });

        const rank = LeaderboardSystem.getPlayerRank(Math.floor(ScoreSystem.getScore()));
        if (rank > 0) {
            ctx.font = 'bold 12px "JetBrains Mono", sans-serif';
            ctx.fillStyle = UI_COLORS.magenta;
            ctx.shadowColor = UI_COLORS.magenta;
            ctx.shadowBlur = 4;
            ctx.textAlign = 'center';
            ctx.fillText(`\u6392\u884C\u699C\u7B2C ${rank} \u540D`, cx, panelY + panelH + 22);
            ctx.shadowBlur = 0;
        }

        const blink = Math.floor(this._time / 600) % 2;
        if (blink) {
            ctx.font = 'bold 12px "JetBrains Mono", sans-serif';
            ctx.fillStyle = UI_COLORS.white;
            ctx.textAlign = 'center';
            ctx.fillText('\u6309\u7A7A\u683C\u952E\u91CD\u65B0\u5F00\u59CB', cx, panelY + panelH + 48);
        }

        ctx.restore();
    },

    drawLeaderboardScreen(ctx) {
        this._time = Date.now();

        ctx.fillStyle = 'rgba(5, 5, 15, 0.92)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        this.drawVignette(ctx);

        const cx = CANVAS_WIDTH / 2;

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.font = 'bold 22px "JetBrains Mono", sans-serif';
        ctx.fillStyle = UI_COLORS.orange;
        ctx.shadowColor = UI_COLORS.orange;
        ctx.shadowBlur = 8;
        ctx.fillText('\u6392\u884C\u699C', cx, 30);
        ctx.shadowBlur = 0;

        const records = LeaderboardSystem.getLeaderboard();
        const panelX = 30;
        const panelY = 50;
        const panelW = CANVAS_WIDTH - 60;
        const rowH = 26;
        const maxShow = Math.min(records.length, 12);
        const panelH = maxShow * rowH + 30;

        ctx.fillStyle = 'rgba(10,15,30,0.8)';
        ctx.fillRect(panelX, panelY, panelW, panelH);
        this.drawHUDBrackets(ctx, panelX, panelY, panelW, panelH);

        ctx.font = 'bold 9px "JetBrains Mono", sans-serif';
        ctx.fillStyle = UI_COLORS.dim;
        ctx.textAlign = 'left';
        ctx.fillText('\u6392\u540D', panelX + 10, panelY + 12);
        ctx.fillText('\u73A9\u5BB6', panelX + 50, panelY + 12);
        ctx.fillText('\u5206\u6570', panelX + 170, panelY + 12);
        ctx.fillText('\u96BE\u5EA6', panelX + 270, panelY + 12);
        ctx.fillText('\u6CE2\u6B21', panelX + 330, panelY + 12);

        ctx.strokeStyle = UI_COLORS.borderDim;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(panelX + 8, panelY + 22);
        ctx.lineTo(panelX + panelW - 8, panelY + 22);
        ctx.stroke();

        const diffNames = { EASY: '\u7B80\u5355', NORMAL: '\u666E\u901A', HARD: '\u56F0\u96BE', LUNATIC: '\u75AF\u72C2' };
        const rankColors = ['#ffdd44', '#cccccc', '#cc8844'];

        for (let i = 0; i < maxShow; i++) {
            const r = records[i];
            const ry = panelY + 36 + i * rowH;
            const isTop3 = i < 3;

            if (isTop3) {
                ctx.fillStyle = `rgba(${this.hexToRgb(rankColors[i])}, 0.06)`;
                ctx.fillRect(panelX + 4, ry - 8, panelW - 8, rowH);
            }

            ctx.font = isTop3 ? 'bold 11px "JetBrains Mono", monospace' : '11px "JetBrains Mono", monospace';
            ctx.fillStyle = isTop3 ? rankColors[i] : UI_COLORS.white;
            ctx.textAlign = 'left';
            ctx.fillText(`${i + 1}`, panelX + 14, ry);

            ctx.fillStyle = UI_COLORS.cyan;
            ctx.fillText(r.playerId || '???', panelX + 50, ry);

            ctx.fillStyle = UI_COLORS.white;
            ctx.fillText(r.score.toString(), panelX + 170, ry);

            ctx.fillStyle = UI_COLORS.dim;
            ctx.fillText(diffNames[r.difficulty] || r.difficulty, panelX + 270, ry);
            ctx.fillText(`${r.wave}`, panelX + 330, ry);
        }

        if (records.length === 0) {
            ctx.font = 'bold 14px "JetBrains Mono", sans-serif';
            ctx.fillStyle = UI_COLORS.dim;
            ctx.textAlign = 'center';
            ctx.fillText('\u6682\u65E0\u8BB0\u5F55', cx, panelY + panelH / 2);
        }

        const blink = Math.floor(this._time / 600) % 2;
        if (blink) {
            ctx.font = 'bold 12px "JetBrains Mono", sans-serif';
            ctx.fillStyle = UI_COLORS.white;
            ctx.textAlign = 'center';
            ctx.fillText('\u6309Tab\u8FD4\u56DE / \u6309\u7A7A\u683C\u5F00\u59CB', cx, CANVAS_HEIGHT - 30);
        }

        ctx.restore();
    },

    drawVignette(ctx, color) {
        const vignetteColor = color || '#00ffff';
        ctx.save();
        const grad = ctx.createRadialGradient(
            CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT * 0.3,
            CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT * 0.7
        );
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(1, `rgba(${this.hexToRgb(vignetteColor)}, 0.05)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.restore();
    }
};
