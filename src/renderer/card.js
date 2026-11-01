// Card lifecycle: word phase -> translation phase -> hide. Hovering pauses the clock.
const el = (id) => document.getElementById(id);
const cardEl = el('card');

let current = null;
let phase = null; // 'word' | 'translation' | 'closing'
let remaining = 0;
let startedAt = 0;
let timer = null;
let hovered = false;

// The language alone picks the system's default voice for it. Choosing from the list instead
// can land on a macOS novelty voice ("Bells" is en-US too).
function speak() {
  if (!current || current.done) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(current.word);
  u.lang = current.speechLang;
  speechSynthesis.speak(u);
}

// Without a voice for the language the system would read the word with a wrong accent, or stay
// silent. An empty list says nothing: voices may not have loaded yet.
function updateSpeak() {
  const button = el('speak');
  const voices = speechSynthesis.getVoices();
  const code = current && current.speechLang ? current.speechLang.slice(0, 2) : '';
  const missing = code && voices.length > 0 && !voices.some((v) => v.lang.toLowerCase().startsWith(code));
  button.disabled = !!missing;
  button.title = missing ? 'В системе нет голоса для этого языка' : 'Прослушать';
}

function setProgress(ms, total) {
  const bar = el('progress');
  bar.style.transition = 'none';
  bar.style.width = `${(total ? 1 - ms / total : 1) * 100}%`;
  if (hovered || ms <= 0) return;
  void bar.offsetWidth; // Apply the start position, or the second run has nothing to animate.
  bar.style.transition = `width ${ms}ms linear`;
  bar.style.width = '100%';
}

function runPhase(name, ms) {
  phase = name;
  remaining = ms;
  current.phaseTotal = ms;
  resume();
}

function resume() {
  clearTimeout(timer);
  if (hovered || phase === 'closing') return;
  startedAt = Date.now();
  setProgress(remaining, current.phaseTotal);
  timer = setTimeout(advance, remaining);
}

function pause() {
  clearTimeout(timer);
  remaining = Math.max(0, remaining - (Date.now() - startedAt));
  setProgress(remaining, current.phaseTotal);
}

function advance() {
  if (phase === 'word') {
    cardEl.classList.add('revealed');
    runPhase('translation', current.translationSec * 1000);
  } else if (phase === 'translation') {
    close();
  }
}

function close(delay = 0) {
  phase = 'closing';
  clearTimeout(timer);
  setTimeout(() => {
    cardEl.classList.remove('visible');
    setTimeout(() => window.cards.done(), 150);
  }, delay);
}

function show(card) {
  current = card;
  hovered = false;
  el('word').textContent = card.word;
  el('translation').textContent = card.translation;
  cardEl.className = 'card' + (card.done ? ' finished' : '');
  el('speak').hidden = !!card.done;
  updateSpeak();
  requestAnimationFrame(() => cardEl.classList.add('visible'));
  if (card.wordSec > 0) runPhase('word', card.wordSec * 1000);
  else {
    cardEl.classList.add('revealed');
    runPhase('translation', card.translationSec * 1000);
  }
}

el('speak').addEventListener('click', speak);
speechSynthesis.addEventListener('voiceschanged', updateSpeak);
el('learned').addEventListener('click', () => {
  if (!current || phase === 'closing') return;
  cardEl.classList.add('revealed', 'done');
  window.cards.learned(current.lemma, current.learnLang);
  close(700);
});
cardEl.addEventListener('mouseenter', () => {
  hovered = true;
  if (phase !== 'closing') pause();
});
cardEl.addEventListener('mouseleave', () => {
  hovered = false;
  if (phase !== 'closing') {
    remaining = Math.max(remaining, 1200);
    resume();
  }
});

window.cards.onShow(show);
window.cards.appVersion().then((version) => {
  el('version').textContent = `v${version}`;
});
