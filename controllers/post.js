
var uuid        = require('node-uuid');
var aws        = require('aws-sdk');
const s3 = new aws.S3();
const Post = require('../app/models/post');
const User = require('../app/models/user');


aws.config.update({
  credentials: new aws.CognitoIdentityCredentials({
    IdentityPoolId: 'us-east-1-foo-bar'
  }),
  region: 'us-east-1'
});


exports.imageupload = (req, res) =>{
  console.log(req.user);
  var unique = uuid.v1();
  buf = new Buffer(req.body.imageBinary.replace(/^data:image\/\w+;base64,/, ""),'base64')
  var data = {
    Bucket: "quo-mobile",
    Key: unique+'.png',
    Body: buf,
    ContentEncoding: 'base64',
    ContentType: 'image/png'
  };
  s3.putObject(data, function(err, data){
    if (err) {
      console.log(err);
      console.log('Error uploading data: ', data);
    } else {

      var post1 = new Post({
        quote_pic:unique+".png",
        _creator: req.user._id
      });
      post1.save();
      req.user.posts.push(post1);
      req.user.save();
      var urlParams = {Bucket: 'quo-mobile', Key: unique+'.png'};
       console.log('succesfully uploaded the image!');
      s3.getSignedUrl('getObject', urlParams, function(err, url){
        console.log('the url of the image is', url);
        res.json({imgurl: url, img_name: unique+'.png'});
      });
    }
  });
}


exports.submission =(req, res) => {
  console.log(req.body);
  User
  .findOne({'_id': req.user.id})
  .populate('posts')
  .exec(function (err, user) {
  if (err) console.log('fail');
    Post.findOne({ quote_pic: req.body.img_name}, function (err, doc){
      doc.captions= req.body.postContent.caption;
      doc.author=req.body.postContent.author;
      doc.title= req.body.postContent.title;
      doc.published=true;
      doc.save();
      console.log(doc)
      res.send('success');
   });
 })

}

exports.getAllFeeds = (req, res) => {
  var postFollowButton =[];
  Post
  .find({'published':true})
  .populate('_creator')
  .sort({'createdAt':-1})
  .exec(function (err, posts) {
    User.findById(req.user.id, function(err, user){
       console.log("User.findById");
       console.log(user);
       console.log("posts");
       console.log(posts)
       for(var i = 0; i<posts.length;i++){
          var author = posts[i]._creator._id;
          if( user.following.indexOf(author) != -1){
            console.log('following');
            postFollowButton.push('Unfollow');
          }else{
            postFollowButton.push('Follow');
          }
       }
       res.json({posts: posts, followInfo: postFollowButton});
    });
  });
}

exports.getOnePost= (req, res) => {
 Post
 .find({'quote_pic':req.params.img})
 .populate('_creator')
 .exec(function (err, entry) {

  // Post.findOne({'quote_pic':req.params.img}, function(err, doc){
  //   var isInbookmark = doc.bookmarked.some(function (user) {
  //     return user.equals(req.user._id);
  //   })
  //   User.findOne({'_id':req.user.id}, function(err, doc){
  //     console.log(doc);
  //      var isInArray = doc.following.some(function(user) {
  //       console.log(req.params.creator)
  //       return user.equals(req.params.creator);
  //   });
  //   console.log(isInArray);
  //   console.log(isInbookmark);
  //res.send({post: entry, bookmark: isInbookmark, following:isInArray, requser:req.user._id});
  res.json({post: entry});
  })

}



exports.getReqUserPosts = (req, res) => {
  console.log(req.user);
  var arraypost= req.user.posts;
  var num_p=arraypost.length;
  var following=req.user.following;
  var num_f=following.length;
  var followers= req.user.followers;
  var num_ff=followers.length;

  Post
    .find({'_creator': req.user._id})
    .sort({'createdAt':-1})
    .exec(function (err, posts) {
    res.json({
      userInfo: { pic: req.user.profile.picture, name: req.user.profile.name},posts: posts , postno: num_p , subscribe: num_f , followers: num_ff});
    })
};

exports.deletePost = (req, res) => {

  var quoteFilename=req.params.name;
  console.log(quoteFilename)
  Post
  .findOne({'quote_pic': quoteFilename })
  .exec(function (err, post){
    var objid=post._id;
    User.update({ _id: req.user.id }, {$pullAll: {posts: [objid ]}}).exec(function(err,data){
      post.remove();
      res.send('success');
    });
  });
};