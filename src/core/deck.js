// Pure deck logic shared by desktop and (later) web. No I/O here.

const LEVELS = { 1: 850, 2: 1500, 3: 3000 };
const LANGS = { es: 'Español', en: 'English', ru: 'Русский' };
const SPEECH_LANGS = { es: 'es-ES', en: 'en-US', ru: 'ru-RU' };

function emptyProgress() {
  return { learned: {}, active: [], cursor: 0 };
}

function levelMax(level) {
  return LEVELS[level] || LEVELS[1];
}

// Fill the active set with the most frequent words not yet learned.
function refill(dict, prog, level, setSize) {
  const max = levelMax(level);
  const active = prog.active.filter((lemma) => !prog.learned[lemma]);
  const taken = new Set(active);
  for (const entry of dict) {
    if (active.length >= setSize) break;
    if (entry.rank > max) break;
    if (prog.learned[entry.lemma] || taken.has(entry.lemma)) continue;
    active.push(entry.lemma);
    taken.add(entry.lemma);
  }
  prog.active = active.slice(0, setSize);
  if (prog.cursor >= prog.active.length) prog.cursor = 0;
  return prog;
}

// Next card in round-robin order over the active set, or null when nothing is left.
function nextCard(dict, prog, nativeLang) {
  if (prog.active.length === 0) return null;
  const lemma = prog.active[prog.cursor % prog.active.length];
  prog.cursor = (prog.cursor + 1) % prog.active.length;
  const entry = dict.find((e) => e.lemma === lemma);
  if (!entry) return null;
  return { lemma, word: entry.word, translation: entry.tr[nativeLang] || '', rank: entry.rank };
}

function markLearned(prog, lemma, now = Date.now()) {
  prog.learned[lemma] = now;
  prog.active = prog.active.filter((l) => l !== lemma);
  return prog;
}

function unlearn(prog, lemma) {
  delete prog.learned[lemma];
  return prog;
}

function stats(dict, prog, level) {
  const max = levelMax(level);
  const inLevel = dict.filter((e) => e.rank <= max);
  const learned = inLevel.filter((e) => prog.learned[e.lemma]).length;
  return { total: inLevel.length, learned, active: prog.active.length, ahead: inLevel.length - learned - prog.active.length };
}

module.exports = { LEVELS, LANGS, SPEECH_LANGS, emptyProgress, levelMax, refill, nextCard, markLearned, unlearn, stats };
