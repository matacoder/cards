// window.cards for the desktop shell. The card window owns the deck cycle; Rust only
// provides windows, the timer and the state file. Runs in both windows.
const { invoke } = window.__TAURI__.core;
const { listen, emit } = window.__TAURI__.event;
const IS_CARD = window.__TAURI__.window.getCurrentWindow().label === 'card';

const session = createSession({
  read: () => invoke('state_read'),
  write: (revision, json) => invoke('state_write', { revision, json }),
  fetchDict: async (lang) => (await fetch(`dicts/${lang}.json`)).json(),
});
const { readState, update, openDeck } = session;
let onShowCard = null;
let cardVisible = false;
let smoke = null;

async function showNext(manual) {
  if (cardVisible) return;
  cardVisible = true;
  let payload = null;
  try {
    const drawn = await session.drawCard(manual);
    payload = drawn.payload;
    if (!payload) return;
    await invoke('card_show');
    onShowCard(payload);
    if (smoke) smoke.onCardShown(drawn.state);
  } finally {
    if (!payload) cardVisible = false;
  }
}

async function onCardDone() {
  await invoke('card_hide');
  cardVisible = false;
  if (smoke && smoke.finished()) return;
  const { settings } = await readState();
  if (!settings.paused) await invoke('schedule', { sec: settings.intervalSec });
}

async function togglePause() {
  const settings = await session.togglePause();
  await syncTray(settings);
  await invoke('schedule', { sec: settings.paused ? null : 2 });
  emit('state:changed');
}

const syncTray = (s) => invoke('tray_update', { paused: s.paused, onboarded: s.onboarded });

async function onSettingsSaved({ payload }) {
  const { settings } = await readState();
  await syncTray(settings);
  if (cardVisible) return;
  await invoke('schedule', { sec: settings.paused ? null : payload.firstRun ? 2 : settings.intervalSec });
}

async function startCardWindow() {
  await listen('tick', () => showNext(false));
  await listen('tray:show', () => showNext(true));
  await listen('tray:pause', togglePause);
  await listen('settings:saved', onSettingsSaved);
  if (await invoke('smoke_active')) await startSmoke();
  const state = await readState();
  await syncTray(state.settings);
  if (!state.settings.onboarded || state.settings.paused) await invoke('open_settings');
  else await invoke('schedule', { sec: 1 });
}

// Smoke test: two full cycles, so the timer is proven to fire while the window is hidden.
async function startSmoke() {
  await update((state) => {
    Object.assign(state.settings, { onboarded: true, paused: false, wordSec: 3, translationSec: 3, intervalSec: 5 });
  });
  const report = { cardsShown: 0, version: await window.__TAURI__.app.getVersion() };
  smoke = {
    finished: () => report.cardsShown >= 2,
    onCardShown(current) {
      report.cardsShown += 1;
      if (report.cardsShown > 1) return setTimeout(() => invoke('smoke_report', { json: JSON.stringify(report) }), 7000);
      return setTimeout(async () => {
        const text = (id) => document.getElementById(id).textContent;
        report.dom = { word: text('word'), translation: text('translation'), className: document.getElementById('card').className, version: text('version') };
        report.voices = speechSynthesis.getVoices().map((v) => v.lang);
        const { dict, prog, s } = await openDeck(current);
        report.stats = deck.stats(dict, prog, s.level);
      }, 4500);
    },
  };
}

window.cards = {
  appVersion: () => window.__TAURI__.app.getVersion(),
  onShow: (fn) => { onShowCard = fn; },
  done: onCardDone,
  learned: async (lemma, lang) => {
    await session.learned(lemma, lang);
    emit('state:changed');
  },
  getState: session.getState,
  saveSettings: async (patch) => {
    const firstRun = await session.saveSettings(patch);
    await emit('settings:saved', { firstRun });
    return session.getState();
  },
  unlearn: async (lemma) => {
    await session.unlearn(lemma);
    return session.getState();
  },
  onStateChanged: (fn) => listen('state:changed', fn),
};

if (IS_CARD) window.addEventListener('DOMContentLoaded', startCardWindow);
