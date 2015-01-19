/**

  API end points
  
  ### Users
  
   - `GET    /users`     - fetch all users
   - `POST   /users`     - create a new user
   - `GET    /users/:id` - fetch a single user
   - `PUT    /users/:id` - update user
   - `DELETE /users/:id` - delete user
  
  
  ### Payments
  
   - `GET    /payments`     - fetch all payments
   - `POST   /payments`     - create a new payment
   - `GET    /payments/:id` - fetch a single payment
   - `PUT    /payments/:id` - update payment
   - `DELETE /payments/:id` - delete payment
  
  
  ### Complexes
  
   - `GET    /complexes`     - fetch all complexes
   - `POST   /complexes`     - create a new complex
   - `GET    /complexes/:id` - fetch a single complex
   - `PUT    /complexes/:id` - update complex
   - `DELETE /complexes/:id` - delete complex
 
**/

var express = require('express');
var router  = express.Router();
var Twilio  = require('./twilio');
var Complex = require('./complex');
var Payment = require('./payment');
var User    = require('./user');


router.route('/twilio')
  .post(Twilio.makeCall);


router.route('/complexes')
  .get(Complex.fetch)
  .post(Complex.add);

router.route('/complexes/:id')
  .get(Complex.get)
  .put(Complex.update)
  .delete(Complex.del);


router.route('/payments')
  .get(Payment.fetch)
  .post(Payment.add);

router.route('/payments/:id')
  .get(Payment.get)
  .put(Payment.update)
  .delete(Payment.del);


router.route('/users')
  .get(User.fetch)
  .post(User.add);

router.route('/users/:id')
  .get(User.get)
  .put(User.update)
  .delete(User.del);


module.exports = router;
