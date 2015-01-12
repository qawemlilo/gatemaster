

var mongoose = require('mongoose');
var slugify = require('slug');


var complexSchema = new mongoose.Schema({
  
  name: {
    type: String
  },
  
  suburb: {
    type: String
  },

  slug: {
    type: String
  },

  createdAt: {
    type: Date
  },


  sendTo: {
    type: String
  },

  numbers: {
    type: Array
  },

  modifiedAt: {
    type: Date,
    default: Date.now
  }
});

complexSchema.pre('save', function(next) {
  var complex = this;

  if (!complex.isModified('name')) return next();

  complex.slug = slugify(complex.name).toLowerCase();
  next();
});



module.exports = mongoose.model('Complex', complexSchema);
