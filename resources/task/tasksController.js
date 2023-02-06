/**
 * Sever-side controllers for Task.
 * By default, Yote's server controllers are dynamic relative
 * to their models -- i.e. if you add fields to the Task
 * model, the create and update controllers below will respect
 * the new schema.
 *
 * NOTE: HOWEVER, you still need to make sure to account for
 * any model changes on the client
 */

let Task = require('mongoose').model('Task');

exports.list = (req, res) => {

}

exports.listByValues = (req, res) => {
  /**
   * returns list of tasks queried from the array of _id's passed in the query param
   *
   * NOTES:
   * node default max request headers + uri size is 80kb.
   */

  if(!req.query[req.params.refKey]) {
    // make sure the correct query params are included
    res.send({success: false, message: `Missing query param(s) specified by the ref: ${req.params.refKey}`});
  } else {
    Task.find({[req.params.refKey]: {$in: [].concat(req.query[req.params.refKey]) }}, (err, tasks) => {
        if(err || !tasks) {
          res.send({success: false, message: `Error querying for tasks by ${[req.params.refKey]} list`, err});
        } else  {
          res.send({success: true, tasks});
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
    Task.find(query, (err, tasks) => {
      if(err || !tasks) {
        res.send({success: false, message: `Error retrieving tasks by ${req.params.refKey}: ${req.params.refId}`});
      } else {
        res.send({success: true, tasks})
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
    Task.find(mongoQuery).skip((page-1)*per).limit(per).exec((err, tasks) => {
      if(err || !tasks) {
        logger.error("ERROR:");
        logger.info(err);
        res.send({ success: false, message: err });
      } else {
        res.send({
          success: true
          , tasks: tasks
          , pagination: {
            per: per
            , page: page
          }
        });
      }
    });
  } else {
    Task.find(mongoQuery).exec((err, tasks) => {
      if(err || !tasks) {
        logger.error("ERROR:");
        logger.info(err);
        res.send({ success: false, message: err });
      } else {
        res.send({ success: true, tasks: tasks });
      }
    });
  }
}

exports.getById = (req, res) => {
  logger.info('get task by id');
  Task.findById(req.params.id).exec((err, task) => {
    if(err) {
      logger.error("ERROR:");
      logger.info(err);
      res.send({ success: false, message: err });
    } else if (!task) {
      logger.error("ERROR: Task not found.");
      res.send({ success: false, message: "Task not found." });
    } else {
      res.send({ success: true, task: task });
    }
  });
}

exports.getSchema = (req, res) => {
  /**
   * This is admin protected and useful for displaying REST api documentation
   */
  logger.info('get task full mongo schema object');
  res.send({success: true, schema: Task.getSchema()});
}


exports.getDefault = (req, res) => {
  /**
   * This is an open api call by default (see what I did there?) and is used to
   * return the default object back to the Create components on the client-side.
   */
  logger.info('get task default object');
  res.send({success: true, defaultObj: Task.getDefault()});
}

exports.create = async (req, res) => {
  const { body } = req
  const { name } = body
  if(!name){
    logger.error("Name is required!")
    return res.send({success: false, message: "Name is required!"})
  }
  try {
    const task = await Task.create(body)
    return res.send({success: true, task})
  }catch(err){
    logger.error('Error: ', err)
    return res.send({success: false, message: "Internal Server Error!"})
  }
}

exports.update = async (req, res) => {
  const { body, params } = req
  const { name, complete, description, status } = body
  if(!name) {
    logger.error("Property is missing.")
    return res.send({sucess:false,  message: "Name is required!"})
  }
  try{
    const task = await Task.findByIdAndUpdate(params.id, {
      description,
      name,
      complete,
      status
    })
    return res.send({success: true, task: body})
  } catch(err){
    logger.error('Error: ', err)
    return res.send({success: false, message: "Internal Server Error!"})
  }
}

exports.delete = (req, res) => {

}
