var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
  var error = req.cookies["error"];
  res.clearCookie("error", { httpOnly: true });

  res.render('index', { 
    title: process.env.APP_NAME,
    error: error
  });
});

module.exports = router;
