
var Complex = require('../models/complex');


exports.fetch = function(req, res) {
  Complex.find(function (error, complexs) {

    if (error) {
      return res.status(500).json(error);
    }

    res.json(complexs);
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

