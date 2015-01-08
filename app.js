

/**
 * Module dependencies.
**/
var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');
var _ = require('lodash');
var cookieParser = require('cookie-parser');
var compress = require('compression');
var session = require('express-session');
var bodyParser = require('body-parser');
var logger = require('morgan');
var errorHandler = require('errorhandler');
var csrf = require('lusca').csrf();
var MongoStore = require('connect-mongo')(session);
var flash = require('express-flash');
var path = require('path');
var expressValidator = require('express-validator');
var connectAssets = require('connect-assets');
var routes = require('./routes');
var API = require('./api');
var secrets = require('./config/secrets');
var passportConf = require('./lib/passport');
var cronjobs = require('./jobs');

/**
 * Create Express server.
 */
var app = express();

/**
 * Connect to MongoDB.
**/
mongoose.connect(secrets.db);
mongoose.connection.on('error', function() {
  console.error('MongoDB Connection Error. Please make sure that MongoDB is running.');
});


/**
 * Express configuration.
**/
var csrfExclude = ['/complexs', '/sms', '/call', '/inbound'];

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(compress());
app.use(connectAssets({
  paths: [path.join(__dirname, 'public/css'), path.join(__dirname, 'public/js')]
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(cookieParser());
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  next();
});
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: secrets.sessionSecret,
  store: new MongoStore({ url: secrets.db, autoReconnect: true }),
  maxAge: null,
  httpOnly: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use('/api', passportConf.canAccessApi, API);

app.use(function(req, res, next) {
  // CSRF protectionapp.use('/api', passportConf.canAccessApi, API);.
  if (_.contains(csrfExclude, req.path)) return next();
  csrf(req, res, next);
});
app.use(function(req, res, next) {
  res.locals.user = req.user;
  next();
});
app.use(function(req, res, next) {
  // Remember original destination before login.
  var path = req.path.split('/')[1];
  if (/auth|login|logout|signup|fonts|favicon/i.test(path)) {
    return next();
  }
  req.session.returnTo = req.path;
  next();
});
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));


/**
 * Routes setup  
**/
routes.setup(app);


/**
 * 500 Error Handler.
**/
app.use(errorHandler());


/**
 * Start cronjobs
**/
cronjobs.start();


app.listen(app.get('port'), function() {
  console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});


module.exports = app;