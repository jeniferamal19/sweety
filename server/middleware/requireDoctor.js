const pool = require('../db');

async function requireDoctor(req, res, next) {
  try {
    const result = await pool.query('SELECT role FROM users WHERE id = $1', [req.userId]);
    if (!result.rows[0] || result.rows[0].role !== 'doctor') {
      return res.status(403).json({ error: 'Only doctors can do this.' });
    }
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}

module.exports = requireDoctor;