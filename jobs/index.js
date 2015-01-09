

/**
 *  Cronjobs
**/

var agenda = require('../lib/agenda')();
var emailJobs = require('./email');
var smsJobs = require('./sms');



module.exports.start = function () {

  function graceful() {
    agenda.stop(function() {
      process.exit(0);
    });
  }

  emailJobs();
  smsJobs();

  agenda.start();

  agenda.on('start', function(job) {
    console.log("Job %s starting", job.attrs.name);
  });

  agenda.on('complete', function(job) {
    console.log("Job %s finished", job.attrs.name);
  });

  process.on('SIGTERM', graceful);
  process.on('SIGINT' , graceful);

  return agenda;
};