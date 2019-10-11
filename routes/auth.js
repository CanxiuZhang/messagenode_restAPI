const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const User = require('../models/user');
const authController = require('../controllers/auth');
const isAuth = require('../middleware/is-auth');

router.put('/signup', [
  body('email').isEmail()
    .withMessage('Email is not valid.')
    .custom((value, { req }) => {
      return User.findOne({ email: value })
        .then(userDoc => {
          if (userDoc) {
            return Promise.reject('Email is already exist.');
          }
        });
    })
    .normalizeEmail(),
  body('name').trim().not().isEmpty(),
  body('password').trim().isLength({ min: 5 })
], authController.signUp);

router.post('/login', authController.login);

router.get('/status', isAuth, authController.getStatus);

router.patch('/status', [
  body('status')
    .isEmpty()
    .withMessage('Status is empty.')
], isAuth, authController.updateStatus);

module.exports = router;