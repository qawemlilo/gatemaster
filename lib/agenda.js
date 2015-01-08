
var Agenda = require('agenda');
var ActiveAgenda = null;
var config = require('../config/secrets');

module.exports = function () {
  if (ActiveAgenda) {
  	return ActiveAgenda;
  }
  
  var agenda = new Agenda({
    db: {
      address: config.db,
      collection: config.agendCollection
    }
  });

  ActiveAgenda = agenda;

  return agenda;
};