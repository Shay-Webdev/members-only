const pool = require('../modules/pool');

const getUsers = async () => {
  const { rows } = await pool.query('SELECT * FROM users');
  return rows;
};

const getAllEmails = async () => {
  const { rows } = await pool.query('SELECT email FROM users');
  return rows;
};
const getUsersAndMessages = async () => {
  const { rows } = await pool.query(
    'SELECT u.id as user_id, u.username as user_name, u.membership_status as membership_status, m.title as message_title, m.id as message_id, m.message as message_content , m.posted_time as message_post_time FROM users u LEFT JOIN messages m ON u.id = m.user_id'
  );
  return rows;
};

const createUser = async (user) => {
  const { rows } = await pool.query(
    'INSERT INTO users (full_name, password, email, username) VALUES ($1, $2, $3, $4) RETURNING *',
    [user.fullname, user.password, user.email, user.username]
  );
  return rows;
};

module.exports = {
  getUsers,
  getAllEmails,
  getUsersAndMessages,
  createUser,
};
