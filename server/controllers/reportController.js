const pool = require('../db');
const { SLOTS, todayString, isRealDate } = require('../services/readingValidation');
const { getRanges } = require('../services/reportRanges');

// Highest, lowest, average (1 decimal) and count for one date range
async function statsFor(userId, from, to) {
  const result = await pool.query(
    `SELECT MAX(value) AS highest, MIN(value) AS lowest,
            ROUND(AVG(value), 1) AS average, COUNT(*)::int AS count
     FROM readings
     WHERE user_id = $1 AND reading_date BETWEEN $2 AND $3`,
    [userId, from, to]
  );
  const row = result.rows[0];
  if (row.count === 0) return { count: 0, highest: null, lowest: null, average: null };
  return {
    count: row.count,
    highest: row.highest,
    lowest: row.lowest,
    average: Number(row.average),
  };
}

// Returns an error message for a bad report date, or null
function dateError(date) {
  if (!isRealDate(date)) return 'Please choose a valid date.';
  if (date > todayString()) return 'Date cannot be in the future.';
  return null;
}

// The three reports for one user and one date
async function buildReport(userId, date) {
  const ranges = getRanges(date);

  const [daily, monthToDate, previousMonth, dayReadings] = await Promise.all([
    statsFor(userId, ranges.daily.from, ranges.daily.to),
    statsFor(userId, ranges.monthToDate.from, ranges.monthToDate.to),
    statsFor(userId, ranges.previousMonth.from, ranges.previousMonth.to),
    pool.query(
      `SELECT id, slot, value FROM readings
       WHERE user_id = $1 AND reading_date = $2
       ORDER BY CASE slot
         WHEN 'morning' THEN 1 WHEN 'after_breakfast' THEN 2
         WHEN 'after_lunch' THEN 3 ELSE 4 END`,
      [userId, date]
    ),
  ]);

  return {
    date,
    daily: {
      ...ranges.daily,
      ...daily,
      readings: dayReadings.rows.map((r) => ({ ...r, slotLabel: SLOTS[r.slot] })),
    },
    monthToDate: { ...ranges.monthToDate, ...monthToDate },
    previousMonth: { ...ranges.previousMonth, ...previousMonth },
  };
}

// GET /reports?date=YYYY-MM-DD   (date defaults to today)
async function getReports(req, res) {
  try {
    const date = req.query.date || todayString();
    const error = dateError(date);
    if (error) return res.status(400).json({ error });

    res.json(await buildReport(req.userId, date));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}

// GET /reports/month?date=YYYY-MM-DD
// Readings from the 1st of the month up to the date, for the chart
async function getMonthReadings(req, res) {
  try {
    const date = req.query.date || todayString();
    const error = dateError(date);
    if (error) return res.status(400).json({ error });

    const { monthToDate } = getRanges(date);
    const result = await pool.query(
      `SELECT to_char(reading_date, 'YYYY-MM-DD') AS date, slot, value
       FROM readings
       WHERE user_id = $1 AND reading_date BETWEEN $2 AND $3
       ORDER BY reading_date, id`,
      [req.userId, monthToDate.from, monthToDate.to]
    );
    res.json({ from: monthToDate.from, to: monthToDate.to, readings: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}

module.exports = { getReports, getMonthReadings, buildReport, dateError };