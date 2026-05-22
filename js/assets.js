const ASSET_CACHE = {};

function getAsset() {
    return null;
}

function preloadAssets() {
}

function createFallbackSprite(width, height, drawFn) {
    const c = document.createElement('canvas');
    c.width = width;
    c.height = height;
    const ctx = c.getContext('2d');
    drawFn(ctx, width, height);
    return c;
}

function getPlayerSprite(skinId) {
    const skin = SKINS[skinId] || SKINS.default;
    return createFallbackSprite(64, 64, (ctx, w, h) => {
        const cx = w / 2;
        const cy = h / 2;
        ctx.save();
        ctx.translate(cx, cy);

        ctx.fillStyle = skin.colors.primary;
        ctx.beginPath();
        ctx.moveTo(0, -h / 2 + 8);
        ctx.lineTo(-w / 2 + 8, h / 2 - 8);
        ctx.lineTo(-w / 2 + 16, h / 2);
        ctx.lineTo(w / 2 - 16, h / 2);
        ctx.lineTo(w / 2 - 8, h / 2 - 8);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = skin.colors.secondary;
        ctx.beginPath();
        ctx.moveTo(0, -h / 2 + 16);
        ctx.lineTo(-w / 2 + 14, h / 2 - 12);
        ctx.lineTo(w / 2 - 14, h / 2 - 12);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = skin.colors.accent;
        ctx.beginPath();
        ctx.moveTo(0, -h / 2 + 24);
        ctx.lineTo(-8, h / 2 - 16);
        ctx.lineTo(8, h / 2 - 16);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = skin.colors.core;
        ctx.beginPath();
        ctx.arc(0, -h / 2 + 28, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    });
}

function getEnemySprite(type) {
    const typeDef = ENEMY_TYPES[type];
    if (!typeDef) return null;

    const w = typeDef.width;
    const h = typeDef.height;
    return createFallbackSprite(w, h, (ctx, w, h) => {
        const cx = w / 2;
        const cy = h / 2;
        ctx.save();
        ctx.translate(cx, cy);

        ctx.fillStyle = typeDef.colors.primary;
        if (type === 'drone') {
            ctx.beginPath();
            ctx.moveTo(0, h / 2 - 2);
            ctx.lineTo(-w / 2 + 2, -h / 2 + 8);
            ctx.lineTo(0, -h / 2 + 2);
            ctx.lineTo(w / 2 - 2, -h / 2 + 8);
            ctx.closePath();
        } else if (type === 'fighter') {
            ctx.beginPath();
            ctx.moveTo(0, h / 2 - 2);
            ctx.lineTo(-w / 2 + 2, -h / 2 + 12);
            ctx.lineTo(w / 2 - 2, -h / 2 + 12);
            ctx.closePath();
        } else if (type === 'bomber') {
            ctx.beginPath();
            ctx.moveTo(0, h / 2 - 2);
            ctx.lineTo(-w / 2 + 4, -h / 2 + 16);
            ctx.lineTo(w / 2 - 4, -h / 2 + 16);
            ctx.closePath();
        } else if (type === 'elite') {
            ctx.beginPath();
            ctx.moveTo(0, h / 2 - 2);
            ctx.lineTo(-w / 2 + 2, -h / 2 + 8);
            ctx.lineTo(-w / 2 + 8, -h / 2 + 2);
            ctx.lineTo(w / 2 - 8, -h / 2 + 2);
            ctx.lineTo(w / 2 - 2, -h / 2 + 8);
            ctx.closePath();
        } else {
            ctx.fillRect(-w / 2 + 2, -h / 2 + 2, w - 4, h - 4);
        }
        ctx.fill();

        ctx.fillStyle = typeDef.colors.core;
        ctx.beginPath();
        ctx.arc(0, -h / 2 + 16, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    });
}

function getBossSprite(type) {
    const typeDef = BOSS_TYPES[type];
    if (!typeDef) return null;

    const w = typeDef.width;
    const h = typeDef.height;
    return createFallbackSprite(w, h, (ctx, w, h) => {
        const cx = w / 2;
        const cy = h / 2;
        ctx.save();
        ctx.translate(cx, cy);

        ctx.fillStyle = typeDef.colors.primary;
        ctx.beginPath();
        ctx.moveTo(0, h / 2 - 4);
        ctx.lineTo(-w / 2 + 8, -h / 2 + 24);
        ctx.lineTo(-w / 2 + 16, -h / 2 + 8);
        ctx.lineTo(0, -h / 2 + 2);
        ctx.lineTo(w / 2 - 16, -h / 2 + 8);
        ctx.lineTo(w / 2 - 8, -h / 2 + 24);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = typeDef.colors.secondary;
        ctx.beginPath();
        ctx.moveTo(0, h / 2 - 20);
        ctx.lineTo(-w / 2 + 20, -h / 2 + 28);
        ctx.lineTo(w / 2 - 20, -h / 2 + 28);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = typeDef.colors.accent;
        ctx.beginPath();
        ctx.arc(0, -h / 2 + 36, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = typeDef.colors.core;
        ctx.beginPath();
        ctx.arc(0, -h / 2 + 36, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    });
}

function getBulletSprite() {
    return null;
}

function getItemSprite() {
    return null;
}
