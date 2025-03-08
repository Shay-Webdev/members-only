const express = require('express');
const app = express();
const db = require('./modules/queries');
const indexRouter = require('./routes/indexRouter');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();
const pgSession = require('connect-pg-simple')(session);
const pool = require('./modules/pool');
const flash = require('connect-flash');

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    store: new pgSession({
      pool: pool,
      tableName: 'session',
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 60 * 60 * 1000,
    },
  })
);
app.use(passport.session());
app.use(flash());

app.use('/', indexRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
