
/**
 *  MongoDB connection  
**/

var mongoose = require('mongoose');
var config = require('../config');

module.exports.connect = function () {

  mongoose.connect(config.db);
  mongoose.connection.on('error', function() {
    console.error('MongoDB Connection Error. Please make sure that MongoDB is running.');
  });

};