// Collects the web app into web-dist. The card and settings pages run in frames, with
// src/web/desktop.js in place of the desktop shell's file of the same name.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const out = path.join(root, 'web-dist');
const copy = (from, to) => fs.cpSync(path.join(root, from), path.join(out, to), { recursive: true });

fs.rmSync(out, { recursive: true, force: true });
copy('src/renderer', '.');
copy('src/web', '.');
copy('src/core/deck.js', 'deck.js');
copy('src/core/session.js', 'session.js');
copy('data/dicts', 'dicts');
