const test = require('node:test');
const assert = require('node:assert');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { writeManifests } = require('../scripts/make_manifests');

const V = '1.2.3';

test('the app ships with a real update key', () => {
  const conf = JSON.parse(fs.readFileSync(path.join(__dirname, '../src-tauri/tauri.conf.json'), 'utf8'));
  assert.doesNotMatch(conf.plugins.updater.pubkey, /__PUBKEY__/);
});

function releaseFolder() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'manifests-'));
  const files = [`mac-arm64.zip`, `mac-x64.zip`, `win-x64.exe`, `mac-arm64.app.tar.gz`, `mac-x64.app.tar.gz`];
  files.forEach((f) => fs.writeFileSync(path.join(dir, `Vocapeek-${V}-${f}`), f));
  [`mac-arm64.app.tar.gz`, `mac-x64.app.tar.gz`, `win-x64.exe`].forEach((f) => fs.writeFileSync(path.join(dir, `Vocapeek-${V}-${f}.sig`), `sig ${f}\n`));
  writeManifests(dir, V, '2026-01-01T00:00:00.000Z');
  return dir;
}

test('Tauri manifest covers every platform with its signature', () => {
  const m = JSON.parse(fs.readFileSync(path.join(releaseFolder(), 'latest.json'), 'utf8'));
  assert.strictEqual(m.version, V);
  assert.deepStrictEqual(Object.keys(m.platforms).sort(), ['darwin-aarch64', 'darwin-x86_64', 'windows-x86_64']);
  assert.strictEqual(m.platforms['windows-x86_64'].signature, 'sig win-x64.exe');
  assert.ok(m.platforms['darwin-aarch64'].url.endsWith(`/v${V}/Vocapeek-${V}-mac-arm64.app.tar.gz`));
});

test('Electron manifests list what old copies look for, with correct hashes', () => {
  const dir = releaseFolder();
  const mac = fs.readFileSync(path.join(dir, 'latest-mac.yml'), 'utf8');
  assert.match(mac, /url: Vocapeek-1\.2\.3-mac-arm64\.zip/);
  assert.match(mac, /url: Vocapeek-1\.2\.3-mac-x64\.zip/);
  const win = fs.readFileSync(path.join(dir, 'latest.yml'), 'utf8');
  const hash = crypto.createHash('sha512').update('win-x64.exe').digest('base64');
  assert.ok(win.includes(`sha512: ${hash}`));
  assert.ok(win.includes(`path: Vocapeek-${V}-win-x64.exe`));
});
