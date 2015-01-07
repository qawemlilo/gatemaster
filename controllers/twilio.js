

var secrets = require('../config/secrets');
var twilioModule = require('twilio');
var twilio = twilioModule(secrets.twilio.sid, secrets.twilio.token);
var client = new twilioModule.RestClient(secrets.twilio.sid, secrets.twilio.token);




exports.sendSMS = function (numberTo, message, fn) {
  numberTo = numberTo.trim().replace(/ /g, '');

  if (numberTo.indexOf(0) === '0') {
    numberTo = '+27' + numberTo.substring(1);
  }

  twilio.sendMessage({
    to: numberTo,
    from: '+27875503593',
    body: message
  }, fn);
};


exports.makeCall = function (numberTo, fn) {
  numberTo = numberTo.trim().replace(/ /g, '');

  if (numberTo.indexOf(0) === '0') {
    numberTo = '+27' + numberTo.substring(1);
  }

  client.makeCall({
    to: numberTo, // a number to call
    from:'+27632220269', // a Twilio number you own
    url: 'http://12045876.ngrok.com/inbound' // A URL containing TwiML instructions for the call
  })
  .then(function(call) {
    console.log('Call success! Call SID: '+ call.sid);

    if (fn) {
      fn();
    }
  }, function(error) {
    console.error('Call failed!  Reason: '+error.message);

    if (fn) {
      fn(error);
    }
  });
};