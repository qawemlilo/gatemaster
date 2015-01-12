
var _ = require('lodash');
var Complex = require('../models/complex');


exports.fetch = function(req, res) {
  Complex.find(req.query, function (error, complexes) {

    if (error) {
      return res.status(500).json({error: true, message: error.message});
    }

    res.json(complexes);
  });
};



exports.add = function(req, res, next) {
  req.assert('name', 'Name must be at least 2 characters long').len(2);
  req.assert('suburb', 'Suburb must not be empty').notEmpty();

  if (req.validationErrors()) {
    return res.status(500).json({error: true, message: 'Invalid input'});
  }

  var complex = new Complex(req.body);

  Complex.findOne(req.body, function(err, existingComplex) {
    if (existingComplex) {
      return res.status(500).json({error: true, message: 'That Complex already exists.'});
    }

    complex.save(function(err) {
      if (err) return res.status(500).json(err);

      res.json({error: false, message: 'Complex saved!'});
    });
  });
};



exports.get = function(req, res) {
  Complex.findOne({_id: req.params.id}, function (error, complex) {

    if (error) {
      return res.status(500).json({error: true, message: error.message});
    }

    res.json(complex);
  });
};


exports.update = function(req, res, next) {
  Complex.findOne({_id: req.params.id}, function(err, complex) {
    if (!complex) {
      return res.status(500).json({error: false, message: 'Complex does not exists.'});
    }

    _.extend(complex, req.body);

    complex.save(function(err) {
      if (err) return res.status(500).json({error: true, message: err.message});

      res.json({error: false, message: 'Complex updated!'});
    });
  });
};




exports.del = function(req, res, next) {
  Complex.remove({_id: req.params.id}, function(err) {
    if (err) {
      return res.status(500).json({error: true, message: err.message});
    }

    res.json({error: false, message: 'Complex deleted!'});
  });
};

