const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 640;

const PLAYER_WIDTH = 48;
const PLAYER_HEIGHT = 56;
const PLAYER_SPEED = 5;
const PLAYER_LIVES = 3;
const PLAYER_INVINCIBLE_MS = 2000;
const PLAYER_HITBOX_RATIO = 0.4;
const PLAYER_MAX_BOMBS = 3;

const ENEMY_HITBOX_RATIO = 0.8;
const BULLET_HITBOX_RATIO = 0.7;
const ITEM_HITBOX_RATIO = 1.2;

const STAR_COUNT = 120;
const PARTICLE_LIMIT = 300;

const GAME_STATE = {
    START: 'start',
    PLAYING: 'playing',
    GAME_OVER: 'game_over'
};

const SKINS = {
    default: {
        name: '雷电战机',
        unlockScore: 0,
        opacity: 1.0,
        colors: {
            primary: '#005577',
            secondary: '#00ccff',
            accent: '#00ffff',
            glow: '#00ffff',
            core: '#ffffff',
            engine: ['#00ffff', '#00aaff', '#0066ff', '#ffffff']
        }
    },
    stealth: {
        name: '隐身战机',
        unlockScore: 500,
        opacity: 0.6,
        colors: {
            primary: '#334455',
            secondary: '#668899',
            accent: '#88aacc',
            glow: '#88aacc',
            core: '#aabbcc',
            engine: ['#88aacc', '#668899', '#445566', '#aabbcc']
        }
    },
    gold: {
        name: '黄金战机',
        unlockScore: 2000,
        opacity: 1.0,
        colors: {
            primary: '#886600',
            secondary: '#ffcc00',
            accent: '#ffdd44',
            glow: '#ffaa00',
            core: '#ffffff',
            engine: ['#ffaa00', '#ffcc00', '#ff8800', '#ffffff']
        }
    },
    fighter: {
        name: '战斗机',
        unlockScore: 1000,
        opacity: 1.0,
        colors: {
            primary: '#772222',
            secondary: '#ff4444',
            accent: '#ff6666',
            glow: '#ff0000',
            core: '#ffffff',
            engine: ['#ff4444', '#ff6666', '#ff0000', '#ffffff']
        }
    }
};

const WEAPONS = {
    vulcan: {
        name: '火神炮',
        unlockScore: 0,
        color: '#00ffff',
        levels: [
            { count: 1, spread: 0, interval: 150, speed: 10 },
            { count: 3, spread: 15, interval: 130, speed: 10 },
            { count: 5, spread: 25, interval: 100, speed: 12 }
        ]
    },
    laser: {
        name: '激光',
        unlockScore: 300,
        color: '#ff00ff',
        levels: [
            { width: 8, damage: 2 },
            { width: 14, damage: 3 },
            { width: 22, damage: 5 }
        ]
    },
    missile: {
        name: '导弹',
        unlockScore: 800,
        color: '#ffaa00',
        levels: [
            { count: 1, speed: 6, interval: 400 },
            { count: 2, speed: 7, interval: 350 },
            { count: 3, speed: 8, interval: 300 }
        ]
    },
    plasma: {
        name: '等离子',
        unlockScore: 1500,
        color: '#44ff88',
        levels: [
            { count: 2, spread: 30, interval: 180, speed: 8, damage: 2 },
            { count: 4, spread: 45, interval: 150, speed: 9, damage: 2 },
            { count: 6, spread: 60, interval: 120, speed: 10, damage: 3 }
        ]
    }
};

const ENEMY_TYPES = {
    small: {
        width: 40,
        height: 40,
        hp: 1,
        speedBase: 3,
        speedVar: 1,
        canShoot: false,
        score: 100,
        colors: {
            primary: '#770022',
            secondary: '#ff2244',
            accent: '#ff4466',
            glow: '#ff0044',
            core: '#ffaa00'
        }
    },
    medium: {
        width: 56,
        height: 48,
        hp: 3,
        speedBase: 2,
        speedVar: 0.5,
        canShoot: true,
        shootInterval: 1500,
        bulletSpeed: 4,
        score: 300,
        colors: {
            primary: '#774400',
            secondary: '#ff8844',
            accent: '#ffaa66',
            glow: '#ff6600',
            core: '#ffcc00'
        }
    },
    boss: {
        width: 120,
        height: 96,
        hp: 20,
        speedBase: 0.5,
        speedVar: 0,
        canShoot: true,
        score: 2000,
        colors: {
            primary: '#440066',
            secondary: '#aa00ff',
            accent: '#cc44ff',
            glow: '#8800ff',
            core: '#ff44ff'
        }
    }
};

const ITEM_TYPES = {
    powerUp: {
        label: 'P',
        name: '武器升级',
        effect: 'weaponLevelUp',
        size: 24,
        color: '#00ff00',
        dropRates: { small: 0.05, medium: 0.15, boss: 0.5 }
    },
    bomb: {
        label: 'B',
        name: '炸弹',
        effect: 'addBomb',
        size: 24,
        color: '#ffaa00',
        dropRates: { small: 0.01, medium: 0.08, boss: 0.3 }
    },
    shield: {
        label: 'S',
        name: '护盾',
        effect: 'addShield',
        size: 24,
        color: '#00aaff',
        dropRates: { small: 0.02, medium: 0.05, boss: 0.2 }
    },
    extraLife: {
        label: '1UP',
        name: '额外生命',
        effect: 'addLife',
        size: 24,
        color: '#ff00ff',
        dropRates: { small: 0.002, medium: 0.01, boss: 0.1 }
    }
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

function saveUnlockedSkins(skins) {
    localStorage.setItem('planeWarUnlockedSkins', JSON.stringify(skins));
}

function saveUnlockedWeapons(weapons) {
    localStorage.setItem('planeWarUnlockedWeapons', JSON.stringify(weapons));
}
