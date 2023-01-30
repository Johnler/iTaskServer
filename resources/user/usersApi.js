/**
 * User's API includes login to session, login and retrieve API token, logout,
 * and standard CRUD.
 */

let passport = require('passport');
let User = require('mongoose').model('User');
let users = require('./usersController');
let logger = global.logger;

module.exports = function(router, requireLogin, requireRole) {

  // user login and use session cookies
  router.post('/api/users/login', function(req, res, next) {
    const { username, password } = req.body;
    var projection = {
      username: 1, password_salt: 1, password_hash: 1, roles: 1
    }
    User.findOne({username:username}, projection).exec((err, user) => {
      if(user && user.authenticate(password)) {
        logger.debug("authenticated!");
        req.login(user, function(err) {
          if(err) {
            logger.error("ERROR LOGGING IN NEW USER");
            logger.error(err);
            return next(err);
          } else {
            // check if this is coming from mobile & requires a token in response
            if(req.param("withToken")) {
              logger.info("create api token for mobile user");
              user.createToken(function(err, token) {
                if(err || !token) {
                  res.send({ success: false, message: "unable to generate user API token" });
                } else {
                  res.send({ success: true, user: user, token });
                }
              });
            } else {
              logger.info("USER LOGGING IN");
              logger.warn(req.user.username);
              res.send({ success:true, user: user });
            }
          }
        });
      } else {
        logger.debug("NOT authenticated");
        res.send({status:"NOT authenticated", user})
      }
    })
  });

  // user want to login and use an API token instead of session cookies -- i.e. for mobile
  router.post('/api/users/token', function(req, res, next) {

  });

  // user logout
  router.post('/api/users/logout', (req, res, next) => requireLogin({req, res, next}), function(req, res) {
    // logout with token will not affect session status, and vice-versa
    res.send({
      success: true, message: 'Logout Success'
    })
  });


  /**
   * User's CRUD API
   */

  // - Create
  router.post('/api/users/register'     , users.register); // create and login
  router.post('/api/users'              , (req, res, next) => requireRole('admin', {req, res, next}), users.create); // create without login

  // - Read
  router.get('/api/users'               , (req, res, next) => requireRole('admin', {req, res, next}), users.list); // must be an 'admin' to see the list of users
  router.get('/api/users/by-:refKey/:refId*'  , (req, res, next) => requireRole('admin', {req, res, next}), users.listByRefs);
  router.get('/api/users/by-:refKey-list'    , (req, res, next) => requireRole('admin', {req, res, next}), users.listByValues);
  router.get('/api/users/get-logged-in' ,(req, res, next) => requireLogin({req, res, next}), users.getLoggedInUser);
  router.get('/api/users/:id'           ,(req, res, next) => requireRole('admin', {req, res, next}), users.getById); // must be an 'admin' to see individual user info

  // - Update
  router.put('/api/users/update-profile'     , (req, res, next) => requireLogin({req, res, next}), users.updateProfile);
  router.put('/api/users/:userId'      , (req, res, next) => requireLogin({req, res, next}), users.update);
  router.post('/api/users/password'    , (req, res, next) => requireLogin({req, res, next}), users.changePassword);
  router.post('/api/users/request-password-reset'          , users.requestPasswordReset);
  router.get('/api/users/check-reset-request/:resetHex'    , users.checkResetRequest);
  router.post('/api/users/reset-password'                 , users.resetPassword);

  // - Delete
  // NOTE: Be careful with this...
  router.delete('/api/users/:userId'   , (req, res, next) => requireRole('admin', {req, res, next}), users.delete);


}
