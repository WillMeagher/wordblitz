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
        blitz: "Blitz is a fast paced gamemode where you will just have 3 minutes to guess the word. As long as you guess the word in the allotted time your time remaining does not matter however the number of guesses it takes you does matter.",
        zen: "Zen is a casual gamemode where you can take as much time as you want to guess the word. Rankings are baised on how many guesses it takes you to get the word so choose your guesses carefully.",
    }

}