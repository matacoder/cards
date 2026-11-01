// Silent auto-update from public GitHub releases.
// Windows: electron-updater (NSIS). macOS: own installer, because Squirrel.Mac rejects
// builds without a Developer ID signature; electron-updater is used there for the check only.
const { app } = require('electron');
const { autoUpdater } = require('electron-updater');
const { execFile, spawn } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const run = promisify(execFile);
const IS_MAC = process.platform === 'darwin';
const RELEASES = 'https://github.com/matacoder/vocapeek/releases/download';
const CHECK_EVERY_MS = 6 * 60 * 60 * 1000;
const IDLE_POLL_MS = 60 * 1000;
const BUNDLE_ID = 'ru.mtkv.cards';
const APP_NAMES = ['Vocapeek.app', 'Cards.app'];

// Args: pid, new app, current app, final app path, relaunch flag.
// The final path can differ from the current one when the product is renamed.
// Restores the old app if the copy fails, and removes the whole download folder.
const SWAP_SCRIPT = `
while kill -0 "$1" 2>/dev/null; do sleep 0.2; done
backup="$3.old.$$"
mv "$3" "$backup" || exit 1
if ditto "$2" "$4"; then
  rm -rf "$backup"
  xattr -dr com.apple.quarantine "$4" 2>/dev/null
  installed="$4"
else
  rm -rf "$4"
  mv "$backup" "$3"
  installed="$3"
fi
rm -rf "$(dirname "$(dirname "$2")")"
[ "$5" = 1 ] && open "$installed"
`;

function macBundlePath() {
  return path.resolve(process.execPath, '..', '..', '..');
}

function macBlockReason() {
  const bundle = macBundlePath();
  if (bundle.startsWith('/Volumes/') || bundle.includes('AppTranslocation')) return 'move-to-applications';
  try {
    fs.accessSync(path.dirname(bundle), fs.constants.W_OK);
    return null;
  } catch {
    return 'move-to-applications';
  }
}

async function downloadVerified(url, file, sha512) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download failed: ${res.status}`);
  const hash = crypto.createHash('sha512');
  const out = fs.createWriteStream(file);
  for await (const chunk of res.body) {
    hash.update(chunk);
    if (!out.write(chunk)) await new Promise((r) => out.once('drain', r));
  }
  await new Promise((resolve, reject) => out.end((err) => (err ? reject(err) : resolve())));
  if (hash.digest('base64') !== sha512) throw new Error('sha512 mismatch');
}

async function verifyMacApp(appPath, version) {
  const plist = path.join(appPath, 'Contents', 'Info.plist');
  const read = async (key) => (await run('/usr/bin/plutil', ['-extract', key, 'raw', plist])).stdout.trim();
  if ((await read('CFBundleIdentifier')) !== BUNDLE_ID) throw new Error('unexpected bundle id');
  if ((await read('CFBundleShortVersionString')) !== version) throw new Error('unexpected version');
  await run('/usr/bin/codesign', ['--verify', '--deep', '--strict', appPath]);
}

// Download, verify and unpack the update. Returns the unpacked app path.
async function prepareMacUpdate(info) {
  const suffix = `-mac-${process.arch}.zip`;
  const file = info.files.find((f) => f.url.endsWith(suffix));
  if (!file) throw new Error(`no update file for ${process.arch}`);
  const dir = fs.mkdtempSync(path.join(app.getPath('temp'), 'cards-update-'));
  const zip = path.join(dir, 'update.zip');
  await downloadVerified(`${RELEASES}/v${info.version}/${file.url}`, zip, file.sha512);
  const unpacked = path.join(dir, 'unpacked');
  await run('/usr/bin/ditto', ['-x', '-k', zip, unpacked]);
  const name = APP_NAMES.find((n) => fs.existsSync(path.join(unpacked, n)));
  if (!name) throw new Error('no app in the update');
  const appPath = path.join(unpacked, name);
  await verifyMacApp(appPath, info.version);
  return appPath;
}

function createUpdater({ isBusy, onChange, logFile, relaunch = true }) {
  const state = { status: 'idle', version: null, error: null };
  let macApp = null;
  let timers = [];

  function log(message) {
    fs.appendFile(logFile, `${new Date().toISOString()} ${message}\n`, () => {});
  }

  function setState(patch) {
    Object.assign(state, patch);
    log(`${state.status} ${state.version || ''} ${state.error || ''}`.trim());
    onChange();
  }

  function fail(err) {
    setState({ status: 'error', error: err.message });
  }

  async function check() {
    if (state.status === 'checking' || state.status === 'downloading' || state.status === 'ready') return;
    const blocked = IS_MAC ? macBlockReason() : null;
    if (blocked) return setState({ status: blocked });
    setState({ status: 'checking', error: null });
    try {
      const result = await autoUpdater.checkForUpdates();
      if (!result || !result.isUpdateAvailable) return setState({ status: 'idle' });
      const { updateInfo } = result;
      setState({ status: 'downloading', version: updateInfo.version });
      if (IS_MAC) {
        macApp = await prepareMacUpdate(updateInfo);
        setState({ status: 'ready' });
      }
      // Windows downloads via autoDownload; 'update-downloaded' moves it to ready.
    } catch (err) {
      fail(err);
    }
  }

  function install() {
    if (state.status !== 'ready') return;
    log(`installing ${state.version}`);
    if (!IS_MAC) return autoUpdater.quitAndInstall(true, relaunch);
    const bundle = macBundlePath();
    const target = path.join(path.dirname(bundle), path.basename(macApp));
    const args = ['-c', SWAP_SCRIPT, 'cards-update', String(process.pid), macApp, bundle, target, relaunch ? '1' : '0'];
    spawn('/bin/sh', args, { detached: true, stdio: 'ignore' }).unref();
    app.quit();
  }

  function installWhenIdle() {
    if (state.status === 'ready' && !isBusy()) install();
  }

  function init() {
    autoUpdater.autoDownload = !IS_MAC;
    autoUpdater.autoInstallOnAppQuit = !IS_MAC;
    autoUpdater.on('update-downloaded', () => setState({ status: 'ready' }));
    autoUpdater.on('error', fail);
  }

  function start() {
    init();
    timers = [
      setTimeout(check, 30 * 1000),
      setInterval(check, CHECK_EVERY_MS),
      setInterval(installWhenIdle, IDLE_POLL_MS),
    ];
    return timers;
  }

  return { state, init, start, check, install };
}

module.exports = { createUpdater };
