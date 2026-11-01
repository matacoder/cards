// Local persistence: one JSON file in the app's userData folder.
const fs = require('fs');
const path = require('path');
const { emptyProgress } = require('../core/deck');

const DEFAULT_SETTINGS = {
  onboarded: false,
  learnLang: 'es',
  nativeLang: 'ru',
  level: 1,
  setSize: 6,
  wordSec: 3,
  translationSec: 3,
  intervalSec: 60,
  paused: false,
};

class Store {
  constructor(dir) {
    this.file = path.join(dir, 'cards-state.json');
    this.state = { settings: { ...DEFAULT_SETTINGS }, progress: {} };
    this.load();
  }

  load() {
    try {
      const raw = JSON.parse(fs.readFileSync(this.file, 'utf8'));
      this.state.settings = { ...DEFAULT_SETTINGS, ...raw.settings };
      this.state.progress = raw.progress || {};
    } catch {
      // First run or unreadable file: keep defaults.
    }
  }

  save() {
    const tmp = `${this.file}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(this.state, null, 1));
    fs.renameSync(tmp, this.file);
  }

  get settings() {
    return this.state.settings;
  }

  updateSettings(patch) {
    this.state.settings = { ...this.state.settings, ...patch };
    this.save();
    return this.state.settings;
  }

  // Progress is per learned language so switching levels never repeats learned words.
  progressFor(lang) {
    if (!this.state.progress[lang]) this.state.progress[lang] = emptyProgress();
    return this.state.progress[lang];
  }
}

module.exports = { Store, DEFAULT_SETTINGS };
