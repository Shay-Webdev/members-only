const db = require('../modules/queries');
const { body, validationResult } = require('express-validator');

const validateUser = [
  body('first-name')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Name must be specified.')
    .isAlphanumeric()
    .withMessage('Name has non-alphanumeric characters - not allowed.'),
  body('last-name')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Name must be specified.')
    .isAlphanumeric()
    .withMessage('Name has non-alphanumeric characters - not allowed.'),
  body('email')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Email must be specified.')
    .isEmail()
    .withMessage('Email must be a valid address.'),
  body('password')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Password must be specified.')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long.'),
];

const getHomePage = async (req, res, next) => {
  try {
    res.render('../views/index', {
      title: 'Members Only Chat',
      description: 'Welcome to Members Only',
    });
    next();
  } catch (err) {}
};

const signUpPost = [
  validateUser,
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(errors.array());

      return res.status(400).render('../views/index', {
        title: 'Members Only Chat',
        description: 'Welcome to Members Only',
        error: errors.array(),
      });
    } else {
      console.log(req.body);
      // Handle successful sign-up logic here (e.g., save to database)
      return res.redirect('/'); // Redirect only if it's a form submission
    }
  },
];
module.exports = {
  getHomePage,
  signUpPost,
};
