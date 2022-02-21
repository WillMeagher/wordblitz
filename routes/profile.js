var express = require('express');
var router = express.Router();
const { requiresAuth } = require('express-openid-connect');

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

router.get('/', async function (req, res, next) {
  db = res.locals.db;
  email = res.locals.user.email;

  let error = req.cookies["error"];
  res.clearCookie("error", { httpOnly: true });

  res.render('profile', {
    title: 'Profile Page',
    userScores: (await db.getUser(email)).scores,
    error: error
  });
});

module.exports = router;
