const Post = require('../app/models/post');
const User = require('../app/models/user');

exports.followUser = (req, res) => {
  User.findOne({'_id':req.user.id}, function(err, doc){
    var isInArray = doc.following.some(function (user) {
      return user.equals(req.params.userid);
      });
      if(!isInArray){
      User.findOneAndUpdate({'_id':req.params.userid}, {$push: { followers: req.user }}, {new: true},
        function(err, doc){
        console.log('addfollowers');
      });
        User.findOneAndUpdate({'_id':req.user._id},{$push: { following: req.params.userid }}, {new: true},
        function(err, doc){
        res.send(false); //show unfollow button
      });
    }else {
       User.findOneAndUpdate({'_id':req.params.userid},{$pullAll: { followers:[req.user._id]}}, {new: true}, function(err, doc){
        console.log(doc);
      });
    User.findOneAndUpdate({'_id':req.user._id},{$pullAll: { following: [req.params.userid]}}, {new: true}, function(err, doc){
      res.send(true); //show follow button
      });
    }
  });
};


exports.showSubs = (req, res) => {
  Post
   .find({'_creator': {$in :req.user.following}})
   .populate('_creator')
   .sort({'createdAt':-1})
   .exec(function (err, posts) {
   res.json({posts: posts});
  });
};