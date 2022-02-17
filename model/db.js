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
            query = {}
            query['words.' + len] = word

            const db = dbo.getDb();
            return /^[a-z]+$/.test(word) && await db.collection('words').findOne(query) != null; 
        } else {
            return false
        }
    },

    updateUser: async function (res) {
        userInfo = await this.getUser(res.locals.user.email);
        if (typeof userInfo === 'undefined') {
          userInfo = await this.createUser(res.locals.user.email);
        }
        for (const [key, value] of Object.entries(userInfo)) {
          res.locals.user[key] = value;
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
        query = {$set: {}};
        query.$set['games.' + len] = game

        await db.collection('users').updateOne({email: email}, query);
    },

    gameOver: async function (email, len) {
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
                    user.scores[len][guesses] += 1;
                    user.games[len] = null;
                    await this.setUser(email, user);
                    console.log("game over");
                    return true;
                }
            }
            guesses ++;
        }
        user.scores[len].failed += 1;
        user.games[len] = null;
        await this.setUser(email, user);
        console.log("game over");
        return true;
    },

    makeGuess: async function (email, word, len) {
        user = await this.getUser(email);
        if (await this.validWord(word, len) && !await this.gameOver(email, len)) {
            set = false;
            user.games[len].guesses = user.games[len].guesses.map(guess => {
                if (!set && guess == null) {
                    set = true;
                    return word.split("").map(function(char, index) {
                        if (user.games[len].word[index] == char) {
                            return {
                                accuracy: "correct",
                                char: char
                            };
                        } else if (user.games[len].word.includes(char)) {
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
            console.log(user)
            await this.setUser(email, user)
        } else {
            console.log("Invalid Guess"); 
        }
    }
}