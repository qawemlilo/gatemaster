
/**
 *  Authantication  
**/

var _ = require('lodash');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var BasicStrategy = require('passport-http').BasicStrategy;
var User = require('../models/user');


passport.use(new BasicStrategy(
  function (cell, secret, done) {
    // connect to database and query against id / secret
    User.findOne({
      cell: cell.trim().replace(/ /g, ''),
      secret: secret
    }, function(err, user) {

      if (err) {
        return done(err);
      } 
      if (!user) {
        return done(null, false);
      }

      return done(null, user);
    })
  }
));


passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});



// Sign in using Email and Password.
passport.use(new LocalStrategy({ usernameField: 'cell' }, function(cell, password, done) {
  User.findOne({cell: cell.trim().replace(/ /g, '')}, function(err, user) {
    if (!user) return done(null, false, { message: 'Cell number ' + cell + ' not found'});
    user.comparePassword(password, function(err, isMatch) {
      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Invalid Cell number or password.' });
      }
    });
  });
}));


module.exports.canAccessApi = exports.canAccessApi = passport.authenticate('basic', {session: false});


module.exports.isAuthenticated = exports.isAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
};


module.exports.isAuthorized = exports.isAuthorized = function(req, res, next) {
  var provider = req.path.split('/').slice(-1)[0];

  if (_.find(req.user.tokens, { kind: provider })) {
    next();
  } else {
    res.redirect('/auth/' + provider);
  }
};

