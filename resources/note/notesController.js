/**
 * Sever-side controllers for Note.
 * By default, Yote's server controllers are dynamic relative
 * to their models -- i.e. if you add fields to the Note
 * model, the create and update controllers below will respect
 * the new schema.
 *
 * NOTE: HOWEVER, you still need to make sure to account for
 * any model changes on the client
 */

let Note = require('mongoose').model('Note');

exports.list = (req, res) => {

}

exports.listByValues = (req, res) => {
  /**
   * returns list of notes queried from the array of _id's passed in the query param
   *
   * NOTES:
   * node default max request headers + uri size is 80kb.
   */

  if(!req.query[req.params.refKey]) {
    // make sure the correct query params are included
    res.send({success: false, message: `Missing query param(s) specified by the ref: ${req.params.refKey}`});
  } else {
    Note.find({[req.params.refKey]: {$in: [].concat(req.query[req.params.refKey]) }}, (err, notes) => {
        if(err || !notes) {
          res.send({success: false, message: `Error querying for notes by ${[req.params.refKey]} list`, err});
        } else  {
          res.send({success: true, notes});
        }
    })
  }
}

exports.listByRefs = (req, res) => {
  /**
   * NOTE: This let's us query by ANY string or pointer key by passing in a refKey and refId
   */

   // build query
  let query = {
    [req.params.refKey]: req.params.refId === 'null' ? null : req.params.refId
  }
  // test for optional additional parameters
  const nextParams = req.params['0'];
  if(nextParams.split("/").length % 2 == 0) {
    // can't have length be uneven, throw error
    res.send({success: false, message: "Invalid parameter length"});
  } else {
    if(nextParams.length !== 0) {
      for(let i = 1; i < nextParams.split("/").length; i+= 2) {
        query[nextParams.split("/")[i]] = nextParams.split("/")[i+1] === 'null' ? null : nextParams.split("/")[i+1]
      }
    }
    Note.find(query, (err, notes) => {
      if(err || !notes) {
        res.send({success: false, message: `Error retrieving notes by ${req.params.refKey}: ${req.params.refId}`});
      } else {
        res.send({success: true, notes})
      }
    })
  }
}

exports.search = (req, res) => {

}

exports.getById = (req, res) => {
  logger.info('get note by id');
  Note.findById(req.params.id).exec((err, note) => {
    if(err) {
      logger.error("ERROR:");
      logger.info(err);
      res.send({ success: false, message: err });
    } else if (!note) {
      logger.error("ERROR: Note not found.");
      res.send({ success: false, message: "Note not found." });
    } else {
      res.send({ success: true, note: note });
    }
  });
}

exports.getSchema = (req, res) => {
  /**
   * This is admin protected and useful for displaying REST api documentation
   */
  logger.info('get note full mongo schema object');
  res.send({success: true, schema: Note.getSchema()});
}


exports.getDefault = (req, res) => {
  /**
   * This is an open api call by default (see what I did there?) and is used to
   * return the default object back to the Create components on the client-side.
   */
  logger.info('get note default object');
  res.send({success: true, defaultObj: Note.getDefault()});
}

exports.create = (req, res) => {
 
}

exports.update = (req, res) => {
 
}

exports.delete = (req, res) => {

}
