// Email and password accounts with server-side sessions in an HttpOnly cookie.
const crypto = require('crypto');
const { promisify } = require('util');

const scrypt = promisify(crypto.scrypt);
const KEY_LENGTH = 64;
const SESSION_DAYS = 90;
const COOKIE = 'vocapeek_session';
const MIN_PASSWORD = 8;
const MAX_PASSWORD = 200;
const ATTEMPT_LIMIT = 10;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;

async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const key = await scrypt(password, salt, KEY_LENGTH);
  return `${salt.toString('hex')}:${key.toString('hex')}`;
}

async function verifyPassword(password, stored) {
  const [salt, key] = stored.split(':').map((part) => Buffer.from(part, 'hex'));
  return crypto.timingSafeEqual(key, await scrypt(password, salt, KEY_LENGTH));
}

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

function readCookie(req) {
  const pair = (req.headers.cookie || '').split(';').map((c) => c.trim()).find((c) => c.startsWith(`${COOKIE}=`));
  return pair ? pair.slice(COOKIE.length + 1) : null;
}

function cookieOptions() {
  return { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: SESSION_DAYS * 864e5 };
}

// Per address and email, in memory: enough for one small instance.
function createLimiter() {
  const attempts = new Map();
  return (req, res, next) => {
    const key = `${req.ip}:${req.body?.email}`;
    const now = Date.now();
    const entry = attempts.get(key);
    const fresh = !entry || now - entry.since > ATTEMPT_WINDOW_MS ? { since: now, count: 0 } : entry;
    fresh.count += 1;
    attempts.set(key, fresh);
    if (attempts.size > 10000) attempts.clear();
    if (fresh.count > ATTEMPT_LIMIT) return res.status(429).json({ error: 'Слишком много попыток, подождите 15 минут' });
    return next();
  };
}

function validCredentials(body) {
  const email = String(body?.email || '').trim().toLowerCase();
  const password = String(body?.password || '');
  const ok = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) && email.length <= 254 && password.length >= MIN_PASSWORD && password.length <= MAX_PASSWORD;
  return ok ? { email, password } : null;
}

function authRoutes(app, pool) {
  async function startSession(res, userId) {
    const token = crypto.randomBytes(32).toString('hex');
    await pool.query(
      `INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, now() + make_interval(days => $3))`,
      [hashToken(token), userId, SESSION_DAYS],
    );
    await pool.query('DELETE FROM sessions WHERE expires_at < now()');
    res.cookie(COOKIE, token, cookieOptions());
  }

  const limiter = createLimiter();

  app.post('/api/register', limiter, async (req, res) => {
    const creds = validCredentials(req.body);
    if (!creds) return res.status(400).json({ error: `Нужны настоящий email и пароль от ${MIN_PASSWORD} символов` });
    const hash = await hashPassword(creds.password);
    const { rows } = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING RETURNING id',
      [creds.email, hash],
    );
    if (!rows.length) return res.status(409).json({ error: 'Этот email уже зарегистрирован' });
    await startSession(res, rows[0].id);
    return res.json({ email: creds.email });
  });

  app.post('/api/login', limiter, async (req, res) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '').slice(0, MAX_PASSWORD);
    const { rows } = await pool.query('SELECT id, password_hash FROM users WHERE email = $1', [email]);
    const ok = rows.length > 0 && (await verifyPassword(password, rows[0].password_hash));
    if (!ok) return res.status(401).json({ error: 'Неверный email или пароль' });
    await startSession(res, rows[0].id);
    return res.json({ email });
  });

  app.post('/api/logout', async (req, res) => {
    const token = readCookie(req);
    if (token) await pool.query('DELETE FROM sessions WHERE token_hash = $1', [hashToken(token)]);
    res.clearCookie(COOKIE, { path: '/' });
    res.json({});
  });
}

function requireUser(pool) {
  return async (req, res, next) => {
    const token = readCookie(req);
    const { rows } = token
      ? await pool.query(
        `SELECT u.id, u.email FROM sessions s JOIN users u ON u.id = s.user_id
         WHERE s.token_hash = $1 AND s.expires_at > now()`,
        [hashToken(token)],
      )
      : { rows: [] };
    if (!rows.length) return res.status(401).json({ error: 'Нужно войти' });
    req.user = rows[0];
    return next();
  };
}

module.exports = { authRoutes, requireUser };
