const db = require('../modules/queries');
const { validateNewMessage } = require('../validation/indexValidation');
const { body, validationResult } = require('express-validator');

const newMessageGet = async (req, res, next) => {
  try {
    console.log(`req user in newMessageGet`, req.user);

    res.render('../views/new-message', {
      title: 'New Message',
      description: 'Create new messages:',
    });
    next();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const newMessagePost = [
  validateNewMessage,
  async (req, res, next) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(400).render('../views/new-message', {
          title: 'New Message',
          description: 'Create new messages:',
          error: errors.array(),
        });
      }
      const newMessage = {
        user_id: req.user.id,
        title: req.body.new_message.split(' ')[0],
        message: req.body.new_message,
      };
      console.log('newMessage: ', newMessage);
      await db.createNewMessage(newMessage);
      res.redirect('/');
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
];

module.exports = { newMessageGet, newMessagePost };
