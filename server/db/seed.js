const bcrypt = require('bcrypt');
const db = require('./index');
const { todayString } = require('../services/readingValidation');

const DEMO = { name: 'Demo User', email: 'demo@example.com', password: 'password123' };
const SLOT_NAMES = ['morning', 'after_breakfast', 'after_lunch', 'after_dinner'];
const DAYS = 45;

function daysAgo(today, n) {
  const [y, m, d] = today.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() - n);
  return date.toISOString().slice(0, 10);
}

async function seed() {
  const hash = await bcrypt.hash(DEMO.password, 10);

  // Create the demo user, or reset its password if it already exists
  const userResult = await db.query(
    `INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
     RETURNING id`,
    [DEMO.name, DEMO.email, hash]
  );
  const userId = userResult.rows[0].id;

  // Start fresh so running the seed twice never creates duplicates
  await db.query('DELETE FROM readings WHERE user_id = $1', [userId]);

  const today = todayString();
  let count = 0;

  for (let i = 0; i < DAYS; i++) {
    if (i % 7 === 6) continue; // skip one day a week, like real life
    const date = daysAgo(today, i);
    const slotsToday = 2 + (i % 3); // 2, 3 or 4 readings a day (never more than 4)

    for (let s = 0; s < slotsToday; s++) {
      const value = 90 + ((i * 37 + s * 53) % 90); // values between 90 and 179
      await db.query(
        'INSERT INTO readings (user_id, reading_date, slot, value) VALUES ($1, $2, $3, $4)',
        [userId, date, SLOT_NAMES[s], value]
      );
      count++;
    }
  }

  console.log(`Seeded ${DEMO.email} / ${DEMO.password} with ${count} readings.`);
}

seed()
  .catch((err) => {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => db.pool.end());