const test = require('node:test');
const assert = require('node:assert');
const es = require('../data/dicts/es.json');

test('every Spanish noun is shown with an article that agrees with it', () => {
  for (const entry of es.filter((e) => e.pos === 'noun')) {
    assert.match(entry.word, /^(el|la|los|las) /, entry.word);
  }
  const masculineEnding = es.filter((e) => e.pos === 'noun' && /^la /.test(e.word) && /(o|aje)$/.test(e.lemma));
  assert.deepStrictEqual(masculineEnding.map((e) => e.word).sort(), ['la foto', 'la mano', 'la moto', 'la radio']);
});

test('irregular Spanish verbs have their real forms, and translations match', () => {
  const form = (lemma, word) => es.find((e) => e.lemma === lemma).forms.find((f) => f.word === word);
  assert.deepStrictEqual(form('tener', 'tengo').tr, { ru: 'я имею', en: 'I have' });
  assert.deepStrictEqual(form('ir', 'voy').tr, { ru: 'я иду', en: 'I go' });
  assert.strictEqual(form('ser', 'soy').tr.ru, 'я есть');
  assert.strictEqual(form('hacer', '¡haz!').tr.ru, 'делай!');
  assert.strictEqual(form('casarse', 'me caso').tr.ru, 'я женюсь');
  assert.ok(form('decir', 'dijiste'));
  assert.strictEqual(es.find((e) => e.lemma === 'gustar').forms, undefined);
});
