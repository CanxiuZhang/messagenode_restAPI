exports.getPosts = (req, res, next) => {
  res.status(200).json({
    posts: [{
      title: 'my first post',
      content: 'This is my first post'
    }]
  });
}

exports.createPost = (req, res, next) => {
  const title = req.body.title;
  const content = req.body.content;

  // create a post in db

  res.status(201).json({
    message: 'Create post successfully!',
    post: {
      id: new Date().toISOString(),
      title: title,
      content: content
    }
  });
}