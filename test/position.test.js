const test = require('node:test');
const assert = require('node:assert');
const { cardPosition } = require('../src/main/position');

const size = { width: 400, height: 136 };
const bounds = { x: 0, y: 0, width: 1920, height: 1080 };

test('auto-hidden taskbar: card stays above where the taskbar pops up', () => {
  const { y } = cardPosition({ bounds, workArea: bounds }, size, false);
  assert.strictEqual(y + size.height, 1080 - 56);
});

test('visible 48px taskbar: card clears it', () => {
  const workArea = { x: 0, y: 0, width: 1920, height: 1032 };
  const { y } = cardPosition({ bounds, workArea }, size, false);
  assert.ok(y + size.height <= 1032);
});

test('tall taskbar: work area wins over the reserve', () => {
  const workArea = { x: 0, y: 0, width: 1920, height: 980 };
  const { y } = cardPosition({ bounds, workArea }, size, false);
  assert.strictEqual(y + size.height, 976);
});

test('second display offset is respected', () => {
  const second = { x: 1920, y: 200, width: 1280, height: 720 };
  const { x, y } = cardPosition({ bounds: second, workArea: second }, size, false);
  assert.strictEqual(x, 1920 + 1280 - 400 - 4);
  assert.strictEqual(y + size.height, 200 + 720 - 56);
});

test('macOS: top right under the menu bar', () => {
  const workArea = { x: 0, y: 25, width: 1920, height: 1055 };
  assert.deepStrictEqual(cardPosition({ bounds, workArea }, size, true), { x: 1516, y: 29 });
});
