const LeaderboardSystem = {
    STORAGE_KEY: 'planeWarLeaderboard',
    PLAYER_ID_KEY: 'planeWarPlayerId',
    MAX_RECORDS: 20,
    _leaderboard: null,

    init() {
        try {
            this._leaderboard = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
        } catch {
            this._leaderboard = [];
        }
    },

    addRecord(playerId, score, difficulty, wave) {
        const record = {
            playerId: (playerId || '').substring(0, 8),
            score: Math.floor(score),
            difficulty: difficulty || 'NORMAL',
            wave: wave || 1,
            date: new Date().toLocaleDateString('zh-CN')
        };
        this._leaderboard.push(record);
        this._leaderboard.sort((a, b) => b.score - a.score);
        this._leaderboard = this._leaderboard.slice(0, this.MAX_RECORDS);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this._leaderboard));
    },

    getLeaderboard() {
        return this._leaderboard || [];
    },

    getPlayerId() {
        return localStorage.getItem(this.PLAYER_ID_KEY) || '';
    },

    setPlayerId(id) {
        localStorage.setItem(this.PLAYER_ID_KEY, (id || '').substring(0, 8));
    },

    getPlayerRank(score) {
        const lb = this.getLeaderboard();
        for (let i = 0; i < lb.length; i++) {
            if (lb[i].score <= score) return i + 1;
        }
        return lb.length < this.MAX_RECORDS ? lb.length + 1 : -1;
    }
};
