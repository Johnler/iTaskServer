/**
 * Data Model for Note.
 *
 * By default, Yote's server controllers are dynamic relative
 * to their models -- i.e. if you add properties to the
 * noteSchema below, the create and update controllers
 * will respect the updated model.
 *
 * NOTE: make sure to account for any model changes on the client
 */

const apiUtils = require('../../global/utils/api');
let mongoose = require('mongoose');
let ObjectId = mongoose.SchemaTypes.ObjectId;

// define note schema
const noteSchema = mongoose.Schema({
  // default values from Yote CLI
  created:                  { type: Date, default: Date.now }
  , updated:                { type: Date, default: Date.now }

  // specific values for note go below
  , _flow:                  { type: ObjectId, ref: 'Flow' }
  , _task:                  { type: ObjectId, ref: 'Task' }
  , _user:                  { type: ObjectId, ref: 'User', required: '{PATH} is required!' }
  , content:                { type: String, required: '{PATH} is required!' }
});

// note instance methods go here
// noteSchema.methods.methodName = function() {};

// note model static functions go here
// noteSchema.statics.staticFunctionName = function() {};
noteSchema.statics.getSchema = () => {
  logger.info('return default schema paths');
  let schema = {}
  noteSchema.eachPath((path, schemaType) => {
    // console.log(path, schemaType);
    schema[path] = schemaType;
  });
  return schema;
}

noteSchema.statics.getDefault = () => {
  logger.info('return default object based on schema');
  let defObj = {};
  noteSchema.eachPath((path, schemaType) => {
    defObj[path] = apiUtils.defaultValueFromSchema(schemaType);
  });
  return defObj;
}

const Note = mongoose.model('Note', noteSchema);


// // note model methods
// function createDefaults() {
//   Note.find({}).exec(function(err, notes) {
//     if(notes.length == 0) {
//       Note.create({
//         name: "Sample Note Name!"
//       });
//       logger.info("created initial note defaults");
//     }
//   });
// }
//
// exports.createDefaults = createDefaults;
