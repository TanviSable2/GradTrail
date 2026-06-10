const authService = require('../services/auth.service');
const { validateRequired, isValidEmail } = require('../utils/validateFields');

const signup = async (req, res, next) => {
  try {
    const { email, password, role = 'student' } = req.body;

    const missing = validateRequired(req.body, ['email', 'password']);
    if (missing) return res.status(400).json({ error: missing });

    if (!isValidEmail(email)) return res.status(400).json({ error: 'Invalid email format.' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    if (!['student', 'admin'].includes(role)) return res.status(400).json({ error: 'role must be student or admin.' });

    const data = await authService.signup({ email, password, role });
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const missing = validateRequired(req.body, ['email', 'password']);
    if (missing) return res.status(400).json({ error: missing });

    const data = await authService.login(req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
};

module.exports = { signup, login, getMe };