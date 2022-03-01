var express = require('express');
var router = express.Router();
const { requiresAuth } = require('express-openid-connect');
var consts = require('../model/constants');

router.use(requiresAuth(), async function (req, res, next) {
  if (!res.locals.user.email_verified) {
    req.error = "Email not verified";
    return res.redirect(process.env.APP_URL);
  }

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

router.get('/:len', async function (req, res, next) {
  db = res.locals.db;
  len = req.params.len;
  email = res.locals.user.email;

  let error = req.cookies["error"];
  res.clearCookie("error", { httpOnly: true });

  res.render('profile', {
    title: "Profile " + len + " Letters" ,
    len: len,
    userScores: (await db.getUser(email)).scores[len],
    error: error
  });
});

module.exports = router;
