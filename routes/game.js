var express = require('express');
var router = express.Router();
const { requiresAuth } = require('express-openid-connect');
var consts = require('../model/constants');

// Middleware to make sure player is playing
router.use(requiresAuth(), async function (req, res, next) {
  db = res.locals.db;
  email = res.locals.user.email;

  if (!(await db.userExists(email))) {
    await db.createUser(email);
  }
  
  next();
});

/* GET home page. */
router.get('/', async function(req, res, next) {
  res.redirect(req.originalUrl + "/" + consts.DEFAULT_WORD_LEN);
});

/* GET home page. */
router.get('/:len', async function(req, res, next) {
  db = res.locals.db;
  len = req.params.len
  email = res.locals.user.email;

  // start game if user is not in game
  if (!await db.inGame(email, len)) {
    await db.startGame(email, len);
  }

  game = (await db.getUser(email)).games[len];
  // end the game if the game is over
  if (await db.gameOver(email, len)) {
    await db.endGame(email, len)
  }

  res.render('game', { 
    title: process.env.APP_NAME, 
    game: game, 
    len: len,
  });
});

router.post('/guess/:len', async function(req, res, next) {
  db = res.locals.db;
  len = req.params.len;
  guess = req.body.guess;
  email = res.locals.user.email;

  if (!await db.validWord(guess, len)) {
    console.log("Invalid Guess"); 
    res.status(204).send();
  } else {
    // makeGuess only runs if word is valid inGame and !gameOver
    await db.makeGuess(email, req.body.guess, len);
    res.redirect('/game/' + len);
  }
});

module.exports = router;
