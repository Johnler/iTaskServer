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
  router.post('/api/notes'               , (req, res, next) => requireLogin({req, res, next}), notes.create); // must login by default

  // - Read
  router.get('/api/notes'                , notes.list);
  router.get('/api/notes/search'         , notes.search);
  // router.get('/api/notes/by-:refKey/:refId*'  , notes.listByRefs);
  router.get('/api/notes/by-:refKey/:refId*'  , notes.customList);
  router.get('/api/notes/by-:refKey-list'    , notes.listByValues);
  router.get('/api/notes/default'        , notes.getDefault);
  router.get('/api/notes/schema'         , (req, res, next) => requireRole('admin', {req, res, next}), notes.getSchema);
  router.get('/api/notes/:id'            , notes.getById);

  // - Update
  router.put('/api/notes/:id'            , (req, res, next) => requireLogin({req, res, next}), notes.update); // must login by default

  // - Delete
  router.delete('/api/notes/:id'         , (req, res, next) => requireRole('admin', {req, res, next}), notes.delete); // must be an 'admin' by default

}
