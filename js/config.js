const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 640;

const PLAYER_WIDTH = 48;
const PLAYER_HEIGHT = 56;
const PLAYER_SPEED = 5;
const PLAYER_LIVES = 3;
const PLAYER_INVINCIBLE_MS = 2000;
const PLAYER_HITBOX_RATIO = 0.35;
const PLAYER_MAX_BOMBS = 7;

const ENEMY_HITBOX_RATIO = 0.75;
const BULLET_HITBOX_RATIO = 0.6;
const ITEM_HITBOX_RATIO = 1.2;

const STAR_COUNT = 120;
const PARTICLE_LIMIT = 500;
const BULLET_LIMIT = 300;

const WEAPON_DURATION = 15000;
const WEAPON_DURATION_PER_LEVEL = 2000;
const WEAPON_MIN_DURATION = 5000;

const GAME_STATE = {
    START: 'start',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'game_over'
};

const DIFFICULTY = {
    EASY: { name: '简单', hpMult: 0.7, bulletSpeed: 0.8, density: 0.6, scoreMult: 0.8, enemyCount: 8 },
    NORMAL: { name: '普通', hpMult: 1.0, bulletSpeed: 1.0, density: 1.0, scoreMult: 1.0, enemyCount: 12 },
    HARD: { name: '困难', hpMult: 1.3, bulletSpeed: 1.2, density: 1.5, scoreMult: 1.5, enemyCount: 18 },
    LUNATIC: { name: '疯狂', hpMult: 1.6, bulletSpeed: 1.4, density: 2.0, scoreMult: 2.0, enemyCount: 25 }
};

const SKINS = {
    default: {
        name: '雷电战机',
        unlockScore: 0,
        opacity: 1.0,
        colors: {
            primary: '#0066cc',
            secondary: '#00ccff',
            accent: '#00ffff',
            glow: '#00ffff',
            core: '#ffffff',
            engine: ['#00ffff', '#00aaff', '#0066ff', '#ffffff']
        }
    },
    flame: {
        name: '烈焰战机',
        unlockScore: 500,
        opacity: 1.0,
        colors: {
            primary: '#cc2200',
            secondary: '#ff6600',
            accent: '#ffaa00',
            glow: '#ff4400',
            core: '#ffffff',
            engine: ['#ffaa00', '#ff6600', '#ff2200', '#ffffff']
        }
    },
    ice: {
        name: '冰霜战机',
        unlockScore: 1500,
        opacity: 0.9,
        colors: {
            primary: '#0066aa',
            secondary: '#66ccff',
            accent: '#aaddff',
            glow: '#88ccff',
            core: '#ffffff',
            engine: ['#aaddff', '#66ccff', '#0088cc', '#ffffff']
        }
    },
    shadow: {
        name: '暗影战机',
        unlockScore: 3000,
        opacity: 0.7,
        colors: {
            primary: '#440066',
            secondary: '#8844aa',
            accent: '#aa66cc',
            glow: '#660088',
            core: '#cc88ff',
            engine: ['#aa66cc', '#8844aa', '#440066', '#cc88ff']
        }
    },
    holy: {
        name: '圣光战机',
        unlockScore: 5000,
        opacity: 1.0,
        colors: {
            primary: '#aa8800',
            secondary: '#ffdd44',
            accent: '#ffee88',
            glow: '#ffcc00',
            core: '#ffffff',
            engine: ['#ffee88', '#ffdd44', '#ffaa00', '#ffffff']
        }
    }
};

const WEAPONS = {
    vulcan: {
        name: '火神炮',
        unlockScore: 0,
        color: '#00ffff',
        maxLevel: 5,
        duration: WEAPON_DURATION,
        levels: [
            { count: 1, spread: 0, interval: 150, speed: 10, damage: 1 },
            { count: 3, spread: 20, interval: 130, speed: 10, damage: 1 },
            { count: 5, spread: 35, interval: 110, speed: 11, damage: 1 },
            { count: 7, spread: 50, interval: 90, speed: 12, damage: 1 },
            { count: 9, spread: 70, interval: 70, speed: 13, damage: 2 }
        ]
    },
    laser: {
        name: '激光',
        unlockScore: 300,
        color: '#ff00ff',
        maxLevel: 5,
        duration: WEAPON_DURATION,
        levels: [
            { width: 6, damage: 2, interval: 100 },
            { width: 10, damage: 3, interval: 100 },
            { width: 16, damage: 4, interval: 100 },
            { width: 24, damage: 6, interval: 100 },
            { width: 36, damage: 10, interval: 100 }
        ]
    },
    missile: {
        name: '导弹',
        unlockScore: 800,
        color: '#ffaa00',
        maxLevel: 5,
        duration: WEAPON_DURATION,
        levels: [
            { count: 1, speed: 6, interval: 400, damage: 4 },
            { count: 2, speed: 7, interval: 350, damage: 4 },
            { count: 3, speed: 8, interval: 300, damage: 5 },
            { count: 4, speed: 9, interval: 250, damage: 5 },
            { count: 6, speed: 10, interval: 200, damage: 6 }
        ]
    }
};

const ENEMY_TYPES = {
    drone: {
        name: '小型无人机',
        width: 40,
        height: 40,
        hp: 1,
        speedBase: 3,
        speedVar: 1,
        canShoot: true,
        shootInterval: 1500,
        bulletSpeed: 3,
        bulletCount: 1,
        score: 100,
        colors: {
            primary: '#770022',
            secondary: '#ff2244',
            accent: '#ff4466',
            glow: '#ff0044',
            core: '#ffaa00'
        }
    },
    fighter: {
        name: '中型战斗机',
        width: 56,
        height: 48,
        hp: 3,
        speedBase: 2,
        speedVar: 0.5,
        canShoot: true,
        shootInterval: 1200,
        bulletSpeed: 4,
        bulletCount: 3,
        score: 300,
        colors: {
            primary: '#774400',
            secondary: '#ff8844',
            accent: '#ffaa66',
            glow: '#ff6600',
            core: '#ffcc00'
        }
    },
    bomber: {
        name: '重型轰炸机',
        width: 80,
        height: 64,
        hp: 8,
        speedBase: 1,
        speedVar: 0.3,
        canShoot: true,
        shootInterval: 2500,
        bulletSpeed: 2.5,
        bulletCount: 12,
        score: 800,
        colors: {
            primary: '#226600',
            secondary: '#66cc44',
            accent: '#88ee66',
            glow: '#44aa00',
            core: '#aaff00'
        }
    },
    elite: {
        name: '精英战机',
        width: 56,
        height: 56,
        hp: 5,
        speedBase: 2.5,
        speedVar: 0.5,
        canShoot: true,
        shootInterval: 1000,
        bulletSpeed: 5,
        bulletCount: 3,
        score: 500,
        colors: {
            primary: '#440066',
            secondary: '#aa44ff',
            accent: '#cc66ff',
            glow: '#8800ff',
            core: '#ff44ff'
        }
    }
};

const BOSS_TYPES = {
    mech: {
        name: '机械巨兽',
        width: 120,
        height: 96,
        hp: 50,
        speedBase: 0.5,
        phases: 4,
        score: 5000,
        colors: {
            primary: '#662200',
            secondary: '#cc4400',
            accent: '#ff6600',
            glow: '#ff2200',
            core: '#ffaa00'
        }
    },
    bio: {
        name: '生化母舰',
        width: 128,
        height: 100,
        hp: 60,
        speedBase: 0.3,
        phases: 4,
        score: 6000,
        colors: {
            primary: '#006622',
            secondary: '#44cc66',
            accent: '#66ff88',
            glow: '#00ff44',
            core: '#aaff00'
        }
    }
};

const ITEM_TYPES = {
    powerUp: {
        label: 'P',
        name: '火力提升',
        effect: 'weaponLevelUp',
        size: 24,
        color: '#00ff00',
        duration: 10000,
        dropRates: { drone: 0.08, fighter: 0.15, bomber: 0.25, elite: 0.2, boss: 0.5 }
    },
    weaponSwitch: {
        label: 'W',
        name: '武器切换',
        effect: 'switchWeapon',
        size: 24,
        color: '#ff00ff',
        duration: 15000,
        dropRates: { drone: 0.02, fighter: 0.05, bomber: 0.1, elite: 0.08, boss: 0.3 }
    },
    speedUp: {
        label: 'S',
        name: '速度提升',
        effect: 'speedUp',
        size: 24,
        color: '#00aaff',
        duration: 15000,
        dropRates: { drone: 0.03, fighter: 0.08, bomber: 0.15, elite: 0.1, boss: 0.2 }
    },
    bomb: {
        label: 'B',
        name: '炸弹',
        effect: 'addBomb',
        size: 24,
        color: '#ffaa00',
        dropRates: { drone: 0.01, fighter: 0.05, bomber: 0.1, elite: 0.06, boss: 0.25 }
    },
    extraLife: {
        label: '1UP',
        name: '额外生命',
        effect: 'addLife',
        size: 24,
        color: '#ff00ff',
        dropRates: { drone: 0.001, fighter: 0.005, bomber: 0.01, elite: 0.005, boss: 0.1 }
    }
};

const ACHIEVEMENTS = {
    firstSortie: { name: '初次出击', desc: '首次通关', reward: 1000 },
    grazeMaster: { name: '弹幕大师', desc: '擦弹1000发', reward: 5000 },
    comboKing: { name: '连击之王', desc: '达成100连击', reward: 10000 },
    noDamageBoss: { name: '无伤通关', desc: '无伤击败Boss', reward: 20000 },
    lunaticClear: { name: '弹幕地狱', desc: '通关疯狂难度', reward: 50000 }
};

function getUnlockedSkins() {
    try {
        return JSON.parse(localStorage.getItem('planeWarUnlockedSkins') || '["default"]');
    } catch {
        return ['default'];
    }
}

function getUnlockedWeapons() {
    try {
        return JSON.parse(localStorage.getItem('planeWarUnlockedWeapons') || '["vulcan"]');
    } catch {
        return ['vulcan'];
    }
}

function getAchievements() {
    try {
        return JSON.parse(localStorage.getItem('planeWarAchievements') || '{}');
    } catch {
        return {};
    }
}

function saveUnlockedSkins(skins) {
    localStorage.setItem('planeWarUnlockedSkins', JSON.stringify(skins));
}

function saveUnlockedWeapons(weapons) {
    localStorage.setItem('planeWarUnlockedWeapons', JSON.stringify(weapons));
}

function saveAchievements(achievements) {
    localStorage.setItem('planeWarAchievements', JSON.stringify(achievements));
}
