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

  });

  // user want to login and use an API token instead of session cookies -- i.e. for mobile
  router.post('/api/users/token', function(req, res, next) {

  });

  // user logout
  router.post('/api/users/logout', requireLogin(), function(req, res) {
    // logout with token will not affect session status, and vice-versa
  });


  /**
   * User's CRUD API
   */

  // - Create
  router.post('/api/users/register'     , users.register); // create and login
  router.post('/api/users'              , requireRole('admin'), users.create); // create without login

  // - Read
  router.get('/api/users'               , requireRole('admin'), users.list); // must be an 'admin' to see the list of users
  router.get('/api/users/by-:refKey/:refId*'  , requireRole('admin'), users.listByRefs);
  router.get('/api/users/by-:refKey-list'    , requireRole('admin'), users.listByValues);
  router.get('/api/users/get-logged-in' , requireLogin(), users.getLoggedInUser);
  router.get('/api/users/:id'           , requireRole('admin'), users.getById); // must be an 'admin' to see individual user info

  // - Update
  router.put('/api/users/update-profile'     , requireLogin(), users.updateProfile);
  router.put('/api/users/:userId'      , requireLogin(), users.update);
  router.post('/api/users/password'    , requireLogin(), users.changePassword);
  router.post('/api/users/request-password-reset'          , users.requestPasswordReset);
  router.get('/api/users/check-reset-request/:resetHex'    , users.checkResetRequest);
  router.post('/api/users/reset-password'                 , users.resetPassword);

  // - Delete
  // NOTE: Be careful with this...
  router.delete('/api/users/:userId'   , requireRole('admin'), users.delete);


}
