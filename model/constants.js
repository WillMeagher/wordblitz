var types = ['blitz', 'zen']

module.exports = {
    MIN_WORD_LEN: 3,
    MAX_WORD_LEN: 6,
    DEFAULT_WORD_LEN: 5,
    DEFAULT_GAME_TYPE: types[0],
    GAME_TYPES: types,
    DEFAULT_GAME_SCORES :{
        '1': 0,
        '2': 0,
        '3': 0,
        '4': 0,
        '5': 0,
        '6': 0,
        failed: 0,
        gamesPlayed: 0,
        totalScore: 0,
    },
    LEADERBOARD_REQUIRED_GAMES_PLAYED: 5,
    BLITZ_TIME_SEC: 3 * 60,
    DESCRIPTIONS: {
        blitz: "Blitz is a fast paced game mode where you have 3 minutes to guess the word. While you have to beat the clock, your final time is not incorperated into your score.",
        zen: "Zen is a casual game mode where you can take as much time as you want to guess the word. Rankings are based on how many guesses it takes you to get the word so choose your guesses carefully.",
    }

}