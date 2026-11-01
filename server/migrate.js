// Waits for the database, then applies new files from migrations/ once each, in name order.
const fs = require('fs');
const path = require('path');
const { createPool } = require('./db');

const DIR = path.join(__dirname, 'migrations');
const LOCK_ID = 727001;
const WAIT_ATTEMPTS = 60;

async function waitForDatabase(pool) {
  for (let attempt = 1; ; attempt += 1) {
    try {
      await pool.query('SELECT 1');
      return;
    } catch (err) {
      if (attempt >= WAIT_ATTEMPTS) throw err;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

async function apply(client) {
  await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())');
  const { rows } = await client.query('SELECT name FROM schema_migrations');
  const done = new Set(rows.map((row) => row.name));
  for (const name of fs.readdirSync(DIR).filter((f) => f.endsWith('.sql')).sort()) {
    if (done.has(name)) continue;
    await client.query('BEGIN');
    await client.query(fs.readFileSync(path.join(DIR, name), 'utf8'));
    await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [name]);
    await client.query('COMMIT');
    console.log(`applied ${name}`);
  }
}

async function main() {
  const pool = createPool();
  await waitForDatabase(pool);
  const client = await pool.connect();
  try {
    await client.query('SELECT pg_advisory_lock($1)', [LOCK_ID]);
    await apply(client);
    await client.query('SELECT pg_advisory_unlock($1)', [LOCK_ID]);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
