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
      console.log('email list:', email, 'value:', value);

      console.log(email.includes(value));

      if (!email.includes(value)) {
        console.log('Email already in use', 'throwing error');

        throw new Error('Email already in use.');
      } else {
        console.log('Email not in use');
        return true;
      }
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
  body('club_id')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Club ID must be specified.')
    .isAlphanumeric()
    .withMessage('Club ID has non-alphanumeric characters - not allowed.')
    .escape()
    .custom((value, { req }) => {
      return value === process.env.JOIN_CLUB_SECRET_CODE;
    })
    .withMessage('Incorrect Club ID'),
];

const getHomePage = async (req, res, next) => {
  try {
    const messages = await db.getUsersAndMessages();
    // console.log(messages);

    res.render('../views/index', {
      title: 'Members Only Chat',
      description: 'Welcome to Members Only',
      messages: messages,
    });
    next();
  } catch (err) {}
};

const signUpPost = [
  validateUser,
  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(errors.array());
      const messages = await db.getUsersAndMessages();

      return res.status(400).render('../views/index', {
        title: 'Members Only Chat',
        description: 'Welcome to Members Only',
        messages: messages,
        error: errors.array(),
      });
    } else {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const user = {
        username: req.body.email.split('@')[0],
        email: req.body.email,
        password: hashedPassword,
        fullname: `${req.body.first_name} ${req.body.last_name}`,
      };

      // Handle successful sign-up logic here (e.g., save to database)
      db.createUser(user);
      console.log('User created: ', user);

      res.redirect('/'); // Redirect only if it's a form submission
    }
  },
];

async function joinClubGet(req, res, next) {
  try {
    res.render('../views/join-club', {
      title: 'Members Only Join Club',
      description: 'Please enter the secret code to join the club',
    });
    next();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

const joinClubPost = [
  validateJoinClubId,
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.status(400).render('../views/join-club', {
        title: 'Members Only Join Club',
        description: 'Please enter the secret code to join the club',
        error: errors.array(),
      });
    } else {
      console.log('Joined the club');
      res.redirect('/');
    }
  },
];

module.exports = {
  getHomePage,
  signUpPost,
  joinClubGet,
  joinClubPost,
};
