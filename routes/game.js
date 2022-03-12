var express = require('express');
var router = express.Router();
const { requiresAuth } = require('express-openid-connect');
var consts = require('../model/constants');
const { check, validationResult } = require('express-validator');
const db = require('../model/db');

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
  var error = req.cookies["error"];
  res.clearCookie("error", { httpOnly: true });

  var constants = {
    MIN_WORD_LEN: consts.MIN_WORD_LEN,
    MAX_WORD_LEN: consts.MAX_WORD_LEN,
    DEFAULT_WORD_LEN: consts.DEFAULT_WORD_LEN,
    DEFAULT_GAME_TYPE: consts.DEFAULT_GAME_TYPE,
    GAME_TYPES: consts.GAME_TYPES,
    DESCRIPTIONS: consts.DESCRIPTIONS,
}

  res.render('gameIndex', {
    consts: constants,
    error_message: error
  });
});

/* GET home page. */
router.get('/update', async function(req, res, next) {
  await db.updateData();

  var error = req.cookies["error"];
  res.clearCookie("error", { httpOnly: true });

  res.render('index', { 
    title: process.env.APP_NAME,
    error_message: error
  });
});

router.get('/:type/:len', async function(req, res, next) {
  var db = res.locals.db;
  var type = req.params.type;
  var len = parseInt(req.params.len, 10);
  var email = res.locals.user.email;

  if (!consts.GAME_TYPES.includes(type) || isNaN(len) || len < consts.MIN_WORD_LEN || len > consts.MAX_WORD_LEN) {
    return res.redirect("/game");
  }

  // start game if user is not in game
  if (!await db.inGame(email, type, len)) {
    await db.startGame(email, type, len);
  }

  var game = (await db.getUser(email)).games[type][len];
  // end the game if the game is over
  var gameOver = await db.gameOver(email, type, len)
  if (gameOver) {
    await db.endGame(email, type, len)
  }

  var time_left = db.timeLeft(game);

  var error = req.cookies["error"];
  res.clearCookie("error", { httpOnly: true });

  res.render('game', { 
    game: game, 
    gameOver: gameOver,
    time_left: time_left,
    type: type,
    len: len,
    error_message: error
  });
});

router.post('/guess/:type/:len', async function(req, res, next) {
  check('guess').isLength({min: consts.MIN_WORD_LEN, max: consts.MAX_WORD_LEN}),
  check('guess').matches(/^[A-Za-z ]+$/)
  
  var db = res.locals.db;
  var type = req.params.type;
  var len = parseInt(req.params.len, 10);
  var guess = req.body.guess;
  var email = res.locals.user.email;

  if (!consts.GAME_TYPES.includes(type) || isNaN(len) || len < consts.MIN_WORD_LEN || len > consts.MAX_WORD_LEN) {
    return res.redirect("/game");
  }

  if (await db.validWord(guess, len)) {
    // makeGuess only runs if word is valid inGame and !gameOver
    await db.makeGuess(email, req.body.guess, type, len);
  }
  res.redirect("/game/" + type + "/" + len);
});

module.exports = router;
