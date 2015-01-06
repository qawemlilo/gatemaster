/**
 * GET /
 * Home page.
 */

exports.index = function(req, res) {
  var view = 'account/login';
  var title = 'Login';

  if (req.user) {
    view = 'home';
    title = 'Home'
  }
  
  res.render(view, {
    title: title
  });
};
