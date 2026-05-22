const UI_COLORS = {
    cyan: '#00ffff',
    green: '#00ff88',
    magenta: '#ff00ff',
    orange: '#ff8800',
    red: '#ff3366',
    white: '#e0e8f0',
    dim: '#4a5a6a',
    bgDark: 'rgba(5,5,15,0.85)',
    bgPanel: 'rgba(10,15,30,0.75)',
    borderGlow: 'rgba(0,255,255,0.4)',
    borderDim: 'rgba(0,255,255,0.15)'
};

const UIRenderer = {
    _time: 0,

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

        const grad = ctx.createLinearGradient(0, 0, 0, 36);
        grad.addColorStop(0, 'rgba(5,5,20,0.9)');
        grad.addColorStop(1, 'rgba(5,5,20,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, CANVAS_WIDTH, 36);

        ctx.strokeStyle = UI_COLORS.borderDim;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 35);
        ctx.lineTo(CANVAS_WIDTH, 35);
        ctx.stroke();

        ctx.font = '700 13px Orbitron, monospace';
        ctx.textBaseline = 'middle';

        ctx.fillStyle = UI_COLORS.cyan;
        ctx.textAlign = 'left';
        ctx.shadowColor = UI_COLORS.cyan;
        ctx.shadowBlur = 6;
        ctx.fillText('SCORE', 8, 10);
        ctx.shadowBlur = 0;
        ctx.font = '700 15px "JetBrains Mono", monospace';
        ctx.fillStyle = UI_COLORS.white;
        ctx.fillText(Math.floor(ScoreSystem.getScore()).toString().padStart(8, '0'), 8, 26);

        ctx.font = '700 11px Orbitron, monospace';
        ctx.fillStyle = UI_COLORS.dim;
        ctx.textAlign = 'center';
        ctx.fillText('WAVE', CANVAS_WIDTH / 2, 10);
        ctx.font = '700 18px Orbitron, monospace';
        ctx.fillStyle = UI_COLORS.green;
        ctx.shadowColor = UI_COLORS.green;
        ctx.shadowBlur = 8;
        ctx.fillText(waveNumber.toString(), CANVAS_WIDTH / 2, 26);
        ctx.shadowBlur = 0;

        const diffDef = DIFFICULTY[difficulty] || DIFFICULTY.NORMAL;
        const diffColors = { EASY: UI_COLORS.green, NORMAL: UI_COLORS.cyan, HARD: UI_COLORS.orange, LUNATIC: UI_COLORS.magenta };
        ctx.font = '600 9px Orbitron, monospace';
        ctx.fillStyle = diffColors[difficulty] || UI_COLORS.cyan;
        ctx.fillText(diffDef.name, CANVAS_WIDTH / 2, 35);

        ctx.font = '700 10px Orbitron, monospace';
        ctx.fillStyle = UI_COLORS.dim;
        ctx.textAlign = 'right';
        ctx.fillText('HI-SCORE', CANVAS_WIDTH - 8, 10);
        ctx.font = '700 13px "JetBrains Mono", monospace';
        ctx.fillStyle = UI_COLORS.orange;
        ctx.shadowColor = UI_COLORS.orange;
        ctx.shadowBlur = 4;
        ctx.fillText(Math.floor(ScoreSystem.getHighScore()).toString().padStart(8, '0'), CANVAS_WIDTH - 8, 26);
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

        ctx.font = '600 9px Orbitron, monospace';
        ctx.fillStyle = UI_COLORS.dim;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText('LIFE', 6, y + 4);

        for (let i = 0; i < player.lives; i++) {
            const ix = 42 + i * 16;
            ctx.fillStyle = UI_COLORS.green;
            ctx.shadowColor = UI_COLORS.green;
            ctx.shadowBlur = 4;
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

        ctx.font = '600 9px Orbitron, monospace';
        ctx.fillStyle = UI_COLORS.dim;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText('BOMB', startX + 4, y + 4);

        for (let i = 0; i < player.bombs; i++) {
            const ix = startX + 44 + i * 10;
            ctx.fillStyle = UI_COLORS.orange;
            ctx.shadowColor = UI_COLORS.orange;
            ctx.shadowBlur = 3;
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

        ctx.font = '600 9px Orbitron, monospace';
        ctx.fillStyle = UI_COLORS.dim;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText('WEAPON', x + 6, y + 2);

        ctx.font = '700 11px "JetBrains Mono", monospace';
        ctx.fillStyle = wpn.color || UI_COLORS.cyan;
        ctx.shadowColor = wpn.color || UI_COLORS.cyan;
        ctx.shadowBlur = 4;
        ctx.fillText(`${wpn.name} Lv.${player.weaponLevel}`, x + 56, y + 2);
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
            ctx.shadowBlur = 4;
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
        const barY = 44;
        const ratio = Math.max(0, boss.hp / boss.maxHp);

        ctx.fillStyle = UI_COLORS.bgPanel;
        ctx.fillRect(barX - 4, barY - 12, barW + 8, barH + 20);

        this.drawHUDBrackets(ctx, barX - 4, barY - 12, barW + 8, barH + 20);

        ctx.font = '700 9px Orbitron, monospace';
        ctx.fillStyle = UI_COLORS.red;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = UI_COLORS.red;
        ctx.shadowBlur = 4;
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
        ctx.shadowBlur = 6;
        ctx.fillRect(barX, barY + 2, barW * ratio, barH);
        ctx.shadowBlur = 0;

        ctx.restore();
    },

    drawHUDBrackets(ctx, x, y, w, h) {
        ctx.strokeStyle = UI_COLORS.cyan;
        ctx.lineWidth = 1;
        ctx.shadowColor = UI_COLORS.cyan;
        ctx.shadowBlur = 3;
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

        ctx.font = `700 ${size}px Orbitron, monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.fillStyle = `rgba(255, 200, 0, ${alpha * 0.3})`;
        ctx.shadowColor = '#ff8800';
        ctx.shadowBlur = 12;
        ctx.fillText(`${combo} HIT`, CANVAS_WIDTH / 2, y);
        ctx.shadowBlur = 0;

        ctx.fillStyle = `rgba(255, 220, 50, ${alpha})`;
        ctx.fillText(`${combo} HIT`, CANVAS_WIDTH / 2, y);

        ctx.restore();
    },

    drawSkinIndicator(ctx, selectedSkin) {
        const skin = SKINS[selectedSkin];
        if (!skin) return;

        ctx.save();
        const x = 6;
        const y = 42;

        ctx.font = '600 8px Orbitron, monospace';
        ctx.fillStyle = skin.colors.glow || UI_COLORS.dim;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(skin.name, x, y);

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
            ctx.shadowBlur = 4;
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
            ctx.font = 'bold 18px Orbitron, monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            ctx.fillStyle = UI_COLORS.orange;
            ctx.shadowColor = UI_COLORS.orange;
            ctx.shadowBlur = 12;
            ctx.fillText(notif.text, CANVAS_WIDTH / 2, y);

            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 0;
            ctx.fillText(notif.text, CANVAS_WIDTH / 2, y);

            ctx.restore();
        }
    },

    drawStartScreen(ctx) {
        this._time = Date.now();

        ctx.fillStyle = 'rgba(5, 5, 15, 0.85)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        this.drawVignette(ctx);

        this.drawTitleSection(ctx);
        this.drawDifficultySelection(ctx);
        this.drawSkinSelection(ctx);
        this.drawWeaponSelection(ctx);
        this.drawControlsInfo(ctx);
    },

    drawTitleSection(ctx) {
        const cx = CANVAS_WIDTH / 2;
        const cy = 80;
        const pulse = Math.sin(this._time / 600) * 0.15 + 0.85;

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.font = '900 38px Orbitron, monospace';
        ctx.fillStyle = `rgba(0, 255, 255, ${pulse})`;
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 20;
        ctx.fillText('RAIDEN', cx, cy);
        ctx.shadowBlur = 0;

        ctx.font = '400 16px Orbitron, monospace';
        ctx.fillStyle = `rgba(0, 255, 136, ${pulse * 0.9})`;
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 10;
        ctx.fillText('FIGHTER', cx, cy + 30);
        ctx.shadowBlur = 0;

        const lineY = cy + 48;
        const lineW = 120;
        ctx.strokeStyle = `rgba(0, 255, 255, ${pulse * 0.5})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx - lineW, lineY);
        ctx.lineTo(cx + lineW, lineY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(cx - 4, lineY - 3);
        ctx.lineTo(cx + 4, lineY + 3);
        ctx.moveTo(cx + 4, lineY - 3);
        ctx.lineTo(cx - 4, lineY + 3);
        ctx.strokeStyle = UI_COLORS.cyan;
        ctx.stroke();

        const blink = Math.floor(this._time / 800) % 2;
        if (blink) {
            ctx.font = '600 12px Orbitron, monospace';
            ctx.fillStyle = UI_COLORS.white;
            ctx.fillText('PRESS SPACE TO START', cx, cy + 68);
        }

        ctx.restore();
    },

    drawDifficultySelection(ctx) {
        const cx = CANVAS_WIDTH / 2;
        const y = 172;
        const keys = Object.keys(DIFFICULTY);
        const currentDiff = GameEngine ? GameEngine.getDifficulty() : 'NORMAL';
        const spacing = 90;

        ctx.save();
        ctx.font = '600 9px Orbitron, monospace';
        ctx.fillStyle = UI_COLORS.dim;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('DIFFICULTY', cx, y - 14);

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
                ctx.shadowBlur = 6;
                ctx.strokeRect(dx - 36, y - 4, 72, 22);
                ctx.shadowBlur = 0;

                ctx.fillStyle = `rgba(${this.hexToRgb(diffColors[keys[i]])}, 0.1)`;
                ctx.fillRect(dx - 36, y - 4, 72, 22);
            }

            ctx.font = isSelected ? '700 11px Orbitron, monospace' : '400 10px Orbitron, monospace';
            ctx.fillStyle = isSelected ? (diffColors[keys[i]] || UI_COLORS.cyan) : UI_COLORS.dim;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
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
        const y = 230;
        const spacing = 75;
        const totalWidth = unlocked.length * spacing;
        const startX = (CANVAS_WIDTH - totalWidth) / 2 + spacing / 2;
        const currentSkin = GameEngine ? GameEngine.getSelectedSkin() : 'default';

        ctx.save();
        ctx.font = '600 9px Orbitron, monospace';
        ctx.fillStyle = UI_COLORS.dim;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('SELECT SKIN', CANVAS_WIDTH / 2, y - 18);

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
                ctx.shadowBlur = 6;
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
            ctx.font = isSelected ? '600 9px "JetBrains Mono", monospace' : '400 8px "JetBrains Mono", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(skin.name, x, y + 48);
        }

        ctx.restore();
    },

    drawWeaponSelection(ctx) {
        const unlocked = getUnlockedWeapons();
        const y = 316;
        const spacing = 120;
        const totalWidth = unlocked.length * spacing;
        const startX = (CANVAS_WIDTH - totalWidth) / 2 + spacing / 2;
        const currentWeapon = GameEngine ? GameEngine.getSelectedWeapon() : 'vulcan';

        ctx.save();
        ctx.font = '600 9px Orbitron, monospace';
        ctx.fillStyle = UI_COLORS.dim;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('SELECT WEAPON', CANVAS_WIDTH / 2, y - 14);

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
                ctx.shadowBlur = 6;
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
            ctx.font = isSelected ? '700 11px Orbitron, monospace' : '400 10px "JetBrains Mono", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(wpn.name, x, y + 13);
        }

        ctx.restore();
    },

    drawControlsInfo(ctx) {
        const cx = CANVAS_WIDTH / 2;
        const y = 380;

        ctx.save();

        ctx.strokeStyle = UI_COLORS.borderDim;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(40, y - 8);
        ctx.lineTo(CANVAS_WIDTH - 40, y - 8);
        ctx.stroke();

        ctx.font = '400 9px "JetBrains Mono", monospace';
        ctx.fillStyle = UI_COLORS.dim;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const lines = [
            'WASD/Arrows: Move  |  Space: Shoot  |  B: Bomb',
            'Mouse/Touch: Drag to Move + Auto Shoot'
        ];

        lines.forEach((line, i) => {
            ctx.fillText(line, cx, y + 8 + i * 16);
        });

        const total = ScoreSystem.getTotalScore();
        ctx.font = '600 10px Orbitron, monospace';
        ctx.fillStyle = UI_COLORS.orange;
        ctx.fillText(`TOTAL SCORE: ${Math.floor(total)}`, cx, y + 48);

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
        ctx.shadowBlur = 6;
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

        ctx.font = '900 36px Orbitron, monospace';
        ctx.fillStyle = `rgba(255, 51, 102, ${pulse})`;
        ctx.shadowColor = '#ff3366';
        ctx.shadowBlur = 20;
        ctx.fillText('GAME OVER', cx, 160);
        ctx.shadowBlur = 0;

        const panelX = cx - 140;
        const panelY = 210;
        const panelW = 280;
        const panelH = 180;

        ctx.fillStyle = 'rgba(10, 5, 15, 0.8)';
        this.drawChamferedRect(ctx, panelX, panelY, panelW, panelH, 6);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 51, 102, 0.4)';
        ctx.lineWidth = 1;
        ctx.shadowColor = 'rgba(255, 51, 102, 0.3)';
        ctx.shadowBlur = 4;
        this.drawChamferedRect(ctx, panelX, panelY, panelW, panelH, 6);
        ctx.stroke();
        ctx.shadowBlur = 0;

        this.drawHUDBrackets(ctx, panelX + 4, panelY + 4, panelW - 8, panelH - 8);

        const stats = [
            { label: 'SCORE', value: Math.floor(ScoreSystem.getScore()), color: UI_COLORS.cyan },
            { label: 'HI-SCORE', value: Math.floor(ScoreSystem.getHighScore()), color: UI_COLORS.orange },
            { label: 'TOTAL', value: Math.floor(ScoreSystem.getTotalScore()), color: UI_COLORS.green }
        ];

        stats.forEach((s, i) => {
            const sy = panelY + 24 + i * 44;

            ctx.font = '600 9px Orbitron, monospace';
            ctx.fillStyle = UI_COLORS.dim;
            ctx.textAlign = 'left';
            ctx.fillText(s.label, panelX + 20, sy);

            ctx.font = '700 18px "JetBrains Mono", monospace';
            ctx.fillStyle = s.color;
            ctx.shadowColor = s.color;
            ctx.shadowBlur = 4;
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

        const blink = Math.floor(this._time / 600) % 2;
        if (blink) {
            ctx.font = '600 12px Orbitron, monospace';
            ctx.fillStyle = UI_COLORS.white;
            ctx.textAlign = 'center';
            ctx.fillText('PRESS SPACE TO RETRY', cx, panelY + panelH + 30);
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
