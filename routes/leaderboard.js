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
  len = parseInt(req.params.len, 10);
  user = res.locals.user

  if (len < consts.MIN_WORD_LEN || len > consts.MAX_WORD_LEN) {
    return res.redirect(consts.DEFAULT_WORD_LEN);
  }

  if (user === undefined || !user.email_verified) {
    loggedIn = false;
  } else {
    loggedIn = true;
  }

  var data = await db.getLeaderboard(len);
  var data_array = await data.toArray()

  if (loggedIn) {
    var leaderboard = data_array.slice(0, 5);
    var cur_rank = 1;
    var found = false;

    leaderboard = leaderboard.map(leaderboard_user => {
      if (leaderboard_user.email == user.email) {
        found = true;
        leaderboard_user.cur_user = true;
      }
      leaderboard_user.rank = cur_rank;
      cur_rank ++;
      return leaderboard_user;
    });

    if (!found) {
      var cur_rank = 1;
      for (let i = 0; i < data_array.length; i++) {
        var leaderboard_user = data_array[i];
        if (leaderboard_user.email == user.email) {
          leaderboard_user.rank = cur_rank;
          leaderboard_user.cur_user = true;
          leaderboard.push(leaderboard_user);
          break;
        }
        cur_rank ++;
      }
    }

  } else {
    var leaderboard = data_array.slice(0, 5);
    var cur_rank = 1;

    leaderboard = leaderboard.map(leaderboard_user => {
      leaderboard_user.rank = cur_rank;
      cur_rank ++;
      return leaderboard_user;
    });
  }

  error = req.cookies["error"];
  res.clearCookie("error", { httpOnly: true });

  res.render('leaderboard', { 
    title: len + " Letter Leaderboard",
    leaderboard: leaderboard,
    len: len,
    error: error
  });
});

module.exports = router;
