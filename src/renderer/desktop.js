// window.cards for the desktop shell. The card window owns the deck cycle; Rust only
// provides windows, the timer and the state file. Runs in both windows.
const { invoke } = window.__TAURI__.core;
const { listen, emit } = window.__TAURI__.event;
const IS_CARD = window.__TAURI__.window.getCurrentWindow().label === 'card';

const DEFAULT_SETTINGS = {
  onboarded: false, learnLang: 'es', nativeLang: 'ru', level: 1, setSize: 6,
  wordSec: 3, translationSec: 3, intervalSec: 60, paused: false,
};
const dicts = {};
let onShowCard = null;
let cardVisible = false;
let smoke = null;

async function loadDict(lang) {
  if (!dicts[lang]) dicts[lang] = await (await fetch(`dicts/${lang}.json`)).json();
  return dicts[lang];
}

function parseState(json) {
  const raw = JSON.parse(json || '{}');
  return { settings: { ...DEFAULT_SETTINGS, ...raw.settings }, progress: raw.progress || {} };
}

async function readState() {
  const [, json] = await invoke('state_read');
  return parseState(json);
}

// Every change goes through here: if the other window wrote first, the change is redone on fresh data.
async function update(change) {
  for (;;) {
    const [revision, json] = await invoke('state_read');
    const state = parseState(json);
    const result = await change(state);
    if (await invoke('state_write', { revision, json: JSON.stringify(state) })) return result;
  }
}

async function openDeck(state, lang = state.settings.learnLang) {
  const s = state.settings;
  const dict = await loadDict(lang);
  if (!state.progress[lang]) state.progress[lang] = deck.emptyProgress();
  const prog = state.progress[lang];
  deck.refill(dict, prog, s.level, s.setSize);
  return { s, dict, prog };
}

function cardPayload(s, card) {
  if (!card) {
    return { done: true, word: '🎉', translation: 'Уровень пройден — выберите следующий в настройках', wordSec: 0, translationSec: 6 };
  }
  return { ...card, learnLang: s.learnLang, speechLang: deck.SPEECH_LANGS[s.learnLang], wordSec: s.wordSec, translationSec: s.translationSec };
}

async function showNext(manual) {
  if (cardVisible) return;
  cardVisible = true;
  let payload = null;
  let shownState = null;
  try {
    payload = await update(async (state) => {
      if (!state.settings.onboarded || (state.settings.paused && !manual)) return null;
      const { s, dict, prog } = await openDeck(state);
      shownState = state;
      return cardPayload(s, deck.nextCard(dict, prog, s.nativeLang));
    });
    if (!payload) return;
    await invoke('card_show');
    onShowCard(payload);
    if (smoke) smoke.onCardShown(shownState);
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
  const settings = await update((state) => {
    state.settings.paused = !state.settings.paused;
    return state.settings;
  });
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
  // `lang` is the language of the card on screen: settings may have changed since it was shown.
  learned: async (lemma, lang) => {
    await update(async (state) => {
      const { s, dict, prog } = await openDeck(state, lang);
      deck.markLearned(prog, lemma);
      deck.refill(dict, prog, s.level, s.setSize);
    });
    emit('state:changed');
  },
  getState: async () => {
    const state = await readState();
    const { s, dict, prog } = await openDeck(state);
    return deck.viewState(dict, prog, s);
  },
  saveSettings: async (patch) => {
    const firstRun = await update(async (state) => {
      const first = !state.settings.onboarded;
      state.settings = { ...state.settings, ...patch };
      await openDeck(state);
      return first;
    });
    await emit('settings:saved', { firstRun });
    return window.cards.getState();
  },
  unlearn: async (lemma) => {
    await update(async (state) => {
      const { prog } = await openDeck(state);
      deck.unlearn(prog, lemma);
    });
    return window.cards.getState();
  },
  onStateChanged: (fn) => listen('state:changed', fn),
};

if (IS_CARD) window.addEventListener('DOMContentLoaded', startCardWindow);
