// The web app: sign-in, the card cycle, and window.cards for the frames.
const el = (id) => document.getElementById(id);
const USER_KEY = 'vocapeek:user';
const FIRST_CARD_SEC = 1;
const AFTER_SETUP_SEC = 2;
const HIDDEN_RETRY_SEC = 5;

let registering = false;
let stopApp = null;

async function request(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (res.ok) return data;
  throw Object.assign(new Error(data.error || 'Ошибка'), { status: res.status });
}

function rememberedUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
}

function showAuth() {
  el('app').hidden = true;
  el('auth').hidden = false;
}

function startApp(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  el('auth').hidden = true;
  el('app').hidden = false;
  el('who').textContent = user.email;

  const store = createLocalStore(user.id);
  const session = createSession({
    read: store.read,
    write: store.write,
    fetchDict: async (lang) => (await fetch(`dicts/${lang}.json`)).json(),
  });
  const listeners = [];
  const notify = () => listeners.forEach((fn) => fn());
  const sync = createSync({
    session,
    api: request,
    onChanged: () => { notify(); updatePause(); },
    onStatus: (status) => {
      if (status === 'auth') return signedOut();
      el('sync').textContent = status;
      return undefined;
    },
  });

  let onShowCard = null;
  let cardVisible = false;
  let timer = null;

  function schedule(sec) {
    clearTimeout(timer);
    if (sec !== null) timer = setTimeout(showNext, sec * 1000);
  }

  // A card in a background tab would be shown to nobody.
  async function showNext(manual = false) {
    if (cardVisible) return;
    if (!manual && document.visibilityState !== 'visible') {
      schedule(HIDDEN_RETRY_SEC);
      return;
    }
    cardVisible = true;
    const { payload } = await session.drawCard(manual).catch(() => ({ payload: null }));
    if (!payload) {
      cardVisible = false;
      return;
    }
    el('cardFrame').hidden = false;
    onShowCard(payload);
  }

  async function onCardDone() {
    el('cardFrame').hidden = true;
    cardVisible = false;
    sync.soon();
    const { settings } = await session.readState();
    if (!settings.paused) schedule(settings.intervalSec);
  }

  async function updatePause() {
    const { settings } = await session.readState();
    el('pause').textContent = settings.paused ? 'Продолжить' : 'Пауза';
    el('showNow').disabled = !settings.onboarded;
  }

  window.cards = {
    appVersion: async () => null,
    onShow: (fn) => { onShowCard = fn; },
    done: onCardDone,
    learned: async (lemma, lang) => {
      await session.learned(lemma, lang);
      notify();
      sync.soon();
    },
    getState: session.getState,
    saveSettings: async (patch) => {
      const firstRun = await session.saveSettings(patch);
      await updatePause();
      sync.soon();
      if (!cardVisible) {
        const { settings } = await session.readState();
        schedule(settings.paused ? null : firstRun ? AFTER_SETUP_SEC : settings.intervalSec);
      }
      return session.getState();
    },
    unlearn: async (lemma) => {
      await session.unlearn(lemma);
      sync.soon();
      return session.getState();
    },
    onStateChanged: (fn) => { listeners.push(fn); },
  };

  el('cardFrame').src = 'card.html';
  el('settingsFrame').src = 'settings.html';

  async function togglePause() {
    const settings = await session.togglePause();
    await updatePause();
    notify();
    sync.soon();
    schedule(settings.paused ? null : AFTER_SETUP_SEC);
  }
  const showNow = () => showNext(true);
  el('pause').onclick = togglePause;
  el('showNow').onclick = showNow;

  async function logout() {
    await sync.run();
    await request('POST', '/api/logout').catch(() => {});
    store.clear();
    signedOut();
  }
  el('logout').onclick = logout;

  stopApp = () => {
    clearTimeout(timer);
    sync.stop();
    el('cardFrame').hidden = true;
    el('cardFrame').removeAttribute('src');
    el('settingsFrame').removeAttribute('src');
  };

  el('cardFrame').addEventListener('load', async () => {
    await sync.run();
    await updatePause();
    notify();
    const { settings } = await session.readState();
    if (settings.onboarded && !settings.paused) schedule(FIRST_CARD_SEC);
  }, { once: true });
}

function signedOut() {
  if (stopApp) stopApp();
  stopApp = null;
  localStorage.removeItem(USER_KEY);
  showAuth();
}

function setAuthMode() {
  el('authSubmit').textContent = registering ? 'Создать аккаунт' : 'Войти';
  el('authSwitch').textContent = registering ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться';
  el('password').autocomplete = registering ? 'new-password' : 'current-password';
  el('authError').textContent = '';
}

el('authSwitch').onclick = () => {
  registering = !registering;
  setAuthMode();
};

el('authForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  el('authError').textContent = '';
  try {
    await request('POST', registering ? '/api/register' : '/api/login', { email: el('email').value, password: el('password').value });
    el('password').value = '';
    startApp(await request('GET', '/api/me'));
  } catch (err) {
    el('authError').textContent = err.status ? err.message : 'Нет связи с сервером';
  }
});

async function boot() {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
  try {
    startApp(await request('GET', '/api/me'));
  } catch (err) {
    const user = rememberedUser();
    if (err.status === undefined && user) startApp(user);
    else showAuth();
  }
}

boot();
