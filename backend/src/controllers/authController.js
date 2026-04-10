const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

async function login(req, res) {
  try {
    const { username, password } = req.body;

const [rows] = await pool.execute(
  'SELECT id, username, password_hash, role, full_name, is_active FROM users WHERE username = ?',
  [username]
);

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = rows[0];

    if (user.is_active === 0) {
      return res.status(401).json({ success: false, message: 'Account deactivated' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, name: user.full_name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return res.status(200).json({
      success: true,
      token,
      user: { id: user.id, username: user.username, role: user.role, name: user.full_name }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function logout(req, res) {
  return res.status(200).json({ success: true, message: 'Logged out' });
}

module.exports = { login, logout };
