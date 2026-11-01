const test = require('node:test');
const assert = require('node:assert');
const deck = require('../src/core/deck');

const dict = Array.from({ length: 2000 }, (_, i) => ({
  rank: i + 1, lemma: `w${i + 1}`, word: `w${i + 1}`, tr: { ru: `п${i + 1}` },
}));

test('refill takes the most frequent unlearned words', () => {
  const p = deck.emptyProgress();
  p.learned.w2 = 1;
  deck.refill(dict, p, 1, 6);
  assert.deepStrictEqual(p.active, ['w1', 'w3', 'w4', 'w5', 'w6', 'w7']);
});

test('nextCard rotates through the active set', () => {
  const p = deck.refill(dict, deck.emptyProgress(), 1, 2);
  const seen = [1, 2, 3].map(() => deck.nextCard(dict, p, 'ru').lemma);
  assert.deepStrictEqual(seen, ['w1', 'w2', 'w1']);
  assert.strictEqual(deck.nextCard(dict, p, 'ru').translation, 'п2');
});

test('learned word leaves the set and is replaced', () => {
  const p = deck.refill(dict, deck.emptyProgress(), 1, 3);
  deck.markLearned(p, 'w2');
  deck.refill(dict, p, 1, 3);
  assert.deepStrictEqual(p.active, ['w1', 'w3', 'w4']);
});

test('switching level never brings back learned words', () => {
  const p = deck.emptyProgress();
  dict.slice(0, 850).forEach((e) => (p.learned[e.lemma] = 1));
  deck.refill(dict, p, 1, 6);
  assert.deepStrictEqual(p.active, []);
  assert.strictEqual(deck.nextCard(dict, p, 'ru'), null);
  deck.refill(dict, p, 2, 6);
  assert.strictEqual(p.active[0], 'w851');
});

test('unlearn makes a word available again', () => {
  const p = deck.emptyProgress();
  deck.markLearned(p, 'w1');
  deck.unlearn(p, 'w1');
  deck.refill(dict, p, 1, 1);
  assert.deepStrictEqual(p.active, ['w1']);
});

test('a verb goes from the infinitive through its forms, and is learned as a whole', () => {
  const forms = [{ word: 'hablo', tr: { ru: 'я говорю' } }, { word: 'hablé', tr: { ru: 'я поговорил' } }];
  const verbs = [{ rank: 1, lemma: 'hablar', word: 'hablar', pos: 'verb', tr: { ru: 'говорить' }, forms }];
  const p = deck.emptyProgress();
  deck.refill(verbs, p, 1, 6);
  const seen = [1, 2, 3, 4].map(() => deck.nextCard(verbs, p, 'ru'));
  assert.deepStrictEqual(seen.map((c) => c.word), ['hablar', 'hablo', 'hablé', 'hablo']);
  assert.strictEqual(seen[1].translation, 'я говорю');
  assert.ok(seen.every((c) => c.lemma === 'hablar'));
  deck.markLearned(p, seen[1].lemma);
  assert.strictEqual(deck.nextCard(verbs, p, 'ru'), null);
});

test('merging devices: for each word the latest change wins', () => {
  const phone = { learned: { a: 10, b: 10 }, active: ['c'], cursor: 0, shows: { c: 2 } };
  const laptop = { learned: { d: 30 }, unlearned: { a: 20, b: 5 }, active: ['e'], cursor: 3, shows: { c: 5 } };
  const merged = deck.mergeStates({ progress: { es: phone }, settings: {} }, { progress: { es: laptop }, settings: {} }).progress.es;
  assert.deepStrictEqual(Object.keys(merged.learned).sort(), ['b', 'd']);
  assert.deepStrictEqual(merged.unlearned, { a: 20 });
  assert.deepStrictEqual(merged.active, ['c']);
  assert.strictEqual(merged.shows.c, 5);
});

test('merging devices: the newer settings win, and languages only one side has stay', () => {
  const mine = { settings: { level: 1, updatedAt: 1 }, progress: { es: deck.emptyProgress() } };
  const theirs = { settings: { level: 3, updatedAt: 2 }, progress: { en: deck.emptyProgress() } };
  const merged = deck.mergeStates(mine, theirs);
  assert.strictEqual(merged.settings.level, 3);
  assert.deepStrictEqual(Object.keys(merged.progress).sort(), ['en', 'es']);
});
