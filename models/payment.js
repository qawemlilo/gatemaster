

var mongoose = require('mongoose');
var User = require('./user');


var paymentSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  amount: {
    type: Number,
    required: true
  },

  type: {
    type: String,
    required: true
  },

  createdAt: {
    type: Date
  },

  modifiedAt: {
    type: Date,
    default: Date.now
  }
});



module.exports = mongoose.model('Payment', paymentSchema);
