/**
 * Data Model for Flow.
 *
 * By default, Yote's server controllers are dynamic relative
 * to their models -- i.e. if you add properties to the
 * flowSchema below, the create and update controllers
 * will respect the updated model.
 *
 * NOTE: make sure to account for any model changes on the client
 */

const apiUtils = require('../../global/utils/api');
let mongoose = require('mongoose');
let ObjectId = mongoose.SchemaTypes.ObjectId;

// define flow schema
const flowSchema = mongoose.Schema({
  // default values from Yote CLI
  created:                  { type: Date, default: Date.now }
  , updated:                { type: Date, default: Date.now }

  // specific values for flow go below
  , name:                   { type: String, required: '{PATH} is required!' }
  , description:            { type: String }
});

// flow instance methods go here
// flowSchema.methods.methodName = function() {};

// flow model static functions go here
// flowSchema.statics.staticFunctionName = function() {};
flowSchema.statics.getSchema = () => {
  logger.info('return default schema paths');
  let schema = {}
  flowSchema.eachPath((path, schemaType) => {
    // console.log(path, schemaType);
    schema[path] = schemaType;
  });
  return schema;
}

flowSchema.statics.getDefault = () => {
  logger.info('return default object based on schema');
  let defObj = {};
  flowSchema.eachPath((path, schemaType) => {
    defObj[path] = apiUtils.defaultValueFromSchema(schemaType);
  });
  return defObj;
}

const Flow = mongoose.model('Flow', flowSchema);


// flow model methods
function createDefaults() {
  Flow.find({}).exec(function(err, flows) {
    if(flows.length == 0) {
      Flow.create({
        name: "Sample Flow Name!"
      });
      logger.info("created initial flow defaults");
    }
  });
}

exports.createDefaults = createDefaults;
