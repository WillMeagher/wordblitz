var express = require('express');
var router = express.Router();
const { requiresAuth } = require('express-openid-connect');
var consts = require('../model/constants');

router.use(requiresAuth(), async function (req, res, next) {
  if (!res.locals.user.email_verified) {
    req.error = "Email not verified";
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
  res.redirect("/profile/" + consts.DEFAULT_GAME_TYPE + "/" + consts.DEFAULT_WORD_LEN);
});

router.get('/:type/:len', async function (req, res, next) {
  var db = res.locals.db;
  var type = req.params.type;
  var len = parseInt(req.params.len, 10);
  var email = res.locals.user.email;

  if (!consts.GAME_TYPES.includes(type) || isNaN(len) || len < consts.MIN_WORD_LEN || len > consts.MAX_WORD_LEN) {
    return res.redirect("/profile");
  }

  var error = req.cookies["error"];
  res.clearCookie("error", { httpOnly: true });

  
  var constants = {
    MIN_WORD_LEN: consts.MIN_WORD_LEN,
    MAX_WORD_LEN: consts.MAX_WORD_LEN,
    DEFAULT_WORD_LEN: consts.DEFAULT_WORD_LEN,
    DEFAULT_GAME_TYPE: consts.DEFAULT_GAME_TYPE,
    GAME_TYPES: consts.GAME_TYPES,
  }

  res.render('profile', {
    type: type,
    len: len,
    consts: constants,
    userScores: (await db.getUser(email)).scores[type]?.[len],
    error_message: error
  });
});

module.exports = router;
