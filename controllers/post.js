
var uuid        = require('node-uuid');
var AWS         = require('aws-sdk');
AWS.config.loadFromPath('./s3_config.json');
var s3Bucket    = new AWS.S3( { params: {Bucket: 'quo-mobile'} } );
const Post = require('../app/models/post');
const User = require('../app/models/user');


exports.imageupload = (req, res) =>{
  console.log(req.user);
  var unique = uuid.v1();
  buf = new Buffer(req.body.imageBinary.replace(/^data:image\/\w+;base64,/, ""),'base64')
  var data = {
    Key: unique+'.png',
    Body: buf,
    ContentEncoding: 'base64',
    ContentType: 'image/png'
  };
  s3Bucket.putObject(data, function(err, data){
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
      s3Bucket.getSignedUrl('getObject', urlParams, function(err, url){
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