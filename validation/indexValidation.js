const db = require('../modules/queries');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const validateUser = [
  body('first_name')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Name must be specified.')
    .isAlphanumeric()
    .withMessage('Name has non-alphanumeric characters - not allowed.')
    .escape(),
  body('last_name')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Name must be specified.')
    .isAlphanumeric()
    .withMessage('Name has non-alphanumeric characters - not allowed.')
    .escape(),
  body('email')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Email must be specified.')
    .isEmail()
    .withMessage('Email must be a valid address.')
    .normalizeEmail()
    .custom(async (value, { req }) => {
      const email = await db.getAllEmails();
      //   console.log('email list:', email, 'value:', value);
      //   console.log(email.includes(value));
      if (email.includes(value)) {
        // console.log('Email already in use', 'throwing error');
        throw new Error('Email already in use.');
      }
      //   console.log('Email not in use');
    })
    .escape(),
  body('password')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Password must be specified.')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long.')
    .escape(),
  body('confirm-password')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Password must be specified.')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long.')
    .escape()
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .withMessage('Passwords do not match'),
];

const validateJoinClubId = [
  body('club_secret_code')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Club ID must be specified.')
    .isAlphanumeric()
    .withMessage('Club ID has non-alphanumeric characters - not allowed.')
    .escape()
    .custom((value, { req }) => {
      //   console.log('entered secret code:', value);
      return value === process.env.JOIN_CLUB_SECRET_CODE;
    })
    .withMessage('Incorrect Club ID'),
  body('email')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Email must be specified.')
    .isEmail()
    .withMessage('Email must be a valid address.')
    .normalizeEmail()
    .escape()
    .custom(async (value, { req }) => {
      const email = await db.getAllEmails();
      //   console.log('email list:', email, 'entered email value:', value);
      const isEmailInDb = await email.includes(value);
      //   console.log('isEmailInDb:', isEmailInDb);
      if (!isEmailInDb) {
        throw new Error('email not found, sign up first');
      }
      //   console.log('Email found');
    }),
  body('password')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Password must be specified.')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long.')
    .escape()
    .custom(async (value, { req }) => {
      // console.log('entered password:', value, 'email:', req.body.email);
      const user = await db.getUserByEmail(req.body.email);
      // console.log('user:', user);
      // console.log(await bcrypt.compare(value, user[0].password));
      const match = await bcrypt.compare(value, user[0].password);
      if (!match) {
        throw new Error('Incorrect Password');
      } else {
        return true;
      }
    }),
];

const validateLogIn = [
  body('login_email')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Email must be specified.')
    .isEmail()
    .withMessage('Email must be a valid address.')
    .normalizeEmail()
    .escape(),
  // .custom(async (value, { req }) => {
  //   const email = await db.getAllEmails();
  //   //   console.log('email list:', email, 'entered email value:', value);
  //   const isEmailInDb = await email.includes(value);
  //   //   console.log('isEmailInDb:', isEmailInDb);
  //   if (!isEmailInDb) {
  //     throw new Error('email not found, sign up first');
  //   }
  //   //   console.log('Email found');
  // })
  body('login_password')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Password must be specified.')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long.')
    .escape(),
  // .custom(async (value, { req }) => {
  //   // console.log('entered password:', value, 'email:', req.body.email);
  //   const user = await db.getUserByEmail(req.body.login_email);
  //   // console.log('user:', user);
  //   // console.log(await bcrypt.compare(value, user[0].password));
  //   const match = await bcrypt.compare(value, user[0].password);
  //   if (!match) {
  //     throw new Error('Incorrect Password');
  //   } else {
  //     return true;
  //   }
  // }),
];

const validateNewMessage = [
  body('new_message')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Message must be specified.')
    .escape(),
];
module.exports = {
  validateUser,
  validateJoinClubId,
  validateLogIn,
  validateNewMessage,
};
