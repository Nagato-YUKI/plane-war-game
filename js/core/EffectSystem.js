const EffectSystem = {
    particles: [],
    screenShake: { x: 0, y: 0, intensity: 0 },
    engineParticles: [],
    bulletHitEffects: [],

    init() {
        this.particles = [];
        this.engineParticles = [];
        this.bulletHitEffects = [];
        this.screenShake = { x: 0, y: 0, intensity: 0 };
    },

    addScreenShake(intensity) {
        this.screenShake.intensity = Math.max(this.screenShake.intensity, intensity);
    },

    updateScreenShake() {
        if (this.screenShake.intensity > 0) {
            this.screenShake.x = (Math.random() - 0.5) * this.screenShake.intensity * 2;
            this.screenShake.y = (Math.random() - 0.5) * this.screenShake.intensity * 2;
            this.screenShake.intensity *= 0.9;
            if (this.screenShake.intensity < 0.5) {
                this.screenShake.intensity = 0;
                this.screenShake.x = 0;
                this.screenShake.y = 0;
            }
        }
    },

    createExplosion(x, y, color1, color2, count) {
        // 核心爆炸 - 快速扩散
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5 + 2;
            this.createParticle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                Math.random() > 0.5 ? color1 : color2,
                Math.random() * 25 + 15,
                Math.random() * 4 + 2
            );
        }

        // 火花 - 小颗粒高速
        for (let i = 0; i < count * 0.5; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 8 + 4;
            this.createParticle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                '#ffffff',
                Math.random() * 10 + 5,
                Math.random() * 2 + 0.5
            );
        }

        // 烟雾 - 大颗粒慢速
        for (let i = 0; i < count * 0.3; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 1.5 + 0.5;
            this.createParticle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed - 1,
                '#888888',
                Math.random() * 40 + 20,
                Math.random() * 6 + 3
            );
        }
    },

    createBulletHit(x, y, color) {
        this.bulletHitEffects.push({
            x, y, color,
            life: 10,
            maxLife: 10,
            size: 8
        });

        for (let i = 0; i < 5; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 1;
            this.createParticle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                color,
                10,
                Math.random() * 2 + 1
            );
        }
    },

    createParticle(x, y, vx, vy, color, life, size) {
        if (this.particles.length >= PARTICLE_LIMIT) return;
        this.particles.push({
            x, y, vx, vy, color,
            life, maxLife: life, size,
            alpha: 1
        });
    },

    createEngineParticle(x, y, colors) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        this.engineParticles.push({
            x: x + (Math.random() - 0.5) * 10,
            y: y,
            vx: (Math.random() - 0.5) * 0.5,
            vy: Math.random() * 2 + 1,
            color,
            life: 20,
            maxLife: 20,
            size: Math.random() * 3 + 2
        });
    },

    createGrazeEffect(x, y) {
        this.createParticle(x, y, 0, -1, '#ffffff', 15, 2);
        this.createParticle(x, y, -0.5, -0.5, '#ffff00', 10, 1);
        this.createParticle(x, y, 0.5, -0.5, '#ffff00', 10, 1);
    },

    update() {
        this.updateParticles();
        this.updateEngineParticles();
        this.updateBulletHitEffects();
        this.updateScreenShake();
    },

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            p.vx *= 0.96;
            p.vy *= 0.96;
            p.alpha = p.life / p.maxLife;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    },

    updateEngineParticles() {
        for (let i = this.engineParticles.length - 1; i >= 0; i--) {
            const p = this.engineParticles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            p.alpha = p.life / p.maxLife;
            if (p.life <= 0) this.engineParticles.splice(i, 1);
        }
    },

    updateBulletHitEffects() {
        for (let i = this.bulletHitEffects.length - 1; i >= 0; i--) {
            const e = this.bulletHitEffects[i];
            e.life--;
            e.size += 1;
            if (e.life <= 0) this.bulletHitEffects.splice(i, 1);
        }
    },

    getScreenShake() {
        return this.screenShake;
    },

    getParticles() {
        return this.particles;
    },

    getEngineParticles() {
        return this.engineParticles;
    },

    getBulletHitEffects() {
        return this.bulletHitEffects;
    }
};
