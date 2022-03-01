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

    createUser: async function (email) {
        const db = dbo.getDb();
        user = {
            email: email,
            created: new Date(),
            scores: consts.DEFAULT_SCORES,
            games: consts.DEFAULT_GAME,
        };
        console.log("creating user");
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

    startGame: async function (email, len) {
        newGame = {
            guesses: new Array(6).fill(null),
            word: await this.getNewAnswer(len)
        };

        if (!await this.userExists(email)) {
            await this.createUser(email);
        }

        await this.updateGame(email, newGame, len);
    },

    inGame: async function (email, len) {
        return (await this.userExists(email) && (await this.getUser(email)).games[len] != null); 
    },

    updateGame: async function (email, game, len) {
        const db = dbo.getDb();
        var query = {$set: {}};
        query.$set['games.' + len] = game

        await db.collection('users').updateOne({email: email}, query);
    },

    gameOver: async function (email, len) {
        if (!await this.inGame(email, len)) {
            return false;
        }
        user = await this.getUser(email);
        guesses = 1;
        for (const guess of user.games[len].guesses) {
            if (guess == null) {
                return false;
            } else {
                thisGuess = "";

                for (const [key, letter] of Object.entries(guess)) {
                    thisGuess += letter.char;
                }

                if (thisGuess == user.games[len].word) {
                    return true;
                }
            }
            guesses ++;
        }
        return true;
    },

    endGame: async function (email, len) {
        if (!await this.inGame(email, len)) {
            return;
        }
        user = await this.getUser(email);
        guesses = 1;
        for (const guess of user.games[len].guesses) {
            if (guess == null) {
                return;
            } else {
                thisGuess = "";
                for (const [key, letter] of Object.entries(guess)) {
                    thisGuess += letter.char;
                }

                if (thisGuess == user.games[len].word) {
                    user.scores[len][guesses] += 1;
                    user.scores[len].gamesPlayed += 1;
                    user.scores[len].totalScore += guesses;
                    user.games[len] = null;
                    await this.setUser(email, user);
                    console.log("game over");
                    return;
                }
            }
            guesses ++;
        }
        user.scores[len].failed += 1;
        user.scores[len].gamesPlayed += 1;
        user.scores[len].totalScore += 8;
        user.games[len] = null;
        await this.setUser(email, user);
        console.log("game over");
    },

    makeGuess: async function (email, word, len) {
        if (await this.validWord(word, len) && await this.inGame(email, len) && !await this.gameOver(email, len)) {
            set = false;
            user = await this.getUser(email);
            user.games[len].guesses = user.games[len].guesses.map(guess => {
                if (!set && guess == null) {
                    set = true;
                    answer = user.games[len].word;
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

    getLeaderboard: async function (len) {
        const db = dbo.getDb();
        var query = [
            {$match: {}},
            {$project:{email: "$email", totalScore: ("$scores." + len + ".totalScore"), gamesPlayed: ("$scores." + len + ".gamesPlayed"), averageScore: {$divide: [("$scores." + len + ".totalScore"), ("$scores." + len + ".gamesPlayed")]}}}, 
            {$sort:{averageScore: 1}}
        ];
        query[0].$match["scores." + len + ".gamesPlayed"] = {$gte: 1};

        return await db.collection('users').aggregate(query);
    }
}