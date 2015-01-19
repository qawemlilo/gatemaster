

var _        = require('lodash');
var async    = require('async');
var crypto   = require('crypto');
var passport = require('passport');
var User     = require('../models/user');
var Complex  = require('../models/complex');
var twilio   = require('./twilio');
var agenda   = require('../lib/agenda')();



exports.removeTenant = function(req, res, next) {
  User.findOne({cell: req.params.cell.trim().replace(/ /g, '')}, function (err, user) {
    if (err) {
      return res.status(500).json({error: true, message: err.message});
    }

    user.landlord = null;
    user.deletedAt = new Date();

    user.save(function (error) {
      if (error) return res.status(500).json({error: true, message: error.message});
      
      res.json({error: false, message: 'Tenant deleted'});
    });
  });
};

exports.addTenant = function(req, res, next) {
  req.assert('cell', 'Cell number should be 10 digits long').len(10);

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/');
  }

  User.findOne({cell: req.body.cell.trim().replace(/ /g, '')}, function (err, user) {
    if (err) {
      req.flash('errors', {msg: err.message});
      return res.redirect('/');
    }
    if (!user) {
      req.flash('errors', {msg: 'Your tenant is not available on our system. Please ask them to register first.'});
      return res.redirect('/');
    }

    user.landlord = req.user.id;

    if (user.deletedAt) {
      user.deletedAt = null;
    }

    user.save(function (error) {
      if (error) req.flash('errors', {msg: error.message});
      
      res.redirect('/');
    });
  });
};


exports.getSignup = function(req, res) {
  if (req.user) return res.redirect('/');

  Complex.find(function (err, complexs) {
    res.render('account/signup', {
      title: 'Signup',
      complexs: complexs
    });
  });
};


/**
 * POST /login
 * Sign in using email and password.
 * @param email
 * @param password
**/
exports.postLogin = function(req, res, next) {
  req.assert('cell', 'Cell number should be 10 digits long').len(10);
  req.assert('password', 'Password cannot be blank').notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/');
  }

  passport.authenticate('local', function(err, user, info) {
    if (err) return next(err);
    if (!user) {
      req.flash('errors', { msg: info.message });
      return res.redirect('/');
    }
    req.logIn(user, function(err) {
      if (err) return next(err);
      res.redirect(req.session.returnTo || '/');
    });
  })(req, res, next);
};


/**
 * GET /logout
 * Log out.
**/
exports.logout = function(req, res) {
  req.logout();
  res.redirect('/');
};


/**
 * POST /signup
 * Create a new local account.
 * @param email
 * @param password
**/
exports.postSignup = function(req, res, next) {
  req.assert('name', 'Name must be at least 2 characters long').len(2);
  req.assert('cell', 'Cell is not valid').len(10);
  req.assert('complex', 'Complex cannot be empty').notEmpty();
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/signup');
  }

  var cell = req.body.cell.trim().replace(/ /g, '');

  var user = new User({
    name: req.body.name,
    complex: req.body.complex,
    cell: cell,
    isLandlord: !!req.body.isLandlord,
    password: req.body.password
  });

  User.findOne({cell: cell}, function(err, existingUser) {
    if (existingUser) {
      req.flash('errors', { msg: 'Account with that cell number already exists.' });
      return res.redirect('/signup');
    }
    user.save(function(err) {
      if (err) return next(err);

      agenda.now('welcome sms', {cellNumber: cell});
      agenda.schedule('in 5 minutes', 'payment check', {cellNumber: cell});
      agenda.schedule('in 1 minutes', 'registration sms', {cellNumber: cell});

      req.logIn(user, function(err) {
        if (err) return next(err);
        res.redirect('/');
      });
    });
  });
};


/**
 * GET /account
 * Profile page.
**/
exports.getUsers = function(req, res) {
  User.find(function (error, users) {
    if (error) {
      return res.status(500).json(users);
    }

    res.json(users);
  });
};


/**
 * GET /account
 * Profile page.
**/
exports.getAccount = function(req, res) {
  res.render('account/profile', {
    title: 'Account Management'
  });
};


/**
 * POST /account/profile
 * Update profile information.
**/
exports.postUpdateProfile = function(req, res, next) {
  User.findById(req.user.id, function(err, user) {
    if (err) return next(err);
    user.cell = req.body.cell || user.cell;
    user.profile.name = req.body.name || user.profile.name;

    user.save(function(err) {
      if (err) return next(err);
      req.flash('success', { msg: 'Profile information updated.' });
      res.redirect('/account');
    });
  });
};


/**
 * POST /account/password
 * Update current password.
 * @param password
**/
exports.postUpdatePassword = function(req, res, next) {
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/account');
  }

  User.findById(req.user.id, function(err, user) {
    if (err) return next(err);

    user.password = req.body.password;

    user.save(function(err) {
      if (err) return next(err);
      req.flash('success', { msg: 'Password has been changed.' });
      res.redirect('/account');
    });
  });
};


/**
 * POST /account/delete
 * Delete user account.
**/
exports.postDeleteAccount = function(req, res, next) {
  req.user = new Date();

  req.user.save(function (error) {
    if (error) {
      req.flash('error', { msg: error.message }); 
    }
    else {
      req.logout();
      req.flash('info', { msg: 'Your account has been deleted.' });
    }

    res.redirect('/');
  });
};


/**
 * GET /reset/:token
 * Reset Password page.
**/
exports.getReset = function(req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  User
    .findOne({resetPasswordToken: req.params.token})
    .where('resetPasswordExpires').gt(Date.now())
    .exec(function(err, user) {
      if (!user) {
        req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
        return res.redirect('/forgot');
      }
      res.render('account/reset', {
        title: 'Password Reset'
      });
    });
};


/**
 * POST /reset/:token
 * Process the reset password request.
 * @param token
**/
exports.postReset = function(req, res, next) {
  req.assert('password', 'Password must be at least 4 characters long.').len(4);
  req.assert('confirm', 'Passwords must match.').equals(req.body.password);

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('back');
  }

  async.waterfall([
    function(done) {
      User
        .findOne({resetPasswordToken: req.params.token})
        .where('resetPasswordExpires').gt(Date.now())
        .exec(function(err, user) {
          if (!user) {
            req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
            return res.redirect('back');
          }

          user.password = req.body.password;
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;

          user.save(function(err) {
            if (err) return next(err);
            req.logIn(user, function(err) {
              done(err, user);
            });
          });
        });
    },
    function(user, done) {
      req.flash('success', { msg: 'Success! Your password has been changed.' });
      done();
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/');
  });
};


/**
 * GET /forgot
 * Forgot Password page.
**/
exports.getForgot = function(req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.render('account/forgot', {
    title: 'Forgot Password'
  });
};


/**
 * POST /forgot
 * Create a random token, then the send user an email with a reset link.
 * @param email
**/
exports.postForgot = function(req, res, next) {
  req.assert('cell', 'Please enter a valid cell number.').len(10);

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/forgot');
  }

  async.waterfall([
    function(done) {
      crypto.randomBytes(16, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email.toLowerCase() }, function(err, user) {
        if (!user) {
          req.flash('errors', { msg: 'No account with that email address exists.' });
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var text = 'Reset url: ' + 'http://' + req.headers.host + '/reset/' + token;

      twilio.sendSMS(user.number, text, function(err, responseData) {
        req.flash('info', { msg: 'An sms has been sent to ' + user.number + ' with further instructions.' });
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
};
