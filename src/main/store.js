// Local persistence: one JSON file in the app's userData folder.
const fs = require('fs');
const path = require('path');
const { emptyProgress } = require('../core/deck');

const STATE_FILE = 'cards-state.json';

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

// The app was first released as "Cards", and its data folder follows the app name.
// Copy the old state once so a rename never loses progress. The old file stays as a backup.
function migrateLegacyState(dir, legacyDir) {
  const target = path.join(dir, STATE_FILE);
  const legacy = path.join(legacyDir, STATE_FILE);
  if (path.resolve(target) === path.resolve(legacy)) return false;
  if (fs.existsSync(target) || !fs.existsSync(legacy)) return false;
  fs.mkdirSync(dir, { recursive: true });
  fs.copyFileSync(legacy, target);
  return true;
}

class Store {
  constructor(dir) {
    this.file = path.join(dir, STATE_FILE);
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

module.exports = { Store, DEFAULT_SETTINGS, migrateLegacyState };
