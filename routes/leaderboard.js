var express = require('express');
var router = express.Router();
var consts = require('../model/constants');

/* GET home page. */
router.get('/', async function(req, res, next) {
  res.redirect(req.originalUrl + "/" + consts.DEFAULT_WORD_LEN);
});

/* GET home page. */
router.get('/:len', async function(req, res, next) {
  db = res.locals.db;
  len = req.params.len;

  if (res.locals.user === 'undefined') {
    loggedIn = false;
  } else {
    loggedIn = true;
  }

  data = await db.getLeaderboard(len);
  data_array = await data.toArray()

  if (loggedIn) {
    var leaderboard = data_array.slice(0, 5);
    var cur_rank = 1;
    var email = res.locals.user.email
    var found = false;

    leaderboard = leaderboard.map(user => {
      if (user.email == email) {
        found = true;
        user.cur_user = true;
      }
      user.rank = cur_rank;
      cur_rank ++;
      return user;
    });

    if (!found) {
      var cur_rank = 1;
      data_array.each(user => {
        if (user.email == email) {
          user.rank = cur_rank;
          user.cur_user = true;
          leaderboard.push(user);
        }
        cur_rank ++;
      })
    }

  } else {
    var leaderboard = data_array.slice(0, 5);
    var cur_rank = 1;

    leaderboard = leaderboard.map(user => {
      user.rank = cur_rank;
      cur_rank ++;
      return user;
    });
  }

  res.render('leaderboard', { 
    title: len + " Letter Leaderboard",
    leaderboard: leaderboard,
    len: len,
  });
});

module.exports = router;
