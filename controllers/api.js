

var secrets = require('../config/secrets');
var twilio = require('twilio')(secrets.twilio.sid, secrets.twilio.token);



exports.postTwilio = function(req, res, next) {
  req.assert('number', 'Phone number is required.').notEmpty();
  req.assert('message', 'Message cannot be blank.').notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/api/twilio');
  }

  var message = {
    to: req.body.number,
    from: '+13472235148',
    body: req.body.message
  };

  twilio.sendMessage(message, function(err, responseData) {
    if (err) return next(err.message);
    req.flash('success', { msg: 'Text sent.'});
    res.redirect('/api/twilio');
  });
};
