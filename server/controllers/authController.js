const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { validateRegistration } = require('../services/authValidation');

function makeToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// POST /auth/register
async function register(req, res) {
  try {
    const error = validateRegistration(req.body);
    if (error) return res.status(400).json({ error });

    const { name, email, password } = req.body;
    const cleanEmail = email.trim().toLowerCase();

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [cleanEmail]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'This email is already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name.trim(), cleanEmail, passwordHash]
    );

    const user = result.rows[0];
    res.status(201).json({ token: makeToken(user.id), user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}

// POST /auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter your email and password.' });
    }

    const result = await pool.query(
      'SELECT id, name, email, password_hash FROM users WHERE email = $1',
      [email.trim().toLowerCase()]
    );
    const user = result.rows[0];

    const ok = user && (await bcrypt.compare(password, user.password_hash));
    if (!ok) return res.status(401).json({ error: 'Invalid email or password.' });

    res.json({
      token: makeToken(user.id),
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}

// GET /auth/me
async function me(req, res) {
  try {
    const result = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [req.userId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found.' });
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}

module.exports = { register, login, me };