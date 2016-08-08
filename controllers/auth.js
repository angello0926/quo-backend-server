const User = require('../app/models/user');
var jwt         = require('jwt-simple');
var morgan      = require('morgan');
var mongoose    = require('mongoose');
var passport  = require('passport');
var config      = require('../config/database');


exports.signup = (req, res) => {
   if (!req.body.email || !req.body.password) {
    res.json({success: false, msg: 'Please pass email and password.'});
  } else {
    var newUser = new User({
      email: req.body.email,
      password: req.body.password
    });

    // save the user
    newUser.save(function(err) {
      if (err) {
        return res.json({success: false, msg: 'Username already exists.'});
      }
       var token = jwt.encode(newUser, config.secret);
      res.json({success: true, msg: 'Successful created new user.',token: 'JWT ' + token});
    });
  }
};


exports.authenticate = (req, res) => {
  User.findOne({
    email: req.body.email
  }, function(err, user) {
    if (err) throw err;
    if (!user) {
      res.send({success: false, msg: 'Authentication failed. User not found.'});
    } else {
      // check if password matches
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (isMatch && !err) {
          // if user is found and password is right create a token
          var token = jwt.encode(user, config.secret);
          // return the information including token as JSON
          res.json({success: true, token: 'JWT ' + token});
        } else {
          res.send({success: false, msg: 'Authentication failed. Wrong password.'});
        }
      });
    }
  });
};

exports.memberinfo =(req, res) =>{
   console.log("memberinfo");
    console.log(req.user);
  // var token = getToken(req.headers);
  //   if (token) {
  //     var decoded = jwt.decode(token, config.secret);

  //     console.log(decoded);
  //     User.findOne({
  //       email: decoded.email
  //     }, function(err, user) {
  //         if (err) throw err;

  //         if (!user) {
  //           return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
  //         } else {
  //           res.json({success: true, msg: 'Welcome in the member area ' + user.email + '!'});
  //         }
  //     });
  //   } else {
  //     return res.status(403).send({success: false, msg: 'No token provided.'});
  //   }
};

var getToken = function (headers) {
  if (headers && headers.authorization) {
    var parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
};


