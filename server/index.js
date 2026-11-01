const compression = require('compression');
const express = require('express');
const path = require('path');
const { authRoutes, requireUser } = require('./auth');
const { createPool } = require('./db');

const PORT = Number(process.env.PORT || 3000);
const STATIC_DIR = process.env.STATIC_DIR || path.join(__dirname, '..', 'web-dist');

function stateRoutes(app, pool) {
  const auth = requireUser(pool);

  app.get('/api/me', auth, (req, res) => res.json({ id: String(req.user.id), email: req.user.email }));

  app.get('/api/state', auth, async (req, res) => {
    const { rows } = await pool.query('SELECT revision, state FROM user_states WHERE user_id = $1', [req.user.id]);
    res.json(rows.length ? { revision: Number(rows[0].revision), state: rows[0].state } : { revision: 0, state: null });
  });

  // Saves only on top of the revision the client has seen; otherwise it merges and retries.
  app.put('/api/state', auth, async (req, res) => {
    const { revision, state } = req.body || {};
    if (!Number.isInteger(revision) || typeof state !== 'object' || state === null) {
      return res.status(400).json({ error: 'Bad state' });
    }
    const { rows } = await pool.query(
      `INSERT INTO user_states (user_id, revision, state) VALUES ($1, 1, $3)
       ON CONFLICT (user_id) DO UPDATE SET revision = user_states.revision + 1, state = $3, updated_at = now()
       WHERE user_states.revision = $2
       RETURNING revision`,
      [req.user.id, revision, JSON.stringify(state)],
    );
    if (rows.length) return res.json({ revision: Number(rows[0].revision) });
    return res.status(409).json({ error: 'Conflict' });
  });
}

function createApp(pool) {
  const app = express();
  app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.use(compression());
  app.use(express.json({ limit: '2mb' }));
  app.get('/healthz', async (req, res) => {
    await pool.query('SELECT 1');
    res.json({ ok: true });
  });
  authRoutes(app, pool);
  stateRoutes(app, pool);
  app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));
  app.use(express.static(STATIC_DIR, { setHeaders: (res) => res.setHeader('Cache-Control', 'no-cache') }));
  app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);
    if (err.status >= 400 && err.status < 500) return res.status(err.status).json({ error: 'Bad request' });
    console.error(err);
    return res.status(500).json({ error: 'Ошибка сервера' });
  });
  return app;
}

createApp(createPool()).listen(PORT, () => console.log(`listening on ${PORT}`));
