

var mongoose = require('mongoose');
var slugify = require('slug');


var complexSchema = new mongoose.Schema({
  
  name: {
    type: String
  },
  
  slug: {
    type: String
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

complexSchema.pre('save', function(next) {
  var complex = this;

  if (!complex.isModified('name')) return next();

  complex.slug = slugify(complex.name);
  next();
});



module.exports = mongoose.model('Complex', complexSchema);
