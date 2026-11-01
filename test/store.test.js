const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { migrateLegacyState } = require('../src/main/store');

function dirs() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'store-test-'));
  const legacy = path.join(root, 'Cards');
  fs.mkdirSync(legacy);
  return { legacy, target: path.join(root, 'Vocapeek') };
}
const file = (dir) => path.join(dir, 'cards-state.json');

test('copies old progress to the new folder and keeps the original', () => {
  const { legacy, target } = dirs();
  fs.writeFileSync(file(legacy), '{"progress":1}');
  assert.strictEqual(migrateLegacyState(target, legacy), true);
  assert.strictEqual(fs.readFileSync(file(target), 'utf8'), '{"progress":1}');
  assert.ok(fs.existsSync(file(legacy)));
});

test('never overwrites existing progress', () => {
  const { legacy, target } = dirs();
  fs.mkdirSync(target);
  fs.writeFileSync(file(legacy), 'old');
  fs.writeFileSync(file(target), 'new');
  assert.strictEqual(migrateLegacyState(target, legacy), false);
  assert.strictEqual(fs.readFileSync(file(target), 'utf8'), 'new');
});

test('does nothing on a clean install or when the folder is unchanged', () => {
  const { legacy, target } = dirs();
  assert.strictEqual(migrateLegacyState(target, legacy), false);
  fs.writeFileSync(file(legacy), 'x');
  assert.strictEqual(migrateLegacyState(legacy, legacy), false);
});
