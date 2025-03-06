const { Router } = require('express');
const indexRouter = Router();
const indexController = require('../controllers/indexController');

indexRouter.get('/', indexController.getHomePage);
indexRouter.post('/sign-up', indexController.signUpPost);
indexRouter
  .route('/join-club')
  .get(indexController.joinClubGet)
  .post(indexController.joinClubPost);
indexRouter
  .route('/log-in')
  .get(indexController.logInGet)
  .post(indexController.logInPost);
module.exports = indexRouter;
