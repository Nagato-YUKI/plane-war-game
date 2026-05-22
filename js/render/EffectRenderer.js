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
    }
};
