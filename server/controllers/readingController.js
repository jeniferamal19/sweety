const pool = require('../db');
const { SLOTS, validateReading, isRealDate } = require('../services/readingValidation');

const COLUMNS = `id, to_char(reading_date, 'YYYY-MM-DD') AS date, slot, value`;

// Checks the two rules that need the database.
// excludeId lets an edit ignore the reading being edited.
async function checkDayRules(userId, date, slot, excludeId = 0) {
  const count = await pool.query(
    'SELECT COUNT(*)::int AS n FROM readings WHERE user_id = $1 AND reading_date = $2 AND id <> $3',
    [userId, date, excludeId]
  );
  if (count.rows[0].n >= 4) return 'You can add only 4 readings per day.';

  const taken = await pool.query(
    'SELECT 1 FROM readings WHERE user_id = $1 AND reading_date = $2 AND slot = $3 AND id <> $4',
    [userId, date, slot, excludeId]
  );
  if (taken.rows.length > 0) {
    const article = slot === 'morning' ? 'a' : 'an';
    return `You already have ${article} ${SLOTS[slot]} reading for this date.`;
  }
  return null;
}

function parseId(req) {
  const id = Number(req.params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// GET /readings  (optional ?date=YYYY-MM-DD)
async function list(req, res) {
  try {
    if (req.query.date && !isRealDate(req.query.date)) {
      return res.status(400).json({ error: 'Please choose a valid date.' });
    }

    const params = [req.userId];
    let where = 'user_id = $1';
    if (req.query.date) {
      params.push(req.query.date);
      where += ' AND reading_date = $2';
    }
    const result = await pool.query(
      `SELECT ${COLUMNS} FROM readings WHERE ${where} ORDER BY reading_date DESC, id`,
      params
    );
    res.json({ readings: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}

// POST /readings
async function create(req, res) {
  try {
    const { date, slot, value } = req.body;
    const error = validateReading({ date, slot, value });
    if (error) return res.status(400).json({ error });

    const conflict = await checkDayRules(req.userId, date, slot);
    if (conflict) return res.status(409).json({ error: conflict });

    const result = await pool.query(
      `INSERT INTO readings (user_id, reading_date, slot, value)
       VALUES ($1, $2, $3, $4) RETURNING ${COLUMNS}`,
      [req.userId, date, slot, Number(value)]
    );
    res.status(201).json({ reading: result.rows[0] });
  } catch (err) {
    // Two requests at the same moment: the database's UNIQUE rule is the safety net
    if (err.code === '23505') {
      return res.status(409).json({ error: 'You already have a reading for that slot on this date.' });
    }
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}

// PUT /readings/:id
async function update(req, res) {
  try {
    const id = parseId(req);
    if (!id) return res.status(404).json({ error: 'Reading not found.' });

    const { date, slot, value } = req.body;
    const error = validateReading({ date, slot, value });
    if (error) return res.status(400).json({ error });

    const own = await pool.query('SELECT id FROM readings WHERE id = $1 AND user_id = $2', [id, req.userId]);
    if (own.rows.length === 0) return res.status(404).json({ error: 'Reading not found.' });

    const conflict = await checkDayRules(req.userId, date, slot, id);
    if (conflict) return res.status(409).json({ error: conflict });

    const result = await pool.query(
      `UPDATE readings SET reading_date = $1, slot = $2, value = $3
       WHERE id = $4 AND user_id = $5 RETURNING ${COLUMNS}`,
      [date, slot, Number(value), id, req.userId]
    );
    res.json({ reading: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'You already have a reading for that slot on this date.' });
    }
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}

// DELETE /readings/:id
async function remove(req, res) {
  try {
    const id = parseId(req);
    if (!id) return res.status(404).json({ error: 'Reading not found.' });

    const result = await pool.query('DELETE FROM readings WHERE id = $1 AND user_id = $2', [id, req.userId]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Reading not found.' });
    res.json({ message: 'Reading deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}

module.exports = { list, create, update, remove };