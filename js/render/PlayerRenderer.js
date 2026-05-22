const PlayerRenderer = {
    draw(ctx, player, selectedSkin) {
        const isInvincible = player.isInvincible();

        if (isInvincible && Math.floor(Date.now() / 100) % 2 === 0) {
            ctx.globalAlpha = 0.3;
        }

        const skin = SKINS[selectedSkin] || SKINS.default;
        const asset = getAsset(`player_${selectedSkin}`);

        if (asset) {
            ctx.globalAlpha = skin.opacity || 1;
            ctx.drawImage(asset, player.x, player.y, player.width, player.height);
            ctx.globalAlpha = 1;
        } else {
            this.drawFallback(ctx, player, skin);
        }

        if (player.hasShield()) {
            const shieldAlpha = 0.3 + Math.sin(Date.now() / 200) * 0.2;
            ctx.strokeStyle = `rgba(0, 170, 255, ${shieldAlpha})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(
                player.getCenterX(),
                player.getCenterY(),
                player.width * 0.7,
                0, Math.PI * 2
            );
            ctx.stroke();
        }

        ctx.globalAlpha = 1;
    },

    drawFallback(ctx, player, skin) {
        ctx.fillStyle = skin.colors.primary;
        ctx.fillRect(player.x, player.y, player.width, player.height);
        ctx.fillStyle = skin.colors.secondary;
        ctx.fillRect(player.x + 5, player.y + 5, player.width - 10, player.height - 10);
        ctx.fillStyle = skin.colors.accent;
        ctx.fillRect(player.x + player.width / 2 - 2, player.y, 4, player.height);
        ctx.fillStyle = skin.colors.core;
        ctx.beginPath();
        ctx.arc(player.getCenterX(), player.getCenterY(), 3, 0, Math.PI * 2);
        ctx.fill();
    }
};
