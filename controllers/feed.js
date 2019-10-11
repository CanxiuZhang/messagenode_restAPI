const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator');
const Post = require('../models/post');
const User = require('../models/user');

exports.getPosts = (req, res, next) => {
  const currentPage = req.query.page || 1
  const perPage = 2
  let totalItems;
  Post.find().countDocuments()
    .then(count => {
      totalItems = count
      return Post.find()
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
    })
    .then(posts => {
      return res.status(200).json({
        message: 'Fetch posts successfully.',
        posts: posts,
        totalItems: totalItems
      })
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    })
}

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed. Entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }
  if (!req.file) {
    const error = new Error('No image is provided.');
    error.statusCode = 422;
    throw (error);
  }

  const imageUrl = req.file.path;
  const title = req.body.title;
  const content = req.body.content;

  // create a post in db
  const post = new Post({
    title: title,
    content: content,
    creator: req.userId,
    imageUrl: imageUrl
  });

  let creator;
  post.save()
    .then(result => {
      return User.findById(req.userId);
    })
    .then(user => {
      creator = user;
      creator.posts.push(post);
      return creator.save();
    })
    .then(result => {
      res.status(201).json({
        message: 'Create post successfully!',
        post: post,
        creator: {_id: creator._id, name: creator.name}
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    })
}

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;

  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error('Post not found.');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({
        message: 'Fetch post successfully.',
        post: post
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    })
}

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error('Post not found.');
        error.statusCode = 404;
        throw error;
      }
      if(post.creator != req.userId) {
        const error = new Error('Not Authorized.')
        error.statusCode = 403;
        throw error;
      }
      // check logged in user
      clearImage(post.imageUrl);
      return Post.findByIdAndRemove(postId);
    })
    .then(result => {
      return User.findById(req.userId)
    })
    .then(user => {
      user.posts.pull(postId);
      return user.save();
    })
    .then(result => {
      res.status(200).json({ message: 'Post deleted.' });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    })
}

const clearImage = filePath => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, err => console.log(err));
}