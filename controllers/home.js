/**
 * GET /
 * Home page.
 */

var User = require('../models/user');

exports.index = function(req, res) {
  var view = 'account/login';
  var title = 'Login';

  if (req.user) {
    view = 'home';
    title = 'Home';
  }

  if (req.user && req.user.isLandlord) {
    User.find({landlord: req.user.id, deletedAt: null}, function (err, tenants) {
      if (err) {
      	return res.status(500).json({error: true, message: err.message});
      }

      res.render('landlord', {
        title: title,
        tenants: tenants
      });
    });
  }
  else {
    res.render(view, {
      title: title
    });
  }
};
