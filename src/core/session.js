// Reads and changes the app state, on any storage. Used by the desktop shell and the web app.
// `read` returns [revision, json]; `write(revision, json)` returns false if someone wrote first.
const DEFAULT_SETTINGS = {
  onboarded: false, learnLang: 'es', nativeLang: 'ru', level: 1, setSize: 6,
  wordSec: 3, translationSec: 3, intervalSec: 60, paused: false, updatedAt: 0,
};
const sessionDeck = typeof deck !== 'undefined' ? deck : require('./deck');

function parseState(json) {
  const raw = JSON.parse(json || '{}');
  return { settings: { ...DEFAULT_SETTINGS, ...raw.settings }, progress: raw.progress || {} };
}

function cardPayload(s, card) {
  if (!card) {
    return { done: true, word: '🎉', translation: 'Уровень пройден — выберите следующий в настройках', wordSec: 0, translationSec: 6 };
  }
  return { ...card, learnLang: s.learnLang, speechLang: sessionDeck.SPEECH_LANGS[s.learnLang], wordSec: s.wordSec, translationSec: s.translationSec };
}

function createSession({ read, write, fetchDict }) {
  const dicts = {};

  async function loadDict(lang) {
    if (!dicts[lang]) dicts[lang] = await fetchDict(lang);
    return dicts[lang];
  }

  async function readState() {
    const [, json] = await read();
    return parseState(json);
  }

  // Every change goes through here: if someone else wrote first, it is redone on fresh data.
  async function update(change) {
    for (;;) {
      const [revision, json] = await read();
      const state = parseState(json);
      const result = await change(state);
      if (await write(revision, JSON.stringify(state))) return result;
    }
  }

  async function openDeck(state, lang = state.settings.learnLang) {
    const s = state.settings;
    const dict = await loadDict(lang);
    if (!state.progress[lang]) state.progress[lang] = sessionDeck.emptyProgress();
    const prog = state.progress[lang];
    sessionDeck.refill(dict, prog, s.level, s.setSize);
    return { s, dict, prog };
  }

  // The next card, or null when paused or not set up yet. `manual` shows it even when paused.
  async function drawCard(manual) {
    let shown = null;
    const payload = await update(async (state) => {
      if (!state.settings.onboarded || (state.settings.paused && !manual)) return null;
      const { s, dict, prog } = await openDeck(state);
      shown = state;
      return cardPayload(s, sessionDeck.nextCard(dict, prog, s.nativeLang));
    });
    return { payload, state: shown };
  }

  function togglePause() {
    return update((state) => {
      state.settings.paused = !state.settings.paused;
      state.settings.updatedAt = Date.now();
      return state.settings;
    });
  }

  // `lang` is the language of the card on screen: settings may have changed since it was shown.
  function learned(lemma, lang) {
    return update(async (state) => {
      const { s, dict, prog } = await openDeck(state, lang);
      sessionDeck.markLearned(prog, lemma);
      sessionDeck.refill(dict, prog, s.level, s.setSize);
    });
  }

  async function getState() {
    const state = await readState();
    const { s, dict, prog } = await openDeck(state);
    return sessionDeck.viewState(dict, prog, s);
  }

  // Returns true when this save finished the first-run setup.
  function saveSettings(patch) {
    return update(async (state) => {
      const firstRun = !state.settings.onboarded;
      state.settings = { ...state.settings, ...patch, updatedAt: Date.now() };
      await openDeck(state);
      return firstRun;
    });
  }

  function unlearn(lemma) {
    return update(async (state) => {
      const { prog } = await openDeck(state);
      sessionDeck.unlearn(prog, lemma);
    });
  }

  return { readState, update, openDeck, drawCard, togglePause, learned, getState, saveSettings, unlearn };
}

if (typeof module !== 'undefined') module.exports = { createSession };
else globalThis.createSession = createSession;
