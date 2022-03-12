var express = require('express');
var router = express.Router();
var consts = require('../model/constants');

/* GET home page. */
router.get('/', async function(req, res, next) {
  res.redirect("/leaderboard/" + consts.DEFAULT_GAME_TYPE + "/" + consts.DEFAULT_WORD_LEN);
});

/* GET home page. */
router.get('/:type/:len', async function(req, res, next) {
  var db = res.locals.db;
  var type = req.params.type;
  var len = parseInt(req.params.len, 10);
  var user = res.locals.user

  if (!consts.GAME_TYPES.includes(type) || isNaN(len) || len < consts.MIN_WORD_LEN || len > consts.MAX_WORD_LEN) {
    return res.redirect("/leaderboard");
  }

  var constants = {
    MIN_WORD_LEN: consts.MIN_WORD_LEN,
    MAX_WORD_LEN: consts.MAX_WORD_LEN,
    DEFAULT_WORD_LEN: consts.DEFAULT_WORD_LEN,
    DEFAULT_GAME_TYPE: consts.DEFAULT_GAME_TYPE,
    GAME_TYPES: consts.GAME_TYPES,
    LEADERBOARD_REQUIRED_GAMES_PLAYED: consts.LEADERBOARD_REQUIRED_GAMES_PLAYED
  }

  var loggedIn = (user !== undefined && user.email_verified);

  var data = await db.getLeaderboard(type, len);
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

  var error = req.cookies["error"];
  res.clearCookie("error", { httpOnly: true });

  res.render('leaderboard', { 
    leaderboard: leaderboard,
    type: type,
    len: len,
    consts: constants,
    error_message: error
  });
});

module.exports = router;
