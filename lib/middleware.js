

var _ = require('lodash');
var path = require('path');
var passport = require('passport');
var csrf = require('lusca').csrf();


/**
 * Express configuration.
**/
var csrfExclude = ['/complexs', '/sms', '/call', '/inbound'];


module.exports.csrf = function () {
  return function(req, res, next) {
    // CSRF protection.
    if (_.contains(csrfExclude, req.path)) return next();
    csrf(req, res, function (error) {
      if (error) {
        req.flash('errors', {msg: 'Your security token has expired. Try again.'});
        return res.redirect('/'); 
      }
      else {
        next();
      }
    });
  };
};


module.exports.extendedHttp = function () {
  return function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
  
    next();
  };
};


module.exports.lastUrl = function () {
  return function(req, res, next) {
    // Remember original destination before login.
    var path = req.path.split('/')[1];
    if (/auth|login|logout|signup|fonts|favicon/i.test(path)) {
      return next();
    }
    req.session.returnTo = req.path;
    next();
  };
};