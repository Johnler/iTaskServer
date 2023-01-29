/**
 * The usersController handles all business logic for the User resource
 *
 * NOTE:  All "Update" logic should be limited to the logged in user or admin
 * protected in the API
 */

// get the appUrl for the current environment
let appUrl = require('../../config')[process.env.NODE_ENV].appUrl;

// get secrets if needed
// let secrets = require('../../config')[process.env.NODE_ENV].secrets;

let User = require('mongoose').model('User');
let emailUtil = require('../../global/utils/email');
let logger = global.logger;

exports.getLoggedInUser = (req, res) => {
  /**
   * Check if user is logged in and if so return the user object
   * Relies on existing "requireLogin" to populate the user
   * To be used for checking login status and refreshing user on mobile
   */
  res.send({success: true, user: req.user})
}

exports.list = function(req, res) {
  // check if query is paginated.
  if(req.query.page) {
    logger.debug("listing users with pagination");
    let page = req.query.page || 1;
    let per = req.query.per || 20;
    User.find({}).skip((page-1)*per).limit(per).exec(function(err, users) {
      if(err || !users) {
        res.send({ success: false, message: err });
      } else {
        res.send({
          success: true
          , users: users
          , pagination: {
            page: page
            , per: per
          }
        });
      }
    });
  } else {
    logger.debug("listing users");
    User.find({}).exec(function(err, users) {
      if(err || !users) {
        res.send({ success: false, message: err });
      } else {
        res.send({ success: true, users: users });
      }
    });
  }
}

exports.listByValues = (req, res) => {
  /**
   * returns list of users queried from the array of _id's passed in the query param
   *
   * NOTES:
   * 1) looks like the best syntax for this is, "?id=1234&id=4567&id=91011"
   *    still a GET, and more or less conforms to REST uri's
   *    additionally, node will automatically parse this into a single array via "req.query.id"
   * 2) node default max request headers + uri size is 80kb.
   *    experimentation needed to determie what the max length of a list we can do this way is
   * TODO: server side pagination
   */

  if(!req.query[req.params.refKey]) {
    // make sure the correct query params are included
    res.send({success: false, message: `Missing query param(s) specified by the ref: ${req.params.refKey}`});
  } else {
    User.find({[req.params.refKey]: {$in: [].concat(req.query[req.params.refKey]) }}, (err, users) => {
        if(err || !users) {
          res.send({success: false, message: `Error querying for users by ${[req.params.refKey]} list`, err});
        } else  {
          res.send({success: true, users});
        }
    })
  }
}

exports.listByRefs = (req, res) => {
  /**
   * NOTE: This let's us query by ANY string or pointer key by passing in a refKey and refId
   * TODO: server side pagination
   */

  // build query
  let query = {
    [req.params.refKey]: req.params.refId === 'null' ? null : req.params.refId
  }
  // test for optional additional parameters
  const nextParams = req.params['0'];
  if(nextParams.split("/").length % 2 == 0) {
    res.send({success: false, message: "Invalid parameter length"});
  } else {
    if(nextParams.length !== 0) {
      for(let i = 1; i < nextParams.split("/").length; i+= 2) {
        query[nextParams.split("/")[i]] = nextParams.split("/")[i+1] === 'null' ? null : nextParams.split("/")[i+1]
      }
    }
    User.find(query, (err, users) => {
      if(err || !users) {
        res.send({success: false, message: `Error retrieving users by ${req.params.refKey}: ${req.params.refId}`});
      } else {
        res.send({success: true, users})
      }
    })
  }
}

exports.getById = function(req, res) {
  User.findById(req.params.id).exec(function(err, user) {
    if(err || !user) {
      res.send({ success: false, message: "Error retrieving user", err: err });
    } else {
      res.send({ success: true, user: user });
    }
  })
}

exports.utilCheckAndSaveUser = function(userData, callback) {

}

exports.create = function(req, res) {

}

exports.register = function(req, res, next) {
  let userData = req.body;
  userData.roles = []; // don't let registering user set their own roles
  exports.utilCheckAndSaveUser(userData, function(result) {
    if(!result.success) {
      res.send(result);
    } else {
      req.login(result.user, function(err) {
        if(err) {
          logger.error("ERROR LOGGING IN NEW USER");
          logger.error(err);
          return next(err);
        } else {
          // check if this is coming from mobile & requires a token in response
          if(req.param("withToken")) {
            logger.info("create api token for mobile user");
            result.user.createToken(function(err, token) {
              if(err || !token) {
                res.send({ success: false, message: "unable to generate user API token" });
              } else {
                res.send({ success: true, user: result.user, token });
              }
            });
          } else {
            logger.info("NEWLY REGISTERED USER LOGGING IN");
            logger.warn(req.user.username);
            res.send({ success:true, user: result.user });
          }
        }
      });
    }
  });

}

exports.update = function(req, res) {

}

exports.updateProfile = function(req, res) {

}

exports.changePassword = function(req, res) {

}

exports.requestPasswordReset = function(req, res) {

}

exports.checkResetRequest = function(req, res) {
  // use the utility method to check for valid reset request
  exports.utilCheckResetRequest(req.params.resetHex, function(result) {
    if(result.success) {
      res.send({ success: true }); // DONT send user id back
    } else {
      res.send({ success: false, message: "Invalid or Expired Token" });
    }
  });
}

exports.utilCheckResetRequest = function(resetHex, callback) {
  /**
   * This checks that the user is using a valid password reset request.
   * Token must be a matching hex and no older than 24 hours.
   */
  var projection = {
    firstName: 1, lastName: 1, username: 1, roles: 1, resetPasswordTime: 1, resetPasswordHex: 1
  }
  User.findOne({ resetPasswordHex: resetHex }, projection).exec(function(err, user) {
    if(err || !user) {
      callback({ success: false, message: "1 Invalid or Expired Reset Token" });
    } else {
      let nowDate = new Date();
      let cutoffDate = new Date(user.resetPasswordTime);
      let validHours = 24;
      cutoffDate.setHours((cutoffDate.getHours() + validHours));
      if(nowDate < cutoffDate) {
        callback({ success: true, userId: user._id });
      } else {
        callback({ success: false, message: "2 Invalid or Expired Reset Token" });
      }

    }
  });
}


exports.resetPassword = function(req, res) {
  // before reseting the password, use the utility check to ensure a valid request
  exports.utilCheckResetRequest(req.param('resetHex'), function(result) {
    if(result.success) {
      if(!req.param('newPass') || req.param('newPass').length < 6) {
        logger.warn("needs to use a better password");
        res.send({ success: false, message: "Password requirements not met: Must be at least 6 characters long." }); //bare minimum
      } else {
        User.findOne({ _id: result.userId }).exec(function(err, user) {
          if(err || !user) {
            res.send({ success: false, message: "Could not find user in db" });
          } else {
            let newSalt = User.createPasswordSalt();
            let newHash = User.hashPassword(newSalt, req.param('newPass'));
            user.password_salt = newSalt;
            user.password_hash = newHash;
            user.resetPasswordHex = Math.floor(Math.random()*16777215).toString(16) + Math.floor(Math.random()*16777215).toString(16);
            user.save(function(err, user) {
              if(err || !user) {
                res.send({ success: false, message: "Error updating user password" });
              } else {
                res.send({ success: true, user: user });
              }
            });
          }
        });
      }
    } else {
      res.send(result);
    }
  });
}

exports.delete = function(req, res) {

}
