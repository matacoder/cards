// Card lifecycle: word phase -> translation phase -> hide. Hovering pauses the clock.
const el = (id) => document.getElementById(id);
const cardEl = el('card');

let current = null;
let phase = null; // 'word' | 'translation' | 'closing'
let remaining = 0;
let startedAt = 0;
let timer = null;
let hovered = false;

function speak() {
  if (!current || current.done) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(current.lemma);
  u.lang = current.speechLang;
  const voice = speechSynthesis.getVoices().find((v) => v.lang.replace('_', '-').startsWith(current.speechLang.slice(0, 2)));
  if (voice) u.voice = voice;
  speechSynthesis.speak(u);
}

function setProgress(ms, total) {
  const bar = el('progress');
  const done = total ? 1 - ms / total : 1;
  bar.style.transition = 'none';
  bar.style.width = `${done * 100}%`;
  if (!hovered && ms > 0) {
    requestAnimationFrame(() => {
      bar.style.transition = `width ${ms}ms linear`;
      bar.style.width = '100%';
    });
  }
}

function runPhase(name, ms) {
  phase = name;
  remaining = ms;
  current.phaseTotal = ms;
  setProgress(ms, ms);
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
    setTimeout(() => window.cards.done(), 260);
  }, delay);
}

function show(card) {
  current = card;
  hovered = false;
  el('word').textContent = card.word;
  el('translation').textContent = card.translation;
  cardEl.className = 'card' + (card.done ? ' finished' : '');
  el('speak').hidden = !!card.done;
  requestAnimationFrame(() => cardEl.classList.add('visible'));
  if (card.wordSec > 0) runPhase('word', card.wordSec * 1000);
  else {
    cardEl.classList.add('revealed');
    runPhase('translation', card.translationSec * 1000);
  }
}

el('speak').addEventListener('click', speak);
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
