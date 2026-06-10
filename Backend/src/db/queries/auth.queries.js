const db = require('../../config/db');

const findUserByEmail = (email) =>
  db.query('SELECT * FROM users WHERE email = $1', [email]);

const findUserById = (id) =>
  db.query('SELECT id, email, role, created_at FROM users WHERE id = $1', [id]);

const createUser = (email, password_hash, role) =>
  db.query(
    'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role, created_at',
    [email, password_hash, role]
  );

module.exports = { findUserByEmail, findUserById, createUser };