var express = require('express');
var router = express.Router();
const { requiresAuth } = require('express-openid-connect');

router.use(requiresAuth(), async function (req, res, next) {
  db = res.locals.db;
  email = res.locals.user.email;

  if (!(await db.userExists(email))) {
    await db.createUser(email);
  }

  next();
});

router.get('/', async function (req, res, next) {
  db = res.locals.db;
  
  await db.updateUser(res);

  res.render('profile', {
    title: 'Profile Page',
  });
});


module.exports = router;
