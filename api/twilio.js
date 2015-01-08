

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


exports.makeCall = function (req, res) {
  var number = req.body.number;
  var numberTo = number.trim().replace(/ /g, '');

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

  twiml.say('Hello Cathrine! You have won one million dollars for being awesome. lol, Zim dollars. Do not be mad at me, I was sent by Q, your friend', options);

  res.set('Content-Type', 'text/xml');
  res.end(twiml.toString());
};