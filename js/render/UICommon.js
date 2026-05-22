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

const UICommon = {
    hexToRgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `${r},${g},${b}`;
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
    }
};
