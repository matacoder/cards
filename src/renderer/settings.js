const el = (id) => document.getElementById(id);
const NUM_FIELDS = ['setSize', 'wordSec', 'translationSec', 'intervalSec'];
const LEVEL_NAMES = { 1: '≈50% текста', 2: '≈75% текста', 3: '≈90% текста' };

let state = null;
let tab = 'active';
let level = 1;

function fillSelect(select, langs, value) {
  select.innerHTML = Object.entries(langs)
    .map(([code, name]) => `<option value="${code}"${code === value ? ' selected' : ''}>${name}</option>`)
    .join('');
}

function renderLevels() {
  el('levels').innerHTML = Object.entries(state.levels)
    .map(([n, size]) => `<button class="level${Number(n) === level ? ' on' : ''}" data-level="${n}">
      <b>${size}</b><span class="muted">${LEVEL_NAMES[n]}</span></button>`)
    .join('');
}

function renderHeader() {
  const s = state.settings;
  document.body.classList.toggle('onboarding', !s.onboarded);
  el('title').textContent = s.onboarded ? 'Vocapeek' : 'Что изучаем?';
  el('subtitle').textContent = s.onboarded
    ? (s.paused ? 'На паузе — продолжить можно из меню в трее.' : 'Карточки появляются в углу экрана.')
    : 'Выберите язык, язык перевода и уровень. Начнём с самых частых слов.';
  el('save').textContent = s.onboarded ? 'Сохранить' : 'Начать';
}

function renderStats() {
  const st = state.stats;
  el('stats').innerHTML = `<span>Выучено <b>${st.learned}</b> из ${st.total}</span>
    <span>В наборе <b>${st.active}</b></span><span>Впереди <b>${Math.max(0, st.ahead)}</b></span>`;
}

function wordRow(w, action) {
  const btn = action ? `<button data-unlearn="${encodeURIComponent(w.lemma)}">${action}</button>` : '';
  const li = document.createElement('li');
  li.innerHTML = `<span class="r">${w.rank}</span><span class="w"></span><span class="t"></span>${btn}`;
  li.querySelector('.w').textContent = w.word;
  li.querySelector('.t').textContent = w.translation;
  return li;
}

function renderWords() {
  const list = el('words');
  list.innerHTML = '';
  const items = state[tab] || [];
  if (items.length === 0) {
    list.innerHTML = `<li class="empty">${tab === 'learned' ? 'Пока ничего — отмечайте галочкой на карточке.' : 'Пусто.'}</li>`;
    return;
  }
  items.forEach((w) => list.appendChild(wordRow(w, tab === 'learned' ? 'Вернуть' : '')));
}

function render() {
  const s = state.settings;
  level = s.level;
  fillSelect(el('learnLang'), state.langs, s.learnLang);
  fillSelect(el('nativeLang'), state.langs, s.nativeLang);
  NUM_FIELDS.forEach((f) => (el(f).value = s[f]));
  renderHeader();
  renderLevels();
  renderStats();
  renderWords();
}

async function save() {
  const patch = { learnLang: el('learnLang').value, nativeLang: el('nativeLang').value, level, onboarded: true };
  if (patch.learnLang === patch.nativeLang) {
    el('saved').textContent = 'Языки должны отличаться.';
    return;
  }
  NUM_FIELDS.forEach((f) => (patch[f] = Math.max(1, Number(el(f).value) || 1)));
  state = await window.cards.saveSettings(patch);
  render();
  el('saved').textContent = 'Сохранено';
  setTimeout(() => (el('saved').textContent = ''), 1500);
}

async function refresh() {
  state = await window.cards.getState();
  render();
}

el('save').addEventListener('click', save);
el('levels').addEventListener('click', (e) => {
  const b = e.target.closest('[data-level]');
  if (!b) return;
  level = Number(b.dataset.level);
  renderLevels();
});
document.querySelector('.tabs').addEventListener('click', (e) => {
  const b = e.target.closest('[data-tab]');
  if (!b) return;
  tab = b.dataset.tab;
  document.querySelectorAll('.tabs button').forEach((x) => x.classList.toggle('on', x === b));
  renderWords();
});
el('words').addEventListener('click', async (e) => {
  const b = e.target.closest('[data-unlearn]');
  if (!b) return;
  state = await window.cards.unlearn(decodeURIComponent(b.dataset.unlearn));
  render();
});
window.cards.onStateChanged(refresh);
refresh();
