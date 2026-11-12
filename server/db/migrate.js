const fs = require('fs');
const path = require('path');
const db = require('./index');

async function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await db.query(sql);
  console.log('Database schema is up to date.');
}

migrate()
  .catch((err) => {
    console.error('Migration failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => db.pool.end());