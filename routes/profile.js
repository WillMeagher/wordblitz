var express = require('express');
var router = express.Router();
const { requiresAuth } = require('express-openid-connect');

router.use(requiresAuth(), async function (req, res, next) {
  db = res.locals.db;
  next();
});

router.get('/', requiresAuth(), async function (req, res, next) {
  await db.updateUser(res);

  res.render('profile', {
    title: 'Profile page'
  });
});


module.exports = router;
