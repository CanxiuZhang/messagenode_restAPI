const { validationResult } = require('express-validator');
const Post = require('../models/post');

exports.getPosts = (req, res, next) => {
  res.status(200).json({
    posts: [{
      title: 'my first post',
      creator: {
        name: 'Murray'
      },
      _id: '1',
      createdAt: new Date(),
      image: '/images/murray.jpg',
      content: 'This is my first post'
    }]
  });
}

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed. Entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }

  const title = req.body.title;
  const content = req.body.content;

  // create a post in db
  const post = new Post({
    title: title,
    content: content,
    creator: {name: 'cz'},
    imageUrl: 'images/murray.jpg'
  });

  post.save()
    .then(result => {
      res.status(201).json({
        message: 'Create post successfully!',
        post: result
      });
    })
    .catch(err => {
      if(!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    })
}