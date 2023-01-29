/**
 * CRUD API for Flow.
 *
 * NOTE:
 * to restrict routes to only logged in users, add "requireLogin()"
 * to restrict routes to only admin users, add "requireRole('admin')"
 */

var flows = require('./flowsController');

module.exports = function(router, requireLogin, requireRole) {

  // - Create
  router.post('/api/flows'               , requireLogin(), flows.create); // must login by default

  // - Read
  router.get('/api/flows'                , flows.list);
  router.get('/api/flows/search'         , flows.search);
  router.get('/api/flows/by-:refKey/:refId*'  , flows.listByRefs);
  router.get('/api/flows/by-:refKey-list'    , flows.listByValues);
  router.get('/api/flows/default'        , flows.getDefault);
  router.get('/api/flows/schema'         , requireRole('admin'), flows.getSchema);
  router.get('/api/flows/:id'            , flows.getById);

  // - Update
  router.put('/api/flows/:id'            , requireLogin(), flows.update); // must login by default

  // - Delete
  router.delete('/api/flows/:id'         , requireRole('admin'), flows.delete); // must be an 'admin' by default

}
