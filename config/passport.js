var JwtStrategy = require('passport-jwt').Strategy;

// load up the user model
var User = require('../app/models/user');
var config = require('../config/database'); // get db config file

module.exports = function(passport) {
  var opts = {};
  opts.secretOrKey = config.secret;
  passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    User.findOne({email: jwt_payload.email}, function(err, user) {

          console.log('Passport Middelware');
          console.log(jwt_payload);
           console.log('Passport Middelware user');
          console.log(user);

          if (err) {
              return done(err, false);
          }
          if (user) {
              done(null, user);
          } else {
              done(null, false);
          }
      });
  }));
};