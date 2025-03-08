const pool = require('../modules/pool');

const getUsers = async () => {
  const { rows } = await pool.query('SELECT * FROM users');
  return rows;
};

const getAllEmails = async () => {
  const { rows } = await pool.query('SELECT email FROM users');
  const emailList = rows.map((email) => email.email);
  return emailList;
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

const updateMembership = async (email) => {
  const { rows } = await pool.query(
    `UPDATE users SET membership_status = 't' WHERE email = $1 RETURNING *`,
    [email]
  );
  return rows;
};

const getUserById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return rows;
};
const getUserByEmail = async (email) => {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [
    email,
  ]);
  return rows;
};

const createNewMessage = async (message) => {
  const { rows } = await pool.query(
    'INSERT INTO messages (user_id, title, message) VALUES ($1, $2, $3) RETURNING *',
    [message.user_id, message.title, message.message]
  );
  return rows;
};
module.exports = {
  getUsers,
  getAllEmails,
  getUsersAndMessages,
  createUser,
  updateMembership,
  getUserById,
  getUserByEmail,
  createNewMessage,
};
