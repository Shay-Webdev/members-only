const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

// Example: Aiven’s CA (replace with the latest URL from their docs if needed)
// For free tier, this might be the same CA they provide in the console
const AIVEN_CA = fs.readFileSync('./aiven-db/ca.pem').toString(); // Or download manually first

const pool = new Pool({
  connectionString: process.env.DATABASE_URL.replace('?sslmode=require', ''),
  ssl: {
    ca: AIVEN_CA, // Use this instead of process.env.DATABASE_CA for testing
    rejectUnauthorized: true,
  },
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('Connection error:', err.stack);
  } else {
    console.log('Connected successfully');
    release();
  }
});

module.exports = pool;
