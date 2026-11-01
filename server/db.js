const { Pool } = require('pg');

function createPool() {
  const { POSTGRES_HOST, POSTGRES_PORT, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB } = process.env;
  return new Pool({
    host: POSTGRES_HOST || 'vocapeek-postgres',
    port: Number(POSTGRES_PORT || 5432),
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    database: POSTGRES_DB,
  });
}

module.exports = { createPool };
