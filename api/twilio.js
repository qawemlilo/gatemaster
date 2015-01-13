

var config = require('../config');
var twilioModule = require('twilio');
var twilio = twilioModule(config.twilio.sid, config.twilio.token);
var client = new twilioModule.RestClient(config.twilio.sid, config.twilio.token);


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


exports.makeCall = function (req, res) {
  var cell = req.body.cell;
  var numberTo = cell.trim().replace(/ /g, '');

  if (numberTo.indexOf(0) === 0) {
    numberTo = '+27' + numberTo.substring(1);
  }
  else {
    console.log(numberTo);
  }

  client.makeCall({
    to: numberTo, // a number to call
    from:'+27730231041', // a Twilio number you own
    url: 'http://12045876.ngrok.com/inbound' // A URL containing TwiML instructions for the call
  })
  .then(function(call) {
    console.log('Call success! Call SID: '+ call.sid);
    res.json({error: false, message: 'Call made'});
  }, 
  function(error) {
    console.error('Call failed!  Reason: '+error.message);
    res.status(500).json({error: true, message: error.message});
  });
};


exports.inbound = function (req, res, next) {
  var twiml = new twilio.TwimlResponse();
  var options = {
    voice: 'woman',
    language: 'en-gb'
  };

  twiml.say('Good day, have a lovely one', options);

  res.set('Content-Type', 'text/xml');
  res.end(twiml.toString());
};