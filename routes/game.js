var express = require('express');
var router = express.Router();
const { requiresAuth } = require('express-openid-connect');

// Middleware to make sure player is playing
router.use(requiresAuth(), async function (req, res, next) {
  db = res.locals.db;

  // start game if user is not in game
  if (!await db.inGame(res.locals.user.email)) {
    await db.startGame(res.locals.user.email);
  }

  next();
});

/* GET home page. */
router.get('/', async function(req, res, next) {
  await db.updateUser(res);

  game = (await db.getUser(res.locals.user.email)).game;
  gameOver = await db.gameOver(res.locals.user.email);

  res.render('game', { title: process.env.APP_NAME, game: game });
});

router.post('/guess', async function(req, res, next) {
  db = res.locals.db;

  guess = Object.values(req.body).join('').toLowerCase();
  await db.makeGuess(res.locals.user.email, guess);

  res.redirect('/game');
});

module.exports = router;
