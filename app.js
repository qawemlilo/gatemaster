/**
 * Module dependencies.
 */

var express = require('express');
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
var mongoose = require('mongoose');
var passport = require('passport');
var expressValidator = require('express-validator');
var connectAssets = require('connect-assets');
var _ = require('lodash');
var twilio = require('./controllers/twilio');
var API = require('./api');
var BasicStrategy = require('passport-http').BasicStrategy;
var User = require('./models/user');


/**
 * Controllers (route handlers).
 */
var homeController = require('./controllers/home');
var userController = require('./controllers/user');
var complexController = require('./controllers/complex');
//var apiController = require('./controllers/api');
//var contactController = require('./controllers/contact');

/**
 * API keys and Passport configuration.
**/

var secrets = require('./config/secrets');
var passportConf = require('./config/passport');

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


passport.use(new BasicStrategy(
  function (cell, secret, done) {
    // connect to database and query against id / secret
    User.find({
      cell: cell.trim().replace(/ /g, ''), 
      secret: secret 
    }, function(err, user) {
      if (err) {
        return done(err);
      } else if (!user) {
        return done(null, false);
      }
      return done(null, user);
    })
  }
));

/**
 * Express configuration.
**/
var csrfExclude = [
  '/complexs', 
  '/sms', 
  '/call', 
  '/inbound', 
  '/api/users', 
  '/api/users/:id'
];

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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
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
  store: new MongoStore({ url: secrets.db, autoReconnect: true })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(function(req, res, next) {
  // CSRF protection.
  if (_.contains(csrfExclude, req.path)) return next();
  csrf(req, res, next);
});
app.use(function(req, res, next) {
  // Make user object available in templates.
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
 * Main routes.
**/
app.get('/', homeController.index);
app.get('/users', userController.getUsers);
app.get('/signup', userController.getSignup);
app.post('/signup', userController.postSignup);
app.post('/login', userController.postLogin);
app.get('/logout', userController.logout);
app.get('/forgot', userController.getForgot);


app.post('/sms', function (req, res, next) {
  var cell = req.body.cell;
  var message = req.body.message;

  twilio.sendSMS(cell, message, function (err, response) {
    if (err) {
      return res.status(500).json({error: true, message: err.message});
    }

    res.json({error: false, message: 'Message sent!'});
  });
});

app.post('/call', function(req, res) {
  var number = req.body.number;

  twilio.makeCall(number, function (error) {
    if (error) {
      res.status(500).json({error: true, message: error.message});
    }
    res.json({error: false, message: 'Call made'});
  });
});

app.post('/inbound', function(req, res) {
  var twilio = require('twilio');
  var twiml = new twilio.TwimlResponse();

  var options = {
    voice: 'woman',
    language: 'en-gb'
  };

  twiml.say('Hello Cathrine! You have won one million dollars for being awesome. lol, Zim dollars. Do not be mad at me, I was sent by Q, your friend', options);


  res.writeHead(200, {
    'Content-Type': 'text/xml'
  });
  res.end(twiml.toString());
});



/**
 *  Application API
**/
//app.use('/api', passport.authenticate('basic', { session: false }), API);

/**
 * 500 Error Handler.
**/
app.use(errorHandler());


app.listen(app.get('port'), function() {
  console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});

module.exports = app;