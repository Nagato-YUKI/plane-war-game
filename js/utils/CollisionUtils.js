const CollisionUtils = {
    getHitbox(entity, ratio) {
        const w = entity.width * ratio;
        const h = entity.height * ratio;
        return {
            x: entity.x + (entity.width - w) / 2,
            y: entity.y + (entity.height - h) / 2,
            width: w,
            height: h
        };
    },

    checkCollision(e1, r1, e2, r2) {
        const h1 = this.getHitbox(e1, r1);
        const h2 = this.getHitbox(e2, r2);
        return (
            h1.x < h2.x + h2.width &&
            h1.x + h1.width > h2.x &&
            h1.y < h2.y + h2.height &&
            h1.y + h1.height > h2.y
        );
    },

    checkGraze(player, bullet, grazeDistance = 20) {
        const playerHitbox = this.getHitbox(player, PLAYER_HITBOX_RATIO);
        const bulletHitbox = this.getHitbox(bullet, BULLET_HITBOX_RATIO);

        const expandedPlayer = {
            x: playerHitbox.x - grazeDistance,
            y: playerHitbox.y - grazeDistance,
            width: playerHitbox.width + grazeDistance * 2,
            height: playerHitbox.height + grazeDistance * 2
        };

        const isNear = (
            expandedPlayer.x < bulletHitbox.x + bulletHitbox.width &&
            expandedPlayer.x + expandedPlayer.width > bulletHitbox.x &&
            expandedPlayer.y < bulletHitbox.y + bulletHitbox.height &&
            expandedPlayer.y + expandedPlayer.height > bulletHitbox.y
        );

        const isHit = this.checkCollision(player, PLAYER_HITBOX_RATIO, bullet, BULLET_HITBOX_RATIO);

        return isNear && !isHit && !bullet.grazed;
    }
};
