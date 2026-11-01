// Runs the real desktop.js against a fake native shell that behaves like src-tauri/src/state.rs.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const deck = require('../src/core/deck');
const { createSession } = require('../src/core/session');

const source = fs.readFileSync(path.join(__dirname, '../src/renderer/desktop.js'), 'utf8');
const DICT = [{ rank: 1, lemma: 'de', word: 'de', tr: { ru: 'из', en: 'of' } }, { rank: 2, lemma: 'la', word: 'la', tr: { ru: 'та', en: 'the' } }];
const SETTINGS = { onboarded: true, learnLang: 'es', nativeLang: 'ru', level: 1 };

function desktop() {
  const shell = { revision: 0, json: JSON.stringify({ settings: SETTINGS, progress: {} }) };
  const tick = () => new Promise((resolve) => setImmediate(resolve));
  const invoke = async (command, args) => {
    await tick();
    if (command === 'state_read') return [shell.revision, shell.json];
    if (command !== 'state_write' || args.revision !== shell.revision) return false;
    shell.json = args.json;
    shell.revision += 1;
    return true;
  };
  const window = {
    __TAURI__: {
      core: { invoke },
      event: { listen: async () => {}, emit: async () => {} },
      window: { getCurrentWindow: () => ({ label: 'settings' }) },
    },
  };
  const fetch = async () => ({ json: async () => DICT });
  vm.runInNewContext(source, { window, deck, fetch, createSession });
  return { cards: window.cards, saved: () => JSON.parse(shell.json) };
}

test('a word marked learned survives a settings save at the same moment', async () => {
  const { cards, saved } = desktop();
  await Promise.all([cards.learned('de', 'es'), cards.saveSettings({ setSize: 3 })]);
  assert.ok(saved().progress.es.learned.de);
  assert.strictEqual(saved().settings.setSize, 3);
});

test('a card goes to the language it was shown in, not the one selected since', async () => {
  const { cards, saved } = desktop();
  await cards.saveSettings({ learnLang: 'en' });
  await cards.learned('de', 'es');
  assert.ok(saved().progress.es.learned.de);
  assert.strictEqual(saved().progress.en.learned.de, undefined);
});
