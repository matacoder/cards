// Collects everything the webviews load into one folder for Tauri.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const out = path.join(root, 'frontend-dist');
fs.rmSync(out, { recursive: true, force: true });
fs.cpSync(path.join(root, 'src', 'renderer'), out, { recursive: true });
fs.cpSync(path.join(root, 'src', 'core', 'deck.js'), path.join(out, 'deck.js'));
fs.cpSync(path.join(root, 'src', 'core', 'session.js'), path.join(out, 'session.js'));
fs.cpSync(path.join(root, 'data', 'dicts'), path.join(out, 'dicts'), { recursive: true });
