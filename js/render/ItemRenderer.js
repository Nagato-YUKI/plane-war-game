const ItemRenderer = {
    draw(ctx, items) {
        for (const item of items) {
            const asset = getAsset(`item_${item.itemType}`);
            if (asset) {
                ctx.drawImage(asset, item.x, item.y, item.width, item.height);
            } else {
                this.drawFallback(ctx, item);
            }
        }
    },

    drawFallback(ctx, item) {
        const typeDef = ITEM_TYPES[item.itemType];
        ctx.fillStyle = typeDef.color;
        ctx.shadowColor = typeDef.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(
            item.x + item.width / 2,
            item.y + item.height / 2,
            item.width / 2 - 2,
            0, Math.PI * 2
        );
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#000000';
        ctx.font = `bold ${item.width * 0.5}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
            typeDef.label,
            item.x + item.width / 2,
            item.y + item.height / 2 + 1
        );
    }
};
