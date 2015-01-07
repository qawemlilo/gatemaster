
var Complex = require('../models/complex');


exports.fetch = function(req, res) {
  Complex.find(function (error, complexes) {

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

  var data = {
    name: req.body.name,
    suburb: req.body.suburb,
  }; 

  var complex = new Complex(data);

  Complex.findOne(data, function(err, existingComplex) {
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
  Complex.find({id: req.params.id}, function (error, complex) {

    if (error) {
      return res.status(500).json({error: true, message: error.message});
    }

    res.json(complex);
  });
};


exports.update = function(req, res, next) {
  Complex.findOne({id: req.params.id}, function(err, complex) {
    if (!complex) {
      return res.status(500).json({error: false, message: 'Complex does not exists.'});
    }

    complex.name = req.body.name || complex.name;
    complex.suburb = req.body.suburb || complex.suburb;

    complex.save(function(err) {
      if (err) return res.status(500).json({error: true, message: err.message});

      res.json({error: false, message: 'Complex updated!'});
    });
  });
};




exports.del = function(req, res, next) {
  Complex.remove({id: req.params.id}, function(err) {
    if (err) {
      return res.status(500).json({error: true, message: err.message});
    }

    res.json({error: false, message: 'Complex deleted!'});
  });
};

