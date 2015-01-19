

/**
 *  GateMaster App
 *
 *  (c) 2015 - Raging Flame
 *  Email: qawemlilo@gmail.com 
 *
**/

var express = require('express');
var middleware = require('./lib/middleware');
var mongodb = require('./lib/mongodb');
var passport = require('passport');
var cookieParser = require('cookie-parser');
var compress = require('compression');
var session = require('express-session');
var bodyParser = require('body-parser');
var logger = require('morgan');
var errorHandler = require('errorhandler');
var MongoStore = require('connect-mongo')(session);
var flash = require('express-flash');
var path = require('path');
var expressValidator = require('express-validator');
var connectAssets = require('connect-assets');
var routes = require('./routes');
var API = require('./api');
var config = require('./config');
var passportConf = require('./lib/passport');
var cronjobs = require('./jobs');


/**
 * Create Express server.
 */
var app = express();


/**
 * Connect to MongoDB.
**/
mongodb.connect();


app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(compress());
app.use(connectAssets({
  paths: [path.join(__dirname, 'public/css'), path.join(__dirname, 'public/js')]
}));
app.use(express.static(path.join(__dirname, 'public'), {maxAge: 31557600000}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(cookieParser());
app.use(middleware.extendedHttp());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: config.sessionSecret,
  store: new MongoStore({url: config.db, autoReconnect: true}),
  maxAge: null,
  httpOnly: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// define API before CSRF
app.use('/api', passport.authenticate('basic', {session: false}), API);

// CSRF protection
app.use(middleware.csrf());

app.use(function(req, res, next) {
  res.locals.user = req.user;
  next();
});


// Remember original destination before login.
app.use(middleware.lastUrl());


/**
 * Set up routes
**/
routes.setup(app);


/**
 * Set up routes
**/
app.use(errorHandler());


/**
 * Start cronjobs
**/
cronjobs.start();


/**
 * Start server
**/
app.listen(app.get('port'), function() {
  console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});


module.exports = app;