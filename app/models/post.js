const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = require('../models/post');

const postSchema = new mongoose.Schema({

  captions:  { type: String, default: '' },
  quote_pic: '',
  author : { type: String, default: '' },
  title:  { type: String, default: '' },
  tags:  [{ type: String, default: '' }],
  _creator: { type: Schema.ObjectId, ref: 'User' },
  bookmarked : [{ type: Schema.ObjectId, ref: 'User' }],
  published: false
}, { timestamps: true });


const Post = mongoose.model('Post', postSchema);

module.exports = Post;
