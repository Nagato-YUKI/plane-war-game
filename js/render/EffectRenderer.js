const EffectRenderer = {
    drawParticles(ctx) {
        const particles = EffectSystem.getParticles();
        for (const p of particles) {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.alpha, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    },

    drawEngineParticles(ctx) {
        const particles = EffectSystem.getEngineParticles();
        for (const p of particles) {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha * 0.7;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.alpha, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    },

    drawBulletHitEffects(ctx) {
        const effects = EffectSystem.getBulletHitEffects();
        for (const e of effects) {
            const alpha = e.life / e.maxLife;
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = e.color;
            ctx.lineWidth = 2;
            ctx.shadowColor = e.color;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
        ctx.globalAlpha = 1;
    }
};
