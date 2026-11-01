const { app, BrowserWindow, Tray, Menu, ipcMain, screen, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const deck = require('../core/deck');
const { Store } = require('./store');

const IS_MAC = process.platform === 'darwin';
const CARD_W = 400;
const CARD_H = 136;
const ROOT = path.join(__dirname, '..', '..');

let store;
let tray;
let cardWin;
let settingsWin;
let timer = null;
let cardVisible = false;
const dicts = {};

function loadDict(lang) {
  if (dicts[lang]) return dicts[lang];
  try {
    dicts[lang] = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'dicts', `${lang}.json`), 'utf8'));
  } catch {
    dicts[lang] = [];
  }
  return dicts[lang];
}

function currentDeck() {
  const s = store.settings;
  const dict = loadDict(s.learnLang);
  const prog = store.progressFor(s.learnLang);
  deck.refill(dict, prog, s.level, s.setSize);
  return { s, dict, prog };
}

function cardPosition() {
  const { workArea } = screen.getPrimaryDisplay();
  const x = workArea.x + workArea.width - CARD_W - 4;
  // macOS: under the menu bar clock; Windows/Linux: above the taskbar clock.
  const y = IS_MAC ? workArea.y + 4 : workArea.y + workArea.height - CARD_H - 4;
  return { x, y };
}

function createCardWindow() {
  cardWin = new BrowserWindow({
    width: CARD_W,
    height: CARD_H,
    ...cardPosition(),
    frame: false,
    transparent: true,
    resizable: false,
    movable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    focusable: !IS_MAC,
    acceptFirstMouse: true,
    show: false,
    hasShadow: false,
    ...(IS_MAC ? { type: 'panel' } : { type: 'toolbar' }),
    webPreferences: { preload: path.join(__dirname, 'preload.js') },
  });
  cardWin.setAlwaysOnTop(true, 'floating');
  cardWin.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: false });
  cardWin.loadFile(path.join(ROOT, 'src', 'renderer', 'card.html'));
}

function schedule(sec) {
  clearTimeout(timer);
  timer = setTimeout(showCard, sec * 1000);
}

function showCard() {
  clearTimeout(timer);
  if (cardVisible || !store.settings.onboarded) return;
  const { s, dict, prog } = currentDeck();
  const card = deck.nextCard(dict, prog, s.nativeLang);
  store.save();
  const payload = card
    ? { ...card, speechLang: deck.SPEECH_LANGS[s.learnLang], wordSec: s.wordSec, translationSec: s.translationSec }
    : { done: true, word: '🎉', translation: 'Уровень пройден — выберите следующий в настройках', wordSec: 0, translationSec: 6 };
  cardWin.setPosition(cardPosition().x, cardPosition().y);
  cardWin.webContents.send('card:show', payload);
  cardWin.showInactive();
  cardVisible = true;
}

function onCardDone() {
  cardWin.hide();
  cardVisible = false;
  if (!store.settings.paused) schedule(store.settings.intervalSec);
}

function onLearned(lemma) {
  const { s, dict, prog } = currentDeck();
  deck.markLearned(prog, lemma);
  deck.refill(dict, prog, s.level, s.setSize);
  store.save();
  notifySettings();
}

function openSettings() {
  if (settingsWin && !settingsWin.isDestroyed()) {
    settingsWin.show();
    settingsWin.focus();
    return;
  }
  settingsWin = new BrowserWindow({
    width: 620,
    height: 720,
    minWidth: 480,
    title: 'Cards',
    webPreferences: { preload: path.join(__dirname, 'preload.js') },
  });
  settingsWin.loadFile(path.join(ROOT, 'src', 'renderer', 'settings.html'));
  if (IS_MAC) app.focus({ steal: true });
}

function notifySettings() {
  if (settingsWin && !settingsWin.isDestroyed()) settingsWin.webContents.send('state:changed');
  rebuildTrayMenu();
}

function entryView(dict, lemma, nativeLang) {
  const e = dict.find((d) => d.lemma === lemma);
  return e ? { lemma, word: e.word, translation: e.tr[nativeLang] || '', rank: e.rank } : null;
}

function getState() {
  const { s, dict, prog } = currentDeck();
  const view = (lemma) => entryView(dict, lemma, s.nativeLang);
  const learned = Object.entries(prog.learned)
    .sort((a, b) => b[1] - a[1])
    .map(([lemma]) => view(lemma))
    .filter(Boolean);
  const taken = new Set(prog.active);
  const ahead = dict
    .filter((e) => e.rank <= deck.levelMax(s.level) && !prog.learned[e.lemma] && !taken.has(e.lemma))
    .slice(0, 30)
    .map((e) => view(e.lemma));
  return {
    settings: s,
    langs: deck.LANGS,
    levels: deck.LEVELS,
    dictSizes: Object.fromEntries(Object.keys(deck.LANGS).map((l) => [l, loadDict(l).length])),
    stats: deck.stats(dict, prog, s.level),
    active: prog.active.map(view).filter(Boolean),
    learned,
    ahead,
  };
}

function saveSettings(patch) {
  const wasOnboarded = store.settings.onboarded;
  store.updateSettings(patch);
  currentDeck();
  store.save();
  notifySettings();
  if (!store.settings.paused && !cardVisible) schedule(wasOnboarded ? store.settings.intervalSec : 2);
  return getState();
}

function togglePause() {
  const paused = !store.settings.paused;
  store.updateSettings({ paused });
  if (paused) clearTimeout(timer);
  else schedule(2);
  notifySettings();
}

function trayIcon() {
  const file = IS_MAC ? 'trayTemplate.png' : 'tray.png';
  const img = nativeImage.createFromPath(path.join(ROOT, 'assets', file));
  if (IS_MAC) img.setTemplateImage(true);
  return img;
}

function rebuildTrayMenu() {
  if (!tray) return;
  const paused = store.settings.paused;
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: 'Показать карточку', click: () => showCard(), enabled: store.settings.onboarded },
      { label: paused ? 'Продолжить' : 'Пауза', click: togglePause },
      { type: 'separator' },
      { label: 'Слова и настройки…', click: openSettings },
      { type: 'separator' },
      { label: 'Выход', role: 'quit' },
    ]),
  );
}

function registerIpc() {
  ipcMain.on('card:done', onCardDone);
  ipcMain.on('card:learned', (_e, lemma) => onLearned(lemma));
  ipcMain.handle('state:get', () => getState());
  ipcMain.handle('settings:save', (_e, patch) => saveSettings(patch));
  ipcMain.handle('words:unlearn', (_e, lemma) => {
    deck.unlearn(store.progressFor(store.settings.learnLang), lemma);
    store.save();
    notifySettings();
    return getState();
  });
}

app.whenReady().then(() => {
  if (IS_MAC) app.dock.hide();
  store = new Store(app.getPath('userData'));
  registerIpc();
  createCardWindow();
  tray = new Tray(trayIcon());
  tray.setToolTip('Cards');
  rebuildTrayMenu();
  if (!store.settings.onboarded) openSettings();
  else if (!store.settings.paused) schedule(3);
});

// Tray app: closing the settings window must not quit.
app.on('window-all-closed', (e) => e.preventDefault());
if (!app.requestSingleInstanceLock()) app.quit();
else app.on('second-instance', openSettings);
