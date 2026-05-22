const ItemSystem = {
    items: [],
    weaponDurationTimer: 0,
    weaponDurationMax: 0,

    init() {
        this.items = [];
        this.weaponDurationTimer = 0;
        this.weaponDurationMax = 0;
    },

    spawnFromEnemy(enemy) {
        for (const [itemType, config] of Object.entries(ITEM_TYPES)) {
            const rate = config.dropRates[enemy.type] || 0;
            if (Math.random() < rate) {
                this.items.push({
                    x: enemy.x + enemy.width / 2 - config.size / 2,
                    y: enemy.y + enemy.height / 2 - config.size / 2,
                    width: config.size,
                    height: config.size,
                    itemType,
                    speed: 2
                });
            }
        }
    },

    update(player) {
        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            item.y += item.speed;

            if (item.y > CANVAS_HEIGHT + 30) {
                this.items.splice(i, 1);
                continue;
            }

            if (CollisionUtils.checkCollision(player, PLAYER_HITBOX_RATIO, item, ITEM_HITBOX_RATIO)) {
                this.applyItem(item.itemType, player);
                this.items.splice(i, 1);
            }
        }

        this.updateWeaponDuration(player);
    },

    applyItem(itemType, player) {
        const config = ITEM_TYPES[itemType];

        switch (config.effect) {
            case 'weaponLevelUp':
                if (player.weaponLevel < WEAPONS[player.weapon].maxLevel) {
                    player.weaponLevel++;
                    const duration = Math.max(WEAPON_MIN_DURATION,
                        WEAPON_DURATION - (player.weaponLevel - 1) * WEAPON_DURATION_PER_LEVEL);
                    this.weaponDurationMax = duration;
                    this.weaponDurationTimer = duration;
                }
                ScoreSystem.addCombo(5);
                break;

            case 'switchWeapon':
                const unlocked = getUnlockedWeapons();
                const weaponIds = Object.keys(WEAPONS);
                const currentIdx = weaponIds.indexOf(player.weapon);
                for (let i = 1; i < weaponIds.length; i++) {
                    const nextIdx = (currentIdx + i) % weaponIds.length;
                    if (unlocked.includes(weaponIds[nextIdx])) {
                        player.weapon = weaponIds[nextIdx];
                        player.weaponLevel = Math.max(1, player.weaponLevel - 1);
                        const duration = WEAPONS[player.weapon].duration || WEAPON_DURATION;
                        this.weaponDurationMax = duration;
                        this.weaponDurationTimer = duration;
                        break;
                    }
                }
                ScoreSystem.addCombo(3);
                break;

            case 'speedUp':
                player.speedBoostUntil = Date.now() + config.duration;
                player.speedBoostLevel = Math.min(player.speedBoostLevel + 1, 2);
                ScoreSystem.addCombo(2);
                break;

            case 'addBomb':
                if (player.bombs < PLAYER_MAX_BOMBS) player.bombs++;
                ScoreSystem.addCombo(2);
                break;

            case 'addLife':
                if (player.lives < 8) player.lives++;
                ScoreSystem.addCombo(10);
                break;
        }
    },

    updateWeaponDuration(player) {
        if (this.weaponDurationTimer > 0) {
            this.weaponDurationTimer -= 16;
            if (this.weaponDurationTimer <= 0) {
                if (player.weaponLevel > 1) {
                    player.weaponLevel--;
                    const duration = Math.max(WEAPON_MIN_DURATION,
                        WEAPON_DURATION - (player.weaponLevel - 1) * WEAPON_DURATION_PER_LEVEL);
                    this.weaponDurationMax = duration;
                    this.weaponDurationTimer = duration;
                }
            }
        }
    },

    getItems() { return this.items; },
    getWeaponDurationRatio() {
        if (this.weaponDurationMax <= 0) return 0;
        return Math.max(0, this.weaponDurationTimer / this.weaponDurationMax);
    }
};
