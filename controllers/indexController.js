const db = require('../modules/queries');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const {
  validateUser,
  validateJoinClubId,
  validateLogIn,
} = require('../validation/indexValidation');

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
      console.log('User joined the club: ', req.body.email);

      db.updateMembership(req.body.email);
      res.redirect('/');
    }
  },
];

const logInGet = (req, res, next) => {
  try {
    res.render('../views/log-in', {
      title: 'Log In',
      description: 'Please enter your email and password to log in',
    });
    next();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const logInPost = [
  validateLogIn,
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.status(400).render('../views/log-in', {
        title: 'Log In',
        description: 'Please enter your email and password to log in',
        error: errors.array(),
      });
    } else {
      console.log('User logged in: ', req.body);
      res.redirect('/');
    }
  },
];
module.exports = {
  getHomePage,
  signUpPost,
  joinClubGet,
  joinClubPost,
  logInGet,
  logInPost,
};
