var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
  let error = req.cookies["error"];
  res.clearCookie("error", { httpOnly: true });

  res.render('index', { 
    title: 'Wordle',
    error: error
  });
});

module.exports = router;
