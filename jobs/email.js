
var agenda = require('../lib/agenda')();
var twilio = require('../controllers/twilio');
var User = require('../models/user');
var contactCell = '063 222 0269';

module.exports = function() {
  /*
   *  Runs soon after registration - Welcome SMS
  **/
  agenda.define('error report', function(job, done) {
    console.log('Error report:');
    console.log(job.attrs.data);
  });
};