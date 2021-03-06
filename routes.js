

/**
 * Maps routes to controllers
**/

var homeController = require('./controllers/home');
var userController = require('./controllers/user');
var complexController = require('./controllers/complex');
var twilioController = require('./controllers/twilio'); 


module.exports.setup = function (app) {

  app.get('/', homeController.index);
  app.get('/users', userController.getUsers);
  app.get('/signup', userController.getSignup);
  app.post('/signup', userController.postSignup);
  app.post('/login', userController.postLogin);
  app.get('/logout', userController.logout);
  app.get('/forgot', userController.getForgot);

  app.post('/addtenant', userController.addTenant);
  app.get('/removetenant/:cell', userController.removeTenant);
  
  app.get('/opengate', complexController.openGate);
  app.post('/inbound', twilioController.inbound);

};
