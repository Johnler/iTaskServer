/**
 * CRUD API for Task.
 *
 * NOTE:
 * to restrict routes to only logged in users, add "requireLogin()"
 * to restrict routes to only admin users, add "requireRole('admin')"
 */

var tasks = require('./tasksController');

module.exports = function(router, requireLogin, requireRole) {

  // - Create
  router.post('/api/tasks'               , (req, res, next) => requireLogin({req, res, next}), tasks.create); // must login by default

  // - Read
  router.get('/api/tasks'                , tasks.list);
  router.get('/api/tasks/search'         , tasks.search);
  router.get('/api/tasks/by-:refKey/:refId*'  , tasks.listByRefs);
  router.get('/api/tasks/by-:refKey-list'    , tasks.listByValues);
  router.get('/api/tasks/default'        , tasks.getDefault);
  router.get('/api/tasks/schema'         , (req, res, next) => requireRole('admin', {req, res, next}), tasks.getSchema);
  router.get('/api/tasks/:id'            , tasks.getById);

  // - Update
  router.put('/api/tasks/:id'            , (req, res, next) => requireLogin({req, res, next}), tasks.update); // must login by default

  // - Delete
  router.delete('/api/tasks/:id'         , (req, res, next) => requireRole('admin', {req, res, next}), tasks.delete); // must be an 'admin' by default

}
