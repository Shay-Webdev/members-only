const db = require('../modules/queries');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const {
  validateUser,
  validateJoinClubId,
  validateLogIn,
} = require('../validation/indexValidation');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const flash = require('connect-flash');

passport.use(
  new LocalStrategy(
    { usernameField: 'login_email', passwordField: 'login_password' },
    async (username, password, done) => {
      try {
        console.log(
          `LocalStrategy username: ${username}, password: ${password}`
        );

        const rows = await db.getUserByEmail(username);
        const user = rows[0];
        // console.log(`LocalStrategy rows user: ${user}}`);

        if (!user) {
          return done(null, false, { message: 'Incorrect email' });
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          return done(null, false, { message: 'Incorrect password' });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  console.log(`serializing user: ${user.id}`);

  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    // In indexController.js around line 55
    if (!id) {
      return res.redirect('/login');
    }
    // Rest of your code
    console.log(`deserializing user-id: ${id}, `);
    const rows = await db.getUserById(id);
    if (!rows) {
      return res.redirect('/login');
    }
    // console.log('rows:', rows);

    done(null, rows[0]);
  } catch (err) {
    done(err);
  }
});

const getHomePage = async (req, res, next) => {
  const messages = await db.getUsersAndMessages();
  const filteredMessages = messages.filter(
    (message) => message.message_content
  );
  try {
    // console.log(res.locals.currentUser);
    // console.log(messages);
    // console.log('user in home page: ', req.user);
    res.render('../views/index', {
      title: 'Members Only Chat',
      description: 'Welcome to Members Only',
      messages: filteredMessages,
      user: req.user,
    });
    next();
  } catch (err) {}
};

const signUpGet = async (req, res, next) => {
  try {
    const messages = await db.getUsersAndMessages();
    res.render('../views/sign-up', {
      title: 'Members Only Chat',
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

      return res.status(400).render('../views/sign-up', {
        title: 'Members Only Chat',
        messages: messages,
        error: errors.array(),
      });
    } else {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const is_admin = req.body.is_admin === 'on' ? true : false;
      const user = {
        username: req.body.email.split('@')[0],
        email: req.body.email,
        password: hashedPassword,
        fullname: `${req.body.first_name} ${req.body.last_name}`,
        is_admin: is_admin,
      };

      // Handle successful sign-up logic here (e.g., save to database)
      await db.createUser(user);
      console.log('User created  with req body: ', req.body);

      if (req.body.is_admin === 'on') {
        db.updateMembership(req.body.email);
      }
      console.log('membership updated');
      req.body.is_admin == 'on' ? db.updateAdmin(req.body.email) : null;
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

      auth_error: req.flash('error'),
    });
    next();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const logInPost = [
  validateLogIn,
  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.status(400).render('../views/log-in', {
        title: 'Log In',
        description: 'Please enter your email and password to log in',
        error: errors.array(),
        auth_error: req.flash('error'),
      });
    }
    console.log('User logged in: ', req.user, req.body);
    next();
  },
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/log-in',
    failureFlash: true,
  }),
];

const logOutGet = async (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
};

const deleteMessage = async (req, res, next) => {
  const messages = await db.getUsersAndMessages();
  const filteredMessages = messages.filter(
    (message) => message.message_content
  );
  console.log('req id: ', req.params.id);
  filteredMessages.forEach((message) => {
    console.log(message.message_id);
  });

  const message = filteredMessages.find(
    (message) => message.message_id == req.params.id
  );
  console.log('message: ', message);
  if (!message) {
    return res.status(404).json({ error: 'Message not found' });
  }
  await db.deleteMessage(req.params.id);
  res.redirect('/');
};
module.exports = {
  getHomePage,
  signUpGet,
  signUpPost,
  joinClubGet,
  joinClubPost,
  logInGet,
  logInPost,
  passport,
  logOutGet,
  deleteMessage,
};
