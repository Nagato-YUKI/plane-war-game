const ScoreSystem = {
    score: 0,
    highScore: 0,
    totalScore: 0,
    comboCount: 0,
    comboTimer: 0,
    comboMax: 0,
    grazeCount: 0,
    grazeTotal: 0,
    scorePopups: [],
    unlockNotifications: [],

    init() {
        this.score = 0;
        this.comboCount = 0;
        this.comboTimer = 0;
        this.comboMax = 0;
        this.grazeCount = 0;
        this.grazeTotal = 0;
        this.scorePopups = [];
        this.unlockNotifications = [];
        this.highScore = parseInt(localStorage.getItem('planeWarHighScore') || '0', 10);
        this.totalScore = parseInt(localStorage.getItem('planeWarTotalScore') || '0', 10);
    },

    addScore(value, x, y, difficulty) {
        const mult = this.getComboMultiplier();
        const diff = DIFFICULTY[difficulty] || DIFFICULTY.NORMAL;
        const finalValue = Math.floor(value * mult * diff.scoreMult);
        this.score += finalValue;

        if (x !== undefined && y !== undefined) {
            this.scorePopups.push({
                x, y,
                value: finalValue,
                life: 40,
                maxLife: 40,
                vy: -2
            });
        }

        return finalValue;
    },

    addCombo(amount) {
        this.comboCount = Math.floor(this.comboCount + amount);
        this.comboTimer = 180;
        if (this.comboCount > this.comboMax) {
            this.comboMax = this.comboCount;
        }
    },

    addGraze() {
        this.grazeCount++;
        this.grazeTotal++;
        this.addCombo(0.1);
    },

    update() {
        this.updateCombo();
        this.updatePopups();
        this.updateNotifications();
    },

    updateCombo() {
        if (this.comboTimer > 0) {
            this.comboTimer--;
        } else if (this.comboCount > 0) {
            this.comboCount = Math.max(0, this.comboCount - 5);
        }
    },

    getComboMultiplier() {
        if (this.comboCount >= 100) return 5.0;
        if (this.comboCount >= 50) return 3.0;
        if (this.comboCount >= 30) return 2.0;
        if (this.comboCount >= 10) return 1.5;
        return 1.0;
    },

    updatePopups() {
        for (let i = this.scorePopups.length - 1; i >= 0; i--) {
            const p = this.scorePopups[i];
            p.y += p.vy;
            p.life--;
            if (p.life <= 0) this.scorePopups.splice(i, 1);
        }
    },

    updateNotifications() {
        for (let i = this.unlockNotifications.length - 1; i >= 0; i--) {
            this.unlockNotifications[i].life--;
            if (this.unlockNotifications[i].life <= 0) {
                this.unlockNotifications.splice(i, 1);
            }
        }
    },

    addNotification(text, life = 180) {
        this.unlockNotifications.push({ text, life, maxLife: life });
    },

    checkUnlocks(newTotal) {
        const uw = getUnlockedWeapons();
        const us = getUnlockedSkins();
        const newUnlocks = [];

        if (newTotal >= 300 && !uw.includes('laser')) {
            uw.push('laser');
            saveUnlockedWeapons(uw);
            newUnlocks.push('激光武器');
        }
        if (newTotal >= 800 && !uw.includes('missile')) {
            uw.push('missile');
            saveUnlockedWeapons(uw);
            newUnlocks.push('导弹武器');
        }
        if (newTotal >= 500 && !us.includes('flame')) {
            us.push('flame');
            saveUnlockedSkins(us);
            newUnlocks.push('烈焰战机皮肤');
        }
        if (newTotal >= 1500 && !us.includes('ice')) {
            us.push('ice');
            saveUnlockedSkins(us);
            newUnlocks.push('冰霜战机皮肤');
        }
        if (newTotal >= 3000 && !us.includes('shadow')) {
            us.push('shadow');
            saveUnlockedSkins(us);
            newUnlocks.push('暗影战机皮肤');
        }
        if (newTotal >= 5000 && !us.includes('holy')) {
            us.push('holy');
            saveUnlockedSkins(us);
            newUnlocks.push('圣光战机皮肤');
        }

        for (const name of newUnlocks) {
            this.addNotification(`解锁: ${name}!`, 180);
        }
    },

    checkAchievements(difficulty, bossNoDamage) {
        const achievements = getAchievements();
        const newAchievements = [];

        if (this.grazeTotal >= 1000 && !achievements.grazeMaster) {
            achievements.grazeMaster = true;
            newAchievements.push(ACHIEVEMENTS.grazeMaster);
        }
        if (this.comboMax >= 100 && !achievements.comboKing) {
            achievements.comboKing = true;
            newAchievements.push(ACHIEVEMENTS.comboKing);
        }
        if (bossNoDamage && !achievements.noDamageBoss) {
            achievements.noDamageBoss = true;
            newAchievements.push(ACHIEVEMENTS.noDamageBoss);
        }
        if (difficulty === 'LUNATIC' && !achievements.lunaticClear) {
            achievements.lunaticClear = true;
            newAchievements.push(ACHIEVEMENTS.lunaticClear);
        }

        if (newAchievements.length > 0) {
            saveAchievements(achievements);
            for (const ach of newAchievements) {
                this.addNotification(`成就: ${ach.name}! +${ach.reward}分`, 240);
                this.score += ach.reward;
            }
        }
    },

    saveHighScore() {
        const finalScore = Math.floor(this.score);
        if (finalScore > this.highScore) {
            this.highScore = finalScore;
            localStorage.setItem('planeWarHighScore', this.highScore.toString());
        }
        this.totalScore += finalScore;
        localStorage.setItem('planeWarTotalScore', this.totalScore.toString());
        return finalScore;
    },

    getScore() { return Math.floor(this.score); },
    getHighScore() { return this.highScore; },
    getTotalScore() { return this.totalScore; },
    getComboCount() { return this.comboCount; },
    getGrazeTotal() { return this.grazeTotal; },
    getScorePopups() { return this.scorePopups; },
    getNotifications() { return this.unlockNotifications; }
};
