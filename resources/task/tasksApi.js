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
  router.post('/api/tasks'               , (params) => requireLogin(params), tasks.create); // must login by default

  // - Read
  router.get('/api/tasks'                , tasks.list);
  router.get('/api/tasks/search'         , tasks.search);
  router.get('/api/tasks/by-:refKey/:refId*'  , tasks.listByRefs);
  router.get('/api/tasks/by-:refKey-list'    , tasks.listByValues);
  router.get('/api/tasks/default'        , tasks.getDefault);
  router.get('/api/tasks/schema'         , (params) => requireRole('admin', params), tasks.getSchema);
  router.get('/api/tasks/:id'            , tasks.getById);

  // - Update
  router.put('/api/tasks/:id'            , (params) => requireLogin(params), tasks.update); // must login by default

  // - Delete
  router.delete('/api/tasks/:id'         , (params) => requireRole('admin', params), tasks.delete); // must be an 'admin' by default

}
