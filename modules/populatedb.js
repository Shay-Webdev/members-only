#!/usr/bin/env node
require('dotenv').config();
const fs = require('fs');
const { Client } = require('pg');

const AIVEN_CA = fs.readFileSync('./aiven-db/ca.pem').toString();

const SQL = `
  DROP TABLE IF EXISTS messages CASCADE;
  DROP TABLE IF EXISTS users CASCADE;
  DROP TABLE IF EXISTS session CASCADE;

  CREATE TABLE users (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      username VARCHAR(255),
      membership_status BOOLEAN DEFAULT false,
      password TEXT NOT NULL,
      full_name VARCHAR(255),
      is_admin BOOLEAN DEFAULT false
  );

  CREATE TABLE messages (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      user_id INTEGER,
      title VARCHAR(255),
      message TEXT,
      posted_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- Add session table for connect-pg-simple
  CREATE TABLE session (
      sid VARCHAR NOT NULL COLLATE "default" PRIMARY KEY,
      sess JSON NOT NULL,
      expire TIMESTAMP(6) NOT NULL
  );

  -- Optional index for session expiration (recommended by connect-pg-simple)
  CREATE INDEX session_expire_idx ON session (expire);

  INSERT INTO users (email, username, membership_status, password, full_name, is_admin)
  VALUES
      ('len@example.com', 'len', true, '$2a$10$hashedpassword1', 'Len Admin', true),
      ('tom@example.com', 'tom', true, '$2a$10$hashedpassword2', 'Tom Member', false),
      ('guest@example.com', 'guest', false, '$2a$10$hashedpassword3', 'Guest User', false);

  INSERT INTO messages (user_id, title, message, posted_time)
  VALUES
      ((SELECT id FROM users WHERE username = 'len'), 'Admin Announcement', 'Welcome to the club!', '2025-03-09 10:00:00+00'),
      ((SELECT id FROM users WHERE username = 'tom'), 'Member Post', 'Having a great time here!', '2025-03-09 12:00:00+00'),
      ((SELECT id FROM users WHERE username = 'guest'), 'Guest Question', 'How do I join the club?', '2025-03-09 14:00:00+00');
`;

async function main() {
  console.log('seeding...');
  const connectionString = process.env.DATABASE_URL?.replace(
    '?sslmode=require',
    ''
  );
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set in .env');
  }

  const client = new Client({
    connectionString,
    ssl: {
      ca: AIVEN_CA,
      rejectUnauthorized: true,
    },
  });

  try {
    await client.connect();
    console.log('Connected to:', connectionString.split('@')[1].split('/')[0]);

    const commands = SQL.split(';')
      .map((cmd) => cmd.trim())
      .filter((cmd) => cmd.length > 0);
    for (const command of commands) {
      await client.query(command);
    }

    console.log('done');
  } catch (err) {
    console.error('Error seeding database:', err.message);
  } finally {
    await client.end();
  }
}

main();
