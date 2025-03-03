const { Router } = require('express');
const indexRouter = Router();
const indexController = require('../controllers/indexController');

indexRouter.get('/', indexController.getHomePage);

indexRouter.post('/sign-up', indexController.signUpPost);

module.exports = indexRouter;
