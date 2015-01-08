

var agenda = require('../lib/agenda')();
var emailJobs = require('./email');
var smsJobs = require('./sms');



module.exports.start = function () {
  
  emailJobs();
  smsJobs();

  agenda.start();

  agenda.on('start', function(job) {
    console.log("Job %s starting", job.attrs.name);
  });

  agenda.on('complete', function(job) {
    console.log("Job %s finished", job.attrs.name);
  });
};