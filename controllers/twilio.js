

var config = require('../config');
var twilioModule = require('twilio');
var twilio = twilioModule(config.twilio.sid, config.twilio.token);
var client = new twilioModule.RestClient(config.twilio.sid, config.twilio.token);




exports.sendSMS = function (numberTo, message, fn) {
  numberTo = numberTo.trim().replace(/ /g, '');

  if (numberTo.indexOf(0) === '0') {
    numberTo = '+27' + numberTo.substring(1);
  }

  console.log('smsTo: %s', numberTo);
  console.log('msg: %s', message);

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


exports.openGate = function (req, res) {
  var number = req.user.cell || 'nonumber';

  client.makeCall({
    to: '+27632220269', // a number to call
    from:'+27730231041', // a Twilio number you own
    url: 'http://12045876.ngrok.com/inbound?number=' + number // A URL containing TwiML instructions for the call
  })
  .then(function(call) {
    console.log('Call success! Call SID: ' + call.sid);
    res.json({error: false, message: 'Call made'});
  }, 
  function(error) {
    console.error('Call failed!  Reason: ' + error.message);
    res.json({error: true, message: error.message});
  });
};


exports.inbound = function (req, res, next) {
  var twilio = require('twilio');
  var twiml = new twilio.TwimlResponse();

  var number = req.query.number;
  var msgOne = 'Welcome to the future. I have been sent by mr awesome, also known as, the awesome Q, to come and open your gates.';
  var msgTwo = '';
  var msgThree = 'We are launching this application in 2 weeks. Make sure you buy Q a beer, this dude is AWESOME!';

  if (number === 'nonumber') {
    msgTwo = 'You cell number was not found';
  }
  else {
    msgTwo = 'You cell number is ' + number;
  }
  
  var options = {
    voice: 'woman',
    language: 'en-gb'
  };

  twiml.say(msgOne)
  .pause({
    length: 1
  })
  .say(msgTwo)
  .pause({
    length: 1
  })
  .say(msgThree, options)
  .pause({
    length: 1
  })
  .say('Good bye')
  .say('Good bye', options);

  res.set('Content-Type', 'text/xml');
  res.end(twiml.toString());
};