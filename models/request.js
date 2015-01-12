

var mongoose = require('mongoose');
var User = require('./user');


var requestSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  data: {
    type: Mixed
  },

  createdAt: {
    type: Date
  }
});



module.exports = mongoose.model('Request', requestSchema);
