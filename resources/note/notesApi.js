/**
 * CRUD API for Note.
 *
 * NOTE:
 * to restrict routes to only logged in users, add "requireLogin()"
 * to restrict routes to only admin users, add "requireRole('admin')"
 */

var notes = require('./notesController');

module.exports = function(router, requireLogin, requireRole) {

  // - Create
  router.post('/api/notes'               , (params) => requireLogin(params), notes.create); // must login by default

  // - Read
  router.get('/api/notes'                , notes.list);
  router.get('/api/notes/search'         , notes.search);
  router.get('/api/notes/by-:refKey/:refId*'  , notes.listByRefs);
  router.get('/api/notes/by-:refKey-list'    , notes.listByValues);
  router.get('/api/notes/default'        , notes.getDefault);
  router.get('/api/notes/schema'         , (params) => requireRole('admin', params), notes.getSchema);
  router.get('/api/notes/:id'            , notes.getById);

  // - Update
  router.put('/api/notes/:id'            , (params) => requireLogin(params), notes.update); // must login by default

  // - Delete
  router.delete('/api/notes/:id'         , (params) => requireRole('admin', params), notes.delete); // must be an 'admin' by default

}
