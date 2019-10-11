const { validationResult } = require('express-validator');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.signUp = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation Failed.');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  bcrypt.hash(password, 12)
    .then(hashedPw => {
      const user = new User({
        email: email,
        name: name,
        password: hashedPw
      });
      return user.save();
    })
    .then(result => {
      res.status(201).json({ message: 'User created', userId: result._id });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    })
}

exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;
  User.findOne({ email: email})
    .then(user => {
      if (!user) {
        const error = new Error('User is not exist.');
        error.statusCode = 401;
        throw error;
      }
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then(isEqual => {
      if (!isEqual) {
        const error = new Error('Password is incorrect.');
        error.statusCode = 401;
        throw error;
      }
      const token = jwt.sign({
        email: loadedUser.email,
        userId: loadedUser._id.toString()
      },
        'secret',
        { expiresIn: '1h' });
      res.status(200).json({token: token, userId: loadedUser._id.toString()});
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
        next(err);
      }
    })
}

exports.getStatus = (req, res, next) => {
  User.findById(req.userId)
  .then(user => {
    if(!user) {
      const error = new Error('User is not found.');
      error.statusCode = 404;
      throw(error);
    }
    res.status(200).json({status: user.status});
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
      next(err);
    }
  })
}

exports.updateStatus = (req, res, next) => {
  const newStatus = req.body.status;
  User.findById(req.userId)
  .then(user => {
    if(!user) {
      const error = new Error('User is not found.');
      error.statusCode = 404;
      throw(error);
    }
    user.status = newStatus;
    return user.save();
  })
  .then(result => {
    res.status(201).json({message: 'User status updated'});
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
      next(err);
    }
  })
}