const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.get('Authorization');
  let decodedToken;
  if(!authHeader) {
    error = new Error('Not authenticated.');
    error.statusCode = 401;
    throw(error);
  }
  const token = authHeader.split(' ')[1] // req.get(): get header value
  try {
    decodedToken = jwt.verify(token, 'secret');
  } catch (err) {
    err.statusCode = 500;
    throw(err);
  }
  if(!decodedToken) {
    error = new Error('Not authenticated.');
    error.statusCode = 401;
    throw(error);
  }
  req.userId = decodedToken.userId;
  next();
}