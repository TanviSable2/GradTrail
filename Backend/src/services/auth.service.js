const { findUserByEmail, findUserById, createUser } = require('../db/queries/auth.queries');
const { hashPassword, comparePassword } = require('../utils/hashPassword');
const generateToken = require('../utils/generateToken');

const signup = async ({ email, password, role }) => {
  const existing = await findUserByEmail(email);
  if (existing.rows.length > 0) {
    const err = new Error('Email already registered.');
    err.status = 409;
    throw err;
  }

  const password_hash = await hashPassword(password);
  const result = await createUser(email, password_hash, role);
  const user = result.rows[0];
  return { user, token: generateToken(user) };
};

const login = async ({ email, password }) => {
  const result = await findUserByEmail(email);
  const user = result.rows[0];

  if (!user || !(await comparePassword(password, user.password_hash))) {
    const err = new Error('Invalid email or password.');
    err.status = 401;
    throw err;
  }

  const { password_hash, ...safeUser } = user;
  return { user: safeUser, token: generateToken(safeUser) };
};

const getMe = async (id) => {
  const result = await findUserById(id);
  if (!result.rows[0]) {
    const err = new Error('User not found.');
    err.status = 404;
    throw err;
  }
  return result.rows[0];
};

module.exports = { signup, login, getMe };