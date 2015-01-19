

var User = require('../models/user');
var twilio = require('../controllers/twilio');
var _ = require('lodash');


module.exports.fetch = function(req, res) {
  
  User.find(req.query,  function (error, users) {

    if (error) {
      return res.status(500).json({error: true, message: error.message});
    }

    res.json(users);
  });
};



module.exports.add = function(req, res) {
  req.assert('name', 'Name must be at least 2 characters long').len(2);
  req.assert('cell', 'Cell is not valid').len(10);
  req.assert('complex', 'Complex cannot be empty').notEmpty();
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

  var errors = req.validationErrors();

  if (errors) {
    return res.status(500).json({error: true, errors: errors});
  }

  var user = new User(req.body);

  User.findOne({cell: req.body.cell.trim().replace(/ /g, '')}, function(err, existingUser) {
    if (existingUser) {
      return res.status(500).json({error: true, message: 'Account with that cell number already exists.'});
    }
    user.save(function(err) {
      if (err) {
        return res.status(500).json({error: true, message: err.message});
      }

      var text = 'Welcome to the GateMaster App. This trial will work for only 24hrs. Please call 063 222 0269 to unlock.';

      twilio.sendSMS(user.cell, text, function(err, responseData) {
        if (err) console.log(err.message);
      });

      res.json({error: false, message: 'User created!', user: user});
    });
  });
};



module.exports.get = function(req, res) {
  User.findOne({_id: req.params.id}, function (error, user) {

    if (error) {
      return res.status(500).json({error: true, message: error.message});
    }

    res.json(user);
  });
};



module.exports.update = function(req, res, next) {
  User.findOne({_id: req.params.id}, function(err, user) {
    if (!user) {
      return res.status(500).json({error: false, message: 'User does not exists.'});
    }

    _.extend(user, req.body);


    user.save(function(err) {
      if (err) return res.status(500).json({error: true, message: err.message});

      res.json({error: false, message: 'User updated!'});
    });
  });
};




module.exports.del = function(req, res, next) {
  User.remove({_id: req.params.id}, function(err) {
    if (err) {
      return res.status(500).json({error: true, message: err.message});
    }

    res.json({error: false, message: 'User deleted!'});
  });
};

