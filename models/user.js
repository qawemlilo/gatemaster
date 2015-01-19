

var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var Complex = require('./complex');

var userSchema = new mongoose.Schema({

  name: {
    type: String
  },

  cell: {
    type: String, 
    unique: true,
    index: true
  },

  password: {
    type: String
  },

  secret: {
    type: String
  },

  role: {
    type: String,
    lowercase: true
  },

  landlord: {
    type: mongoose.Schema.Types.ObjectId
  },

  isLandlord: {
    type: Boolean, 
    default: false
  },

  paid: {
    type: Boolean, 
    default: false
  },

  complex: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complex',
    required: true
  },

  unitNumber: {
    type: Number
  },

  resetPasswordToken: {
    type: String
  },

  resetPasswordExpires: {
    type: Date
  },

  createdAt: {
    type: Date
  },

  modifiedAt: {
    type: Date,
    default: Date.now
  },

  deletedAt: {
    type: Date
  },

  expireyDate: {
    type: Date
  }
});

/**
 * Hash the password for security.
 * "Pre" is a Mongoose middleware that executes before each user.save() call.
 */

userSchema.pre('save', function(next) {
  var user = this;

  if (user.isModified('cell')) {
    user.cell = user.cell.trim().replace(/ /g, '');
  }

  if (!user.isModified('password')) return next();

  bcrypt.genSalt(5, function(err, salt) {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

/**
 * Validate user's password.
 * Used by Passport-Local Strategy for password validation.
 */

userSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

userSchema.methods.getComplex = function (callback) {
  return this.db.model('Complex').findById(this.complex, callback);
}



module.exports = mongoose.model('User', userSchema);
