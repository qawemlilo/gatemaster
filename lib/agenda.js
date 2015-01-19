
/**
 *  Agenda Instantiation
**/

var Agenda = require('agenda');
var ActiveAgenda = null;
var config = require('../config');


module.exports = function () {
  if (ActiveAgenda) {
  	return ActiveAgenda;
  }
  
  ActiveAgenda = new Agenda({
    db: {
      address: config.db,
      collection: config.agendCollection
    }
  });

  return ActiveAgenda;
};