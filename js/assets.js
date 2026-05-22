const ASSET_URLS = {
    // 玩家战机 - 更炫酷的设计
    player_default: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=futuristic+blue+fighter+jet+top-down+view+glowing+cyan+thrusters+sleek+aerodynamic+design+sci-fi+aircraft+neon+glow+energy+wings+transparent+cockpit+detailed+metallic+texture+8k+quality+game+asset&image_size=square',
    player_flame: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=futuristic+red+fighter+jet+with+flame+trails+top-down+view+glowing+orange+thrusters+aggressive+sharp+wings+sci-fi+combat+aircraft+fire+aura+burning+edges+detailed+metallic+texture+8k+quality+game+asset&image_size=square',
    player_ice: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=futuristic+ice-themed+fighter+jet+top-down+view+cyan+white+gradient+crystal-like+wings+frozen+particle+effects+sci-fi+aircraft+frost+aura+glacial+armor+detailed+metallic+texture+8k+quality+game+asset&image_size=square',
    player_shadow: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=futuristic+dark+purple+stealth+fighter+top-down+view+shadow+particle+effects+mysterious+dark+aura+sci-fi+combat+aircraft+phantom+wings+void+energy+detailed+metallic+texture+8k+quality+game+asset&image_size=square',
    player_holy: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=futuristic+golden+angel+fighter+jet+top-down+view+holy+light+halo+white+angelic+wings+divine+particle+effects+sci-fi+aircraft+celestial+armor+glowing+runes+detailed+metallic+texture+8k+quality+game+asset&image_size=square',
    
    // 敌人 - 更详细的设计
    enemy_drone: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=small+red+enemy+drone+top-down+view+triangular+shape+glowing+red+core+sci-fi+enemy+aircraft+mechanical+details+antenna+sensors+aggressive+design+8k+quality+game+asset&image_size=square',
    enemy_fighter: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=medium+orange+enemy+fighter+top-down+view+armored+plating+multiple+gun+turrets+sci-fi+combat+drone+heavy+armor+cannon+ports+detailed+mechanical+8k+quality+game+asset&image_size=square',
    enemy_bomber: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=heavy+green+enemy+bomber+top-down+view+large+bulky+design+multiple+cannons+sci-fi+battleship+bomb+bay+heavy+armor+fortress+like+8k+quality+game+asset&image_size=square',
    enemy_elite: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=elite+purple+enemy+ace+fighter+top-down+view+sleek+fast+design+energy+weapons+sci-fi+advanced+drone+royal+armor+glowing+edges+8k+quality+game+asset&image_size=square',
    
    // Boss - 更震撼的设计
    boss_mech: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=massive+mechanical+flying+fortress+boss+top-down+view+giant+armored+body+multiple+weapon+systems+glowing+red+eye+sci-fi+boss+mechanical+tentacles+heavy+cannons+devastating+8k+quality+game+asset&image_size=square',
    boss_bio: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=bio-mechanical+alien+mothership+boss+top-down+view+organic+tentacles+glowing+green+biological+weapons+sci-fi+horror+boss+alien+carapace+acid+sacs+8k+quality+game+asset&image_size=square',
    
    // 特效和道具
    bullet_player: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=glowing+cyan+energy+projectile+top-down+view+elongated+oval+bright+core+light+trail+sci-fi+bullet+plasma+effect+transparent+background+8k+quality+game+asset&image_size=square',
    bullet_enemy: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=glowing+red+energy+projectile+top-down+view+elongated+oval+bright+core+light+trail+sci-fi+bullet+plasma+effect+dangerous+look+8k+quality+game+asset&image_size=square',
    item_powerup: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=glowing+green+power+up+orb+top-down+view+energy+sphere+pulsing+light+particle+effects+sci-fi+item+collectible+8k+quality+game+asset&image_size=square',
    item_weapon: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=glowing+purple+weapon+upgrade+orb+top-down+view+energy+sphere+cross+symbol+particle+effects+sci-fi+item+collectible+8k+quality+game+asset&image_size=square',
    explosion: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=explosion+effect+top-down+view+fire+ball+smoke+debris+particle+burst+orange+yellow+red+energy+detailed+8k+quality+game+asset&image_size=square'
};

const ASSET_CACHE = {};
const ASSET_LOAD_PROMISES = {};

function loadImage(url) {
    if (ASSET_LOAD_PROMISES[url]) return ASSET_LOAD_PROMISES[url];
    
    ASSET_LOAD_PROMISES[url] = new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            ASSET_CACHE[url] = img;
            resolve(img);
        };
        img.onerror = () => {
            console.warn(`Failed to load image: ${url}`);
            resolve(null);
        };
        img.src = url;
    });
    
    return ASSET_LOAD_PROMISES[url];
}

function getAsset(key) {
    const url = ASSET_URLS[key];
    if (!url) return null;
    return ASSET_CACHE[url] || null;
}

async function preloadAssets() {
    const promises = Object.values(ASSET_URLS).map(url => loadImage(url));
    await Promise.all(promises);
    console.log('Assets preloaded');
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
    const asset = getAsset(`player_${skinId}`);
    if (asset) return asset;
    
    const skin = SKINS[skinId] || SKINS.default;
    return createFallbackSprite(64, 64, (ctx, w, h) => {
        const cx = w / 2, cy = h / 2;
        ctx.save();
        ctx.translate(cx, cy);
        
        // 主体
        ctx.fillStyle = skin.colors.primary;
        ctx.beginPath();
        ctx.moveTo(0, -h/2 + 8);
        ctx.lineTo(-w/2 + 8, h/2 - 8);
        ctx.lineTo(-w/2 + 16, h/2);
        ctx.lineTo(w/2 - 16, h/2);
        ctx.lineTo(w/2 - 8, h/2 - 8);
        ctx.closePath();
        ctx.fill();
        
        // 机翼
        ctx.fillStyle = skin.colors.secondary;
        ctx.beginPath();
        ctx.moveTo(0, -h/2 + 16);
        ctx.lineTo(-w/2 + 14, h/2 - 12);
        ctx.lineTo(w/2 - 14, h/2 - 12);
        ctx.closePath();
        ctx.fill();
        
        // 驾驶舱
        ctx.fillStyle = skin.colors.accent;
        ctx.beginPath();
        ctx.moveTo(0, -h/2 + 24);
        ctx.lineTo(-8, h/2 - 16);
        ctx.lineTo(8, h/2 - 16);
        ctx.closePath();
        ctx.fill();
        
        // 核心
        ctx.fillStyle = skin.colors.core;
        ctx.beginPath();
        ctx.arc(0, -h/2 + 28, 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    });
}

function getEnemySprite(type) {
    const asset = getAsset(`enemy_${type}`);
    if (asset) return asset;
    
    const typeDef = ENEMY_TYPES[type];
    if (!typeDef) return null;
    
    const w = typeDef.width, h = typeDef.height;
    return createFallbackSprite(w, h, (ctx, w, h) => {
        const cx = w / 2, cy = h / 2;
        ctx.save();
        ctx.translate(cx, cy);
        
        ctx.fillStyle = typeDef.colors.primary;
        if (type === 'drone') {
            ctx.beginPath();
            ctx.moveTo(0, h/2 - 2);
            ctx.lineTo(-w/2 + 2, -h/2 + 8);
            ctx.lineTo(0, -h/2 + 2);
            ctx.lineTo(w/2 - 2, -h/2 + 8);
            ctx.closePath();
        } else if (type === 'fighter') {
            ctx.beginPath();
            ctx.moveTo(0, h/2 - 2);
            ctx.lineTo(-w/2 + 2, -h/2 + 12);
            ctx.lineTo(w/2 - 2, -h/2 + 12);
            ctx.closePath();
        } else if (type === 'bomber') {
            ctx.beginPath();
            ctx.moveTo(0, h/2 - 2);
            ctx.lineTo(-w/2 + 4, -h/2 + 16);
            ctx.lineTo(w/2 - 4, -h/2 + 16);
            ctx.closePath();
        } else if (type === 'elite') {
            ctx.beginPath();
            ctx.moveTo(0, h/2 - 2);
            ctx.lineTo(-w/2 + 2, -h/2 + 8);
            ctx.lineTo(-w/2 + 8, -h/2 + 2);
            ctx.lineTo(w/2 - 8, -h/2 + 2);
            ctx.lineTo(w/2 - 2, -h/2 + 8);
            ctx.closePath();
        } else {
            ctx.fillRect(-w/2 + 2, -h/2 + 2, w - 4, h - 4);
        }
        ctx.fill();
        
        ctx.fillStyle = typeDef.colors.core;
        ctx.beginPath();
        ctx.arc(0, -h/2 + 16, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    });
}

function getBossSprite(type) {
    const asset = getAsset(`boss_${type}`);
    if (asset) return asset;
    
    const typeDef = BOSS_TYPES[type];
    if (!typeDef) return null;
    
    const w = typeDef.width, h = typeDef.height;
    return createFallbackSprite(w, h, (ctx, w, h) => {
        const cx = w / 2, cy = h / 2;
        ctx.save();
        ctx.translate(cx, cy);
        
        ctx.fillStyle = typeDef.colors.primary;
        ctx.beginPath();
        ctx.moveTo(0, h/2 - 4);
        ctx.lineTo(-w/2 + 8, -h/2 + 24);
        ctx.lineTo(-w/2 + 16, -h/2 + 8);
        ctx.lineTo(0, -h/2 + 2);
        ctx.lineTo(w/2 - 16, -h/2 + 8);
        ctx.lineTo(w/2 - 8, -h/2 + 24);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = typeDef.colors.secondary;
        ctx.beginPath();
        ctx.moveTo(0, h/2 - 20);
        ctx.lineTo(-w/2 + 20, -h/2 + 28);
        ctx.lineTo(w/2 - 20, -h/2 + 28);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = typeDef.colors.accent;
        ctx.beginPath();
        ctx.arc(0, -h/2 + 36, 12, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = typeDef.colors.core;
        ctx.beginPath();
        ctx.arc(0, -h/2 + 36, 6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    });
}

function getBulletSprite(isPlayer) {
    const key = isPlayer ? 'bullet_player' : 'bullet_enemy';
    const asset = getAsset(key);
    if (asset) return asset;
    return null;
}

function getItemSprite(itemType) {
    const key = itemType === 'powerUp' ? 'item_powerup' : 
                itemType === 'weaponSwitch' ? 'item_weapon' : null;
    if (key) {
        const asset = getAsset(key);
        if (asset) return asset;
    }
    return null;
}
