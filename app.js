var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config();

var indexRouter = require('./routes/index');
var profileRouter = require('./routes/profile');
var gameRouter = require('./routes/game');
var leaderboardRouter = require('./routes/leaderboard');

var db = require('./model/db');

var app = express();

const { auth } = require('express-openid-connect');

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH_SECRET,
  baseURL: process.env.APP_URL,
  clientID: process.env.AUTH_CLIENT_ID,
  issuerBaseURL: process.env.AUTH_ISSUER_BASE_URL
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/css', express.static(__dirname + '/node_modules/@fortawesome/fontawesome-free/css'));
app.use('/webfonts', express.static(__dirname + '/node_modules/@fortawesome/fontawesome-free/webfonts'));

app.use(async function (req, res, next) {
  res.locals.user = req.oidc.user;
  res.locals.db = db;
  next();
});

app.use('/', indexRouter);
app.use('/profile', profileRouter);
app.use('/game', gameRouter);
app.use('/leaderboard', leaderboardRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
