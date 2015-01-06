

var mongoose = require('mongoose');
var User = require('./user');


var paymentSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  amount: {
    type: Number
  },

  type: {
    type: String
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  modifiedAt: {
    type: Date,
    default: Date.now
  }
});



module.exports = mongoose.model('Payment', paymentSchema);
