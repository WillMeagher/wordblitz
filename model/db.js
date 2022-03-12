var dbo = require('./dbStartup');
dbo.connectToServer(err => {if (err) {console.log(err)}});
var consts = require('./constants');

module.exports = {
    getNewAnswer: async function (len) {
        const db = dbo.getDb();
        words = (await db.collection('words').findOne({type: "answers"})).words[len];
        return words[Math.floor(Math.random()*words.length)];
    },

    validWord: async function (word, len) {
        if (word.length == len) {
            var query = {}
            query['words.' + len] = word

            const db = dbo.getDb();
            return /^[a-z]+$/.test(word) && await db.collection('words').findOne(query) != null; 
        } else {
            return false
        }
    },

    setUser: async function(email, user) {
        const db = dbo.getDb();
        await db.collection('users').updateOne({email: email}, {$set: user});
    },

    createUser: async function (email, name) {
        const db = dbo.getDb();
        var user = {
            email: email,
            name: name,
            created: new Date(),
            scores: {},
            games: {},
        };
        await db.collection('users').insertOne(user);
        return user;
    },

    getUser: async function (email) {
        const db = dbo.getDb();
        return await db.collection('users').findOne({email: email});
    },

    userExists: async function (email) {
        return (await this.getUser(email)) != null;
    },

    startGame: async function (email, type, len) {
        var newGame = {
            guesses: new Array(6).fill(null),
            word: await this.getNewAnswer(len),
            start_time: type == "blitz" ? Math.floor(Date.now() / 1000) : null,
        };

        await this.updateGame(email, newGame, type, len);
    },

    inGame: async function (email, type, len) {
        return (await this.userExists(email) && (await this.getUser(email)).games[type]?.[len]); 
    },

    updateGame: async function (email, game, type, len) {
        const db = dbo.getDb();
        var query = {$set: {}};
        query.$set['games.' + type + "." + len] = game;

        await db.collection('users').updateOne({email: email}, query);
    },

    gameOver: async function (email, type, len) {
        if (!await this.inGame(email, type, len)) {
            return false;
        }
        var user = await this.getUser(email);

        if (this.timeLeft(user.games[type][len]) < 0) {
            return true;
        }

        var guesses = 1;
        for (const guess of user.games[type][len].guesses) {
            if (guess == null) {
                return false;
            } else {
                var thisGuess = "";

                for (const [key, letter] of Object.entries(guess)) {
                    thisGuess += letter.char;
                }

                if (thisGuess == user.games[type][len].word) {
                    return true;
                }
            }
            guesses ++;
        }
        return true;
    },

    timeLeft: function (game) {
        return (game.start_time != null) ? consts.BLITZ_TIME_SEC - (Math.floor(Date.now() / 1000) - game.start_time) : NaN;
    },

    endGame: async function (email, type, len) {
        if (!await this.inGame(email, type, len)) {
            return;
        }
        var user = await this.getUser(email);

        if (this.timeLeft(user.games[type][len]) < 0) {
            user.scores[type] = user.scores[type] ?? {};
            user.scores[type][len] = user.scores[type][len] ?? consts.DEFAULT_GAME_SCORES;
            user.scores[type][len].failed += 1;
            user.scores[type][len].gamesPlayed += 1;
            user.scores[type][len].totalScore += 8;
            user.games[type][len] = null;
            await this.setUser(email, user);
            return;
        }

        var guesses = 1;
        for (const guess of user.games[type][len].guesses) {
            if (guess == null) {
                return;
            } else {
                var thisGuess = "";
                for (const [key, letter] of Object.entries(guess)) {
                    thisGuess += letter.char;
                }

                if (thisGuess == user.games[type][len].word) {
                    user.scores[type] = user.scores[type] ?? {};
                    user.scores[type][len] = user.scores[type][len] ?? consts.DEFAULT_GAME_SCORES;
                    user.scores[type][len][guesses] += 1;
                    user.scores[type][len].gamesPlayed += 1;
                    user.scores[type][len].totalScore += guesses;
                    user.games[type][len] = null;
                    await this.setUser(email, user);
                    return;
                }
            }
            guesses ++;
        }

        user.scores[type] = user.scores[type] ?? {};
        user.scores[type][len] = user.scores[type][len] ?? consts.DEFAULT_GAME_SCORES;
        user.scores[type][len].failed += 1;
        user.scores[type][len].gamesPlayed += 1;
        user.scores[type][len].totalScore += 8;
        user.games[type][len] = null;
        await this.setUser(email, user);
    },

    makeGuess: async function (email, word, type, len) {
        if (await this.validWord(word, len) && await this.inGame(email, type, len) && !await this.gameOver(email, type, len)) {
            var set = false;
            var user = await this.getUser(email);
            user.games[type][len].guesses = user.games[type][len].guesses.map(guess => {
                if (!set && guess == null) {
                    var answer = user.games[type][len].word;
                    set = true;
                    word = word.split("")

                    // set greens
                    word = word.map(function(char, index) {
                        if (answer[index] == char) {
                            // remove chararaters from string to prevent repeat "matches"
                            answer = answer.split("");
                            answer[index] = " ";
                            answer = answer.join("");

                            return {
                                accuracy: "correct",
                                char: char
                            };
                        } else {
                            return char
                        }
                    });

                    // set yellows and reds
                    return word.map(function(char) {
                        if (char.constructor == Object) {
                            return char;
                        } else if (answer.includes(char)) {
                            answer = answer.replace(new RegExp(char), " ");
                            return {
                                accuracy: "close",
                                char: char
                            };
                        } else {
                            return {
                                accuracy: "wrong",
                                char: char
                            };
                        }
                    });
                } else {
                    return guess;
                }
            });
            await this.setUser(email, user)
        }
    },

    getLeaderboard: async function (type, len) {
        const db = dbo.getDb();
        var query = [
            {$match: {}},
            {$project:{email: "$email", name: "$name", totalScore: ("$scores." + type + "." + len + ".totalScore"), gamesPlayed: ("$scores." + type + "." + len + ".gamesPlayed"), averageScore: {$divide: [("$scores." + type + "." + len + ".totalScore"), ("$scores." + type + "." + len + ".gamesPlayed")]}}}, 
            {$sort:{averageScore: 1}}
        ];
        query[0].$match["scores." + type + "." + len + ".gamesPlayed"] = {$gte: consts.LEADERBOARD_REQUIRED_GAMES_PLAYED};

        return await db.collection('users').aggregate(query);
    },

    updateData: async function () {
        const db = dbo.getDb();
        users = await db.collection('users').find().toArray();
        for (let i = 0; i < users.length; i++) {
            user = users[i];

            var scores = {
                'zen': JSON.parse(JSON.stringify(user.scores))
            }

            var games = {
                'zen': JSON.parse(JSON.stringify(user.games))
            }

            user.scores = scores;
            user.games = games;

            await this.setUser(user.email, user);
        }
    }

    /*
    migrateData: async function () {
        const db = dbo.getDb();
        var data = require('./data');
        var query = {$set: {}};
        console.log(data.words);
        query.$set['words.3'] = data.words;
        await db.collection('words').updateOne({type: "all"}, query);
    },
    */

}