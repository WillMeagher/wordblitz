var express = require('express');
var router = express.Router();
const { requiresAuth } = require('express-openid-connect');
var consts = require('../model/constants');

// Middleware to make sure player is playing
router.use(requiresAuth(), async function (req, res, next) {
  next();
});

/* GET home page. */
router.get('/', async function(req, res, next) {
  res.redirect(req.originalUrl + "/" + consts.DEFAULT_WORD_LEN)
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

  console.log("started game")
  
  await db.updateUser(res);

  game = (await db.getUser(email)).games[len];
  gameOver = await db.gameOver(email, len);

  res.render('game', { title: process.env.APP_NAME, game: game, len: len });
});

router.post('/guess/:len', async function(req, res, next) {
  db = res.locals.db;
  len = req.params.len
  guess = req.body.guess;

  if (!await db.validWord(guess, len)) {
    console.log("Invalid Guess"); 
    res.status(204).send()
  } else {
    await db.makeGuess(email, req.body.guess, len);
    res.redirect('/game/' + len);
  }
});

module.exports = router;
