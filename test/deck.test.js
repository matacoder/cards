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
