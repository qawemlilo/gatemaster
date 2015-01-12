
var Complex = require('../models/complex');
var config = require('../config');
var twilio = require('twilio');
var client = new twilio.RestClient(config.twilio.sid, config.twilio.token);


function makeCall (from, to, fn) {
  from = from.trim().replace(/ /g, '');
  to = to.trim().replace(/ /g, '');

  if (from.indexOf(0) === 0) {
    from = '+27' + from.substring(1);
  }

  if (to.indexOf(0) === 0) {
    to = '+27' + to.substring(1);
  }

  client.makeCall({
    to: to, // a number to call
    from: from, // a Twilio number you own
    url: 'http://twimlets.com/echo?Twiml=%3CResponse%3E%3CSay%3EHello%3C%2FSay%3E%3C%2FResponse%3E' // A URL containing TwiML instructions for the call
  })
  .then(function(call) {
    console.log('Call success! Call SID: '+ call.sid);
    fn();
  }, 
  function(error) {
    fn(error);
  });
}


exports.fetch = function(req, res) {
  Complex.find(function (error, complexs) {

    if (error) {
      return res.status(500).json(error);
    }

    res.json(complexs);
  });
};


exports.openGate = function(req, res) {
  Complex.findOne({_id: req.user.complex}, function (error, complex) {

    if (error) {
      return res.status(500).json({error: true, message: error.message});
    }

    if (!complex || !complex.numbers.length || !complex.sendTo) {
      return res.status(500).json({error: true, message: 'Complex number not found'});
    }

    var randomNum = Math.floor((Math.random() * 10) % complex.numbers.length);

    makeCall(complex.numbers[randomNum], complex.sendTo, function (error) {
      if (error) {
        console.log('Error: ' + error.message);
        return res.status(500).json({error: true, message: error.message});
      }

      res.json({error: false, message: 'Call made'});
    });
  });
};



exports.postSave = function(req, res, next) {
  req.assert('name', 'Name must be at least 2 characters long').len(2);

  var errors = req.validationErrors();

  if (errors) {
    return res.status(500).json(errors);
  }

  var complex = new Complex({
    name: req.body.name
  });

  Complex.findOne({name: req.body.name}, function(err, existingComplex) {
    if (existingComplex) {
      return res.status(500).json({error: false, msg: 'That Complex already exists.'});
    }

    complex.save(function(err) {
      if (err) return res.status(500).json(err);

      res.json({error: false, msg: 'Complex saved!'});
    });
  });
};


exports.save = function(req, res, next) {
  req.assert('name', 'Name must be at least 2 characters long').len(2);

  var errors = req.validationErrors();

  if (errors) {
    return res.status(500).json(errors);
  }

  var complex = new Complex({
    name: req.body.name
  });

  Complex.findOne({name: req.body.name}, function(err, existingComplex) {
    if (existingComplex) {
      return res.status(500).json({error: false, msg: 'Complex already exists.'});
    }

    complex.save(function(err) {
      if (err) return res.status(500).json(err);

      res.json({error: false, msg: 'Complex saved!'});
    });
  });
};




exports.update = function(req, res, next) {
  req.assert('name', 'Name must be at least 2 characters long').len(2);
  req.assert('id', 'Must not be empty').notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    return res.status(500).json(errors);
  }

  Complex.findOne({id: req.body.id}, function(err, complex) {
    if (!complex) {
      return res.status(500).json({error: false, msg: 'Complex does not exists.'});
    }

    complex.name = req.body.name;

    complex.save(function(err) {
      if (err) return res.status(500).json(err);

      res.json({error: false, msg: 'Complex updated!'});
    });
  });
};




exports.del = function(req, res, next) {
  req.assert('id', 'Must not be empty').notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    return res.status(500).json(errors);
  }

  Complex.remove({id: req.body.id}, function(err) {
    if (err) {
      return res.status(500).json(err);
    }

    res.json({error: false, msg: 'Complex deleted!'});
  });
};

