var dbo = require('./dbStartup');
dbo.connectToServer(err => {if (err) {console.log(err)}});
var consts = require('./constants');

module.exports = {
    getNewAnswer: async function (len = 5) {
        if (len <= consts.MAX_WORD_LEN && len >= consts.MIN_WORD_LEN) {
            const db = dbo.getDb();
            words = (await db.collection('words').findOne({type: "answers"})).words[len];
            return words[Math.floor(Math.random()*words.length)];
        } else {
            throw new Error('len of answer out of bounds');
        }
    },

    validWord: async function (word) {
        if (word.length <= consts.MAX_WORD_LEN && word.length >= consts.MIN_WORD_LEN) {
            query = {}
            query['words.' + word.length] = word

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
            '1': 0,
            '2': 0,
            '3': 0,
            '4': 0,
            '5': 0,
            '6': 0,
            loss: 0,
            game: null
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
            word: await this.getNewAnswer()
        };

        if (!await this.userExists(email)) {
            await this.createUser(email);
        }

        await this.updateGame(email, newGame);
    },

    inGame: async function (email) {
        return (await this.userExists(email) && (await this.getUser(email)).game != null); 
    },

    updateGame: async function (email, game) {
        const db = dbo.getDb();
        await db.collection('users').updateOne({email: email}, {$set: {"game": game}});
    },

    gameOver: async function (email) {
        user = await this.getUser(email);
        guesses = 1;
        for (const guess of user.game.guesses) {
            if (guess == null) {
                return false;
            } else {
                thisGuess = "";
                for (const [key, letter] of Object.entries(guess)) {
                    thisGuess += letter.char;
                }

                if (thisGuess == user.game.word) {
                    user[guesses] += 1;
                    user.game = null;
                    await this.setUser(email, user);
                    console.log("game over");
                    return true;
                }
            }
            guesses ++;
        }
        user.loss += 1;
        user.game = null;
        await this.setUser(email, user);
        console.log("game over");
        return true;
    },

    makeGuess: async function (email, word, len) {
        user = await this.getUser(email);
        if (await this.validWord(word) && !await this.gameOver(email)) {
            set = false;
            user.game.guesses = user.game.guesses.map(guess => {
                if (!set && guess == null) {
                    set = true;
                    return word.split("").map(function(char, index) {
                        if (user.game.word[index] == char) {
                            return {
                                accuracy: "correct",
                                char: char
                            };
                        } else if (user.game.word.includes(char)) {
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