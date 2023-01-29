/**
 * Sever-side controllers for Flow.
 * By default, Yote's server controllers are dynamic relative
 * to their models -- i.e. if you add fields to the Flow
 * model, the create and update controllers below will respect
 * the new schema.
 *
 * NOTE: HOWEVER, you still need to make sure to account for
 * any model changes on the client
 */

let Flow = require('mongoose').model('Flow');

exports.list = (req, res) => {

}

exports.listByValues = (req, res) => {

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
    Flow.find(query, (err, flows) => {
      if(err || !flows) {
        res.send({success: false, message: `Error retrieving flows by ${req.params.refKey}: ${req.params.refId}`});
      } else {
        res.send({success: true, flows})
      }
    })
  }
}

exports.search = (req, res) => {
  // search by query parameters
  // NOTE: It's up to the front end to make sure the params match the model
  let mongoQuery = {};
  let page, per;

  for(key in req.query) {
    if(req.query.hasOwnProperty(key)) {
      if(key == "page") {
        page = parseInt(req.query.page);
      } else if(key == "per") {
        per = parseInt(req.query.per);
      } else {
        logger.debug("found search query param: " + key);
        mongoQuery[key] = req.query[key];
      }
    }
  }

  logger.info(mongoQuery);
  if(page || per) {
    page = page || 1;
    per = per || 20;
    Flow.find(mongoQuery).skip((page-1)*per).limit(per).exec((err, flows) => {
      if(err || !flows) {
        logger.error("ERROR:");
        logger.info(err);
        res.send({ success: false, message: err });
      } else {
        res.send({
          success: true
          , flows: flows
          , pagination: {
            per: per
            , page: page
          }
        });
      }
    });
  } else {
    Flow.find(mongoQuery).exec((err, flows) => {
      if(err || !flows) {
        logger.error("ERROR:");
        logger.info(err);
        res.send({ success: false, message: err });
      } else {
        res.send({ success: true, flows: flows });
      }
    });
  }
}

exports.getById = (req, res) => {
  logger.info('get flow by id');
  Flow.findById(req.params.id).exec((err, flow) => {
    if(err) {
      logger.error("ERROR:");
      logger.info(err);
      res.send({ success: false, message: err });
    } else if (!flow) {
      logger.error("ERROR: Flow not found.");
      res.send({ success: false, message: "Flow not found." });
    } else {
      res.send({ success: true, flow: flow });
    }
  });
}

exports.getSchema = (req, res) => {
  /**
   * This is admin protected and useful for displaying REST api documentation
   */
  logger.info('get flow full mongo schema object');
  res.send({success: true, schema: Flow.getSchema()});
}


exports.getDefault = (req, res) => {
  /**
   * This is an open api call by default (see what I did there?) and is used to
   * return the default object back to the Create components on the client-side.
   */
  logger.info('get flow default object');
  res.send({success: true, defaultObj: Flow.getDefault()});
}

exports.create = (req, res) => {

}

exports.update = (req, res) => {

}

exports.delete = (req, res) => {

}
