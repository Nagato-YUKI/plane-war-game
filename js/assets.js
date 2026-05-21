const ASSET_CACHE = {};

function createPlayerSprite(width, height, colors) {
    const c = document.createElement('canvas');
    c.width = width;
    c.height = height;
    const x = c.getContext('2d');
    const cx = width / 2;
    const cy = height / 2;

    x.save();
    x.translate(cx, cy);

    x.fillStyle = colors.primary;
    x.beginPath();
    x.moveTo(0, -height / 2 + 4);
    x.lineTo(-width / 2 + 4, height / 2 - 4);
    x.lineTo(-width / 2 + 10, height / 2);
    x.lineTo(width / 2 - 10, height / 2);
    x.lineTo(width / 2 - 4, height / 2 - 4);
    x.closePath();
    x.fill();

    x.fillStyle = colors.secondary;
    x.beginPath();
    x.moveTo(0, -height / 2 + 12);
    x.lineTo(-width / 2 + 10, height / 2 - 8);
    x.lineTo(width / 2 - 10, height / 2 - 8);
    x.closePath();
    x.fill();

    x.fillStyle = colors.accent;
    x.beginPath();
    x.moveTo(0, -height / 2 + 18);
    x.lineTo(-6, height / 2 - 12);
    x.lineTo(6, height / 2 - 12);
    x.closePath();
    x.fill();

    x.fillStyle = colors.core;
    x.beginPath();
    x.arc(0, -height / 2 + 24, 3, 0, Math.PI * 2);
    x.fill();

    x.fillStyle = colors.glow;
    x.globalAlpha = 0.3;
    x.beginPath();
    x.arc(0, 0, width / 2 - 2, 0, Math.PI * 2);
    x.fill();
    x.globalAlpha = 1;

    x.restore();
    return c;
}

function createEnemySprite(width, height, colors, type) {
    const c = document.createElement('canvas');
    c.width = width;
    c.height = height;
    const x = c.getContext('2d');
    const cx = width / 2;
    const cy = height / 2;

    x.save();
    x.translate(cx, cy);

    if (type === 'small') {
        x.fillStyle = colors.primary;
        x.beginPath();
        x.moveTo(0, height / 2 - 2);
        x.lineTo(-width / 2 + 2, -height / 2 + 6);
        x.lineTo(0, -height / 2 + 2);
        x.lineTo(width / 2 - 2, -height / 2 + 6);
        x.closePath();
        x.fill();

        x.fillStyle = colors.secondary;
        x.beginPath();
        x.moveTo(0, height / 2 - 8);
        x.lineTo(-width / 2 + 8, -height / 2 + 10);
        x.lineTo(width / 2 - 8, -height / 2 + 10);
        x.closePath();
        x.fill();
    } else if (type === 'medium') {
        x.fillStyle = colors.primary;
        x.beginPath();
        x.moveTo(0, height / 2 - 2);
        x.lineTo(-width / 2 + 2, -height / 2 + 10);
        x.lineTo(width / 2 - 2, -height / 2 + 10);
        x.closePath();
        x.fill();

        x.fillStyle = colors.secondary;
        x.beginPath();
        x.moveTo(0, height / 2 - 10);
        x.lineTo(-width / 2 + 8, -height / 2 + 14);
        x.lineTo(width / 2 - 8, -height / 2 + 14);
        x.closePath();
        x.fill();
    } else if (type === 'boss') {
        x.fillStyle = colors.primary;
        x.beginPath();
        x.moveTo(0, height / 2 - 2);
        x.lineTo(-width / 2 + 4, -height / 2 + 20);
        x.lineTo(-width / 2 + 10, -height / 2 + 8);
        x.lineTo(0, -height / 2 + 2);
        x.lineTo(width / 2 - 10, -height / 2 + 8);
        x.lineTo(width / 2 - 4, -height / 2 + 20);
        x.closePath();
        x.fill();

        x.fillStyle = colors.secondary;
        x.beginPath();
        x.moveTo(0, height / 2 - 15);
        x.lineTo(-width / 2 + 12, -height / 2 + 22);
        x.lineTo(width / 2 - 12, -height / 2 + 22);
        x.closePath();
        x.fill();

        x.fillStyle = colors.accent;
        x.beginPath();
        x.arc(0, -height / 2 + 30, 10, 0, Math.PI * 2);
        x.fill();

        x.fillStyle = colors.core;
        x.beginPath();
        x.arc(0, -height / 2 + 30, 5, 0, Math.PI * 2);
        x.fill();
    }

    x.fillStyle = colors.core;
    x.beginPath();
    x.arc(0, -height / 2 + (type === 'boss' ? 18 : 12), type === 'boss' ? 3 : 2, 0, Math.PI * 2);
    x.fill();

    x.restore();
    return c;
}

function createBulletSprite(width, height, color, type) {
    const c = document.createElement('canvas');
    c.width = width;
    c.height = height;
    const x = c.getContext('2d');

    if (type === 'laser') {
        const grad = x.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.2, color);
        grad.addColorStop(1, 'rgba(255,0,255,0)');
        x.fillStyle = grad;
        x.fillRect(0, 0, width, height);
    } else if (type === 'missile') {
        x.fillStyle = color;
        x.beginPath();
        x.moveTo(width / 2, 0);
        x.lineTo(0, height);
        x.lineTo(width, height);
        x.closePath();
        x.fill();

        x.fillStyle = '#ffcc00';
        x.beginPath();
        x.arc(width / 2, height * 0.7, 2, 0, Math.PI * 2);
        x.fill();
    } else {
        const grad = x.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, color);
        grad.addColorStop(1, 'rgba(0,255,255,0)');
        x.fillStyle = grad;
        x.fillRect(0, 0, width, height);
    }

    return c;
}

function createItemSprite(size, color, label) {
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const x = c.getContext('2d');

    x.fillStyle = color;
    x.shadowColor = color;
    x.shadowBlur = 8;
    x.beginPath();
    x.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
    x.fill();
    x.shadowBlur = 0;

    x.fillStyle = '#000000';
    x.font = `bold ${size * 0.5}px monospace`;
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.fillText(label, size / 2, size / 2 + 1);

    return c;
}

function getAsset(key) {
    if (ASSET_CACHE[key]) return ASSET_CACHE[key];

    let asset = null;
    if (key.startsWith('player_')) {
        const skinId = key.replace('player_', '');
        const skin = SKINS[skinId] || SKINS.default;
        asset = createPlayerSprite(48, 56, skin.colors);
    } else if (key.startsWith('enemy_')) {
        const type = key.replace('enemy_', '');
        const typeDef = ENEMY_TYPES[type];
        if (typeDef) {
            asset = createEnemySprite(typeDef.width, typeDef.height, typeDef.colors, type);
        }
    } else if (key.startsWith('bullet_')) {
        const type = key.replace('bullet_', '');
        const wpn = WEAPONS[type];
        if (wpn) {
            const level = wpn.levels[0];
            if (type === 'laser') {
                asset = createBulletSprite(level.width || 8, 32, wpn.color, 'laser');
            } else if (type === 'missile') {
                asset = createBulletSprite(8, 16, wpn.color, 'missile');
            } else {
                asset = createBulletSprite(6, 14, wpn.color, 'vulcan');
            }
        }
    } else if (key === 'bullet_enemy') {
        asset = createBulletSprite(4, 10, '#ff0044', 'enemy');
    } else if (key.startsWith('item_')) {
        const itemType = key.replace('item_', '');
        const typeDef = ITEM_TYPES[itemType];
        if (typeDef) {
            asset = createItemSprite(typeDef.size, typeDef.color, typeDef.label);
        }
    }

    if (asset) ASSET_CACHE[key] = asset;
    return asset;
}

function preloadAssets() {
    const keys = [
        'player_default', 'player_stealth', 'player_gold', 'player_fighter',
        'enemy_small', 'enemy_medium', 'enemy_boss',
        'bullet_vulcan', 'bullet_laser', 'bullet_missile', 'bullet_plasma', 'bullet_enemy',
        'item_powerUp', 'item_bomb', 'item_shield', 'item_extraLife'
    ];
    for (const key of keys) {
        getAsset(key);
    }
}
