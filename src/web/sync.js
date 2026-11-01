// Local state for one account, and its sync with the server. The app works without a network:
// changes stay in localStorage and are merged, word by word, when the server is reachable.
const SYNC_DELAY_MS = 2000;
const SYNC_EVERY_MS = 5 * 60 * 1000;

function createLocalStore(userId) {
  const stateKey = `vocapeek:state:${userId}`;
  const revisionKey = `vocapeek:revision:${userId}`;
  const get = (key) => {
    try { return localStorage.getItem(key); } catch { return null; }
  };
  return {
    read: async () => [Number(get(revisionKey) || 0), get(stateKey)],
    write: async (revision, json) => {
      if (Number(get(revisionKey) || 0) !== revision) return false;
      localStorage.setItem(stateKey, json);
      localStorage.setItem(revisionKey, String(revision + 1));
      return true;
    },
    clear: () => {
      localStorage.removeItem(stateKey);
      localStorage.removeItem(revisionKey);
    },
  };
}

function createSync({ session, api, onStatus, onChanged }) {
  let timer = null;
  let running = false;
  let again = false;

  // Merges with the server, saves on top of what it saw, and repeats if another device got in first.
  async function pushMerged() {
    for (;;) {
      const { revision, state: remote } = await api('GET', '/api/state');
      const before = JSON.stringify(await session.readState());
      const merged = await session.update((state) => {
        const result = remote ? deck.mergeStates(state, remote) : state;
        Object.assign(state, result);
        return JSON.parse(JSON.stringify(state));
      });
      if (JSON.stringify(merged) !== before) onChanged();
      if (JSON.stringify(merged) === JSON.stringify(remote)) return;
      try {
        await api('PUT', '/api/state', { revision, state: merged });
        return;
      } catch (err) {
        if (err.status !== 409) throw err;
      }
    }
  }

  async function run() {
    if (running) {
      again = true;
      return;
    }
    running = true;
    try {
      await pushMerged();
      onStatus('');
    } catch (err) {
      if (err.status === 401) onStatus('auth');
      else onStatus('Нет связи — прогресс сохранится здесь и синхронизируется позже');
    } finally {
      running = false;
      if (again) {
        again = false;
        run();
      }
    }
  }

  function soon() {
    clearTimeout(timer);
    timer = setTimeout(run, SYNC_DELAY_MS);
  }

  const interval = setInterval(run, SYNC_EVERY_MS);
  window.addEventListener('online', run);
  return {
    run,
    soon,
    stop() {
      clearTimeout(timer);
      clearInterval(interval);
      window.removeEventListener('online', run);
    },
  };
}
