const UIRenderer = {
    _time: 0,

    get _showLeaderboard() { return UIScreen._showLeaderboard; },
    set _showLeaderboard(v) { UIScreen._showLeaderboard = v; },

    drawHUD(ctx, player, difficulty, waveNumber, selectedSkin, selectedWeapon, weaponDurationRatio) {
        UIHUD.draw(ctx, player, difficulty, waveNumber, selectedSkin, selectedWeapon, weaponDurationRatio);
    },

    drawScorePopups(ctx, popups) {
        UIHUD.drawScorePopups(ctx, popups);
    },

    drawNotifications(ctx, notifications) {
        UIHUD.drawNotifications(ctx, notifications);
    },

    drawStartScreen(ctx) {
        UIScreen.drawStartScreen(ctx);
    },

    drawGameOverScreen(ctx) {
        UIScreen.drawGameOverScreen(ctx);
    }
};
