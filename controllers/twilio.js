

var twilioModule = require('twilio');
var Complex = require('../models/complex');
var User = require('../models/user');
var config       = require('../config');
var twilio       = twilioModule(config.twilio.sid, config.twilio.token);
var client       = new twilioModule.RestClient(config.twilio.sid, config.twilio.token);



function randomNum (num) {
  return Math.floor(Math.random() * num);
}


function makeCall (to, from, resUrl, fn) {
  var numberTo = to.trim().replace(/ /g, '');
  var numberFrom = from.trim().replace(/ /g, '');

  if (numberTo.indexOf(0) === 0) {
    numberTo = '+27' + numberTo.substring(1);
  }

  if (numberFrom.indexOf(0) === 0) {
    numberFrom = '+27' + numberFrom.substring(1);
  }

  client.makeCall({
    to: numberTo,
    from: numberFrom, 
    url: resUrl
  })
  .then(function(call) {
    fn(null, call);
  }, 
  function(error) {
    fn(error);
  });
}


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

  if (numberTo.indexOf(0) === 0) {
    numberTo = '+27' + numberTo.substring(1);
  }

  client.makeCall({
    to: numberTo, // a number to call
    from:'+27730231041', // a Twilio number you own
    url: 'http://twimlets.com/echo?Twiml=%3CResponse%3E%3CSay%3EHello%3C%2FSay%3E%3C%2FResponse%3E' // A URL containing TwiML instructions for the call
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
  var resUrl = 'http://' + req.headers.host + '/inbound';

  if (req.user) {
    Complex.findById(req.user.complex, function (error, complex) {
      if (error) {
        return res.status(500).json({error: true, message: error.message});
      }

      if (!complex) {
        return res.status(404).json({error: true, message: 'Complex not found'});
      }

      var num = randomNum(complex.verifiedNumbers.length);
      var from = complex.verifiedNumbers[num];

      makeCall(complex.gateNumber, from, resUrl, function () {
        res.json({error: false, message: 'Call made'});
      });
    });
  }
  else {
    res.status(500).json({error: true, message: 'Please login'});
  }
};


exports.inbound = function (req, res, next) {

  var resUrl = 'http://' + req.headers.host + '/inbound';
  var from = req.params.from;

  if (from) {
    from = from.trim().replace(/ /g, '');

    if(from.indexOf('+27') > -1) {
      from = from.replace('+27', '0');
    }
  }

  User.find({cell: from}, function (error, user) {
    if (error) {
      console.log(error);
    }

    if (!user) {
      res.set('Content-Type', 'text/xml'); 
      return res.end('<Response><Reject/></Response>');
    }

    user.getComplex(function (error, complex) {
      if (error) {
        console.log(error);
      }

      var verifiedNumber = complex.verifiedNumbers[randomNum(complex.verifiedNumbers.length)];

      makeCall(complex.gateNumber, verifiedNumber, resUrl, function (error, data){
        res.set('Content-Type', 'text/xml');
        res.end('<Response><Reject/></Response>');
      });
    });
  });
};