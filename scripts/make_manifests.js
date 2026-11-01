// Writes update manifests into a folder of release files:
// latest.json for the Tauri updater, latest.yml and latest-mac.yml for Electron 0.1.x copies.
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const RELEASES = 'https://github.com/matacoder/vocapeek/releases/download';

function fileEntry(dir, name) {
  const data = fs.readFileSync(path.join(dir, name));
  return { url: name, sha512: crypto.createHash('sha512').update(data).digest('base64'), size: data.length };
}

function legacyYaml(version, entries, date) {
  const files = entries.flatMap((f) => [`  - url: ${f.url}`, `    sha512: ${f.sha512}`, `    size: ${f.size}`]);
  const main = entries[0];
  return [`version: ${version}`, 'files:', ...files, `path: ${main.url}`, `sha512: ${main.sha512}`, `releaseDate: '${date}'`, ''].join('\n');
}

function tauriManifest(dir, version, date) {
  const base = `${RELEASES}/v${version}`;
  const artifacts = {
    'darwin-aarch64': `Vocapeek-${version}-mac-arm64.app.tar.gz`,
    'darwin-x86_64': `Vocapeek-${version}-mac-x64.app.tar.gz`,
    'windows-x86_64': `Vocapeek-${version}-win-x64.exe`,
  };
  const platforms = {};
  for (const [platform, name] of Object.entries(artifacts)) {
    platforms[platform] = { url: `${base}/${name}`, signature: fs.readFileSync(path.join(dir, `${name}.sig`), 'utf8').trim() };
  }
  return { version, pub_date: date, platforms };
}

function writeManifests(dir, version, date = new Date().toISOString()) {
  const mac = ['arm64', 'x64'].map((arch) => fileEntry(dir, `Vocapeek-${version}-mac-${arch}.zip`));
  const win = [fileEntry(dir, `Vocapeek-${version}-win-x64.exe`)];
  fs.writeFileSync(path.join(dir, 'latest-mac.yml'), legacyYaml(version, mac, date));
  fs.writeFileSync(path.join(dir, 'latest.yml'), legacyYaml(version, win, date));
  fs.writeFileSync(path.join(dir, 'latest.json'), `${JSON.stringify(tauriManifest(dir, version, date), null, 2)}\n`);
}

if (require.main === module) writeManifests(process.argv[2], process.argv[3]);
module.exports = { writeManifests };
