const { Router } = require('express');
const indexRouter = Router();
const indexController = require('../controllers/indexController');
const newMessageController = require('../controllers/newMessageController');

indexRouter.get('/', indexController.getHomePage);
indexRouter
  .route('/sign-up')
  .get(indexController.signUpGet)
  .post(indexController.signUpPost);
indexRouter
  .route('/join-club')
  .get(indexController.joinClubGet)
  .post(indexController.joinClubPost);
indexRouter
  .route('/log-in')
  .get(indexController.logInGet)
  .post(indexController.logInPost);
indexRouter.get('/log-out', indexController.logOutGet);
indexRouter
  .route('/new-message')
  .get(newMessageController.newMessageGet)
  .post(newMessageController.newMessagePost);
module.exports = indexRouter;
