

var twilio = require('../controllers/twilio');
var Payment = require('../models/payment');
var _ = require('lodash');


exports.fetch = function(req, res) {
  Payment.find(function (error, payments) {

    if (error) {
      return res.status(500).json({error: true, message: error.message});
    }

    res.json(payments);
  });
};



exports.add = function(req, res) {
  req.assert('user', 'user cannot be empty').notEmpty();
  req.assert('createdBy', 'createdBy cannot be empty').notEmpty();
  req.assert('amount', 'amount cannot be empty').notEmpty();
  req.assert('type', 'type cannot be empty').notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    return res.status(500).json({error: true, errors: errors});
  }

  var payment = new Payment({
    user: req.body.user,
    createdBy: req.body.createdBy,
    amount: req.body.amount,
    type: req.body.type
  });

  payment.save(function(err) {
    if (err) {
      return res.status(500).json({error: true, message: err.message});
    }

    var text = 'Your payment has been recieved, please call 063 222 0269 for any queries - GateMaster App.';

    twilio.sendSMS(payment.number, text, function(err, responseData) {
      if (err) console.log(err.message);
    });

    res.json({error: false, message: 'Payment created!', payment: payment});
  });
};


exports.get = function(req, res) {
  Payment.find({_id: req.params.id}, function (error, payment) {

    if (error) {
      return res.status(500).json({error: true, message: error.message});
    }

    res.json(payment);
  });
};



exports.update = function(req, res, next) {
  Payment.findOne({_id: req.params.id}, function(err, payment) {
    if (!payment) {
      return res.status(500).json({error: false, message: 'Payment does not exists.'});
    }

    payment.user = req.body.user;
    payment.updatedBy = req.body.createdBy;
    payment.amount = req.body.amount;
    payment.type = req.body.type;

    payment.save(function(err) {
      if (err) return res.status(500).json({error: true, message: err.message});

      res.json({error: false, message: 'Payment updated!'});
    });
  });
};




exports.del = function(req, res, next) {
  Payment.remove({_id: req.params.id}, function(err) {
    if (err) {
      return res.status(500).json({error: true, message: err.message});
    }

    res.json({error: false, message: 'Payment deleted!'});
  });
};

