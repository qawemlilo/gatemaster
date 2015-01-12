

/**
 *  Appliction smses 
**/


var agenda = require('../lib/agenda')();
var twilio = require('../controllers/twilio');
var User = require('../models/user');
var contactCell = '063 222 0269';
var oneYear = 365 * 24 * 60 * 60 * 1000;


module.exports = function() {

  /*
   *  Runs soon after registration - Welcome SMS
  **/
  agenda.define('welcome sms', function(job, done) {
    var text = 'Thank you for trying the GateMaster App, please call ' + contactCell + ' for any queries.';
    process.nextTick(function () {
      twilio.sendSMS(job.attrs.data.cellNumber, text, function(err, res) {
        if (err) {
          agenda.now('error report', {
            cellNumber: job.attrs.data.cellNumber,
            errorMsg: err.message,
            jobName: 'welcome sms'
          });
        }
      });
    });
  });

  /*
   *  Runs 1 minute after registration - SMS invoice 1 minute 
  **/
  agenda.define('payment invoice', function(job, done) {
    var text = 'The GateMaster App is running on a trial version that will expire in 24hrs. Buy a 1 year license for R100 - contact ' + contactCell;
    
    process.nextTick(function () {
      twilio.sendSMS(job.attrs.data.cellNumber, text, function(err, res) {
        if (err) {
          agenda.now('error report', {
            cellNumber: job.attrs.data.cellNumber,
            errorMsg: err.message,
            jobName: 'payment invoice'
          });
        }
      });
    });
  });


  /*
   *  Runs soon after payment - SMS receipt
  **/
  agenda.define('payment receipt', function(job, done) {
    var text = 'Your payment has been confirmation. For any queries contact ' + contactCell;
    var cell = job.attrs.data.cellNumber;
    var paymentId = job.attrs.data.paymentId;
    
    // fetch user
    process.nextTick(function () {
      User.findOne({cell: cell}, function (error, user) {
        if (error) {
          return agenda.now('error report', {
            cellNumber: cell,
            paymentId: paymentId,
            errorMsg: error.message,
            jobName: 'payment receipt'
          });
        }

        // extend account expirey date
        user.expireyDate = user.paid ? user.expireyDate + oneYear : Date.now() + oneYear;
        user.paid = true;
        
        // if the user has not paid
        user.save(function (error) {
          if (error) {
            return agenda.now('error report', {
              cellNumber: cell,
              paymentId: paymentId,
              errorMsg: error.message,
              jobName: 'payment receipt'
            });
          }

          twilio.sendSMS(cell, text, function(err, res) {
            if (err) {
              agenda.now('error report', {
                cellNumber: cell,
                paymentId: paymentId,
                errorMsg: err.message,
                jobName: 'payment receipt'
              });
            }
          });
        });
      });
    });
  });


  /*
   *  Runs 24 hours after registration - Check if user has paid
  **/
  agenda.define('payment check', function(job, done) {
    var text = 'Your trial period has expired, the GateMaster App will no longer work. Buy a 1 year license for R100 - contact ' + contactCell;
    var cell = job.attrs.data.cellNumber;
    
    // fetch user
    process.nextTick(function () {
      User.findOne({cell: cell}, function (error, user) {
        if (error) {
          return agenda.now('error report', {
            cellNumber: cell,
            errorMsg: error.message,
            jobName: 'payment check'
          });
        }

        if (!user) {
          return agenda.now('error report', {
            cellNumber: cell,
            errorMsg: 'User not found',
            jobName: 'payment check'
          });
        }

        
        // if the user has not paid
        if (!user.paid) {
          twilio.sendSMS(cell, text, function(err, res) {
            if (err) {
              agenda.now('error report', {
                cellNumber: cell,
                errorMsg: err.message,
                jobName: 'payment check'
              });
            }
          });
        }
      });
    });
  });
};