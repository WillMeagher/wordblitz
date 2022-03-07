var express = require('express');
var router = express.Router();
const { requiresAuth } = require('express-openid-connect');
var consts = require('../model/constants');

// Middleware to make sure player is playing
router.use(requiresAuth(), async function (req, res, next) {
  if (!res.locals.user.email_verified) {
    res.cookie("error", "Email not verified", { httpOnly: true });
    return res.redirect(process.env.APP_URL);
  }

  var db = res.locals.db;
  var email = res.locals.user.email;
  var first_name = res.locals.user.given_name;

  if (!(await db.userExists(email))) {
    await db.createUser(email, first_name);
  }
  
  next();
});

/* GET home page. */
router.get('/', async function(req, res, next) {
  res.redirect(req.originalUrl + "/" + consts.DEFAULT_WORD_LEN);
});

/* GET home page. */
router.get('/:len', async function(req, res, next) {
  var db = res.locals.db;
  var len = parseInt(req.params.len, 10);
  var email = res.locals.user.email;

  if (len < consts.MIN_WORD_LEN || len > consts.MAX_WORD_LEN) {
    return res.redirect(consts.DEFAULT_WORD_LEN);
  }

  // start game if user is not in game
  if (!await db.inGame(email, len)) {
    await db.startGame(email, len);
  }

  var game = (await db.getUser(email)).games[len];
  // end the game if the game is over
  if (await db.gameOver(email, len)) {
    await db.endGame(email, len)
  }

  var error = req.cookies["error"];
  res.clearCookie("error", { httpOnly: true });

  res.render('game', { 
    title: process.env.APP_NAME, 
    game: game, 
    len: len,
    error: error
  });
});

router.post('/guess/:len', async function(req, res, next) {
  var db = res.locals.db;
  var len = parseInt(req.params.len, 10);
  var guess = req.body.guess;
  var email = res.locals.user.email;

  if (len < consts.MIN_WORD_LEN || len > consts.MAX_WORD_LEN) {
    return res.redirect(consts.DEFAULT_WORD_LEN);
  }

  if (await db.validWord(guess, len)) {
    // makeGuess only runs if word is valid inGame and !gameOver
    await db.makeGuess(email, req.body.guess, len);
  }
  res.redirect('/game/' + len);
});

module.exports = router;
