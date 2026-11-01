# Cards

Pop-up flashcards that teach you words while you work. A small card appears in the screen corner: the word first, then its translation a few seconds later. Tick it once you know it, and the next most frequent word takes its place.

![A card showing "la casa" with the translation "дом"](screenshots/mvp-2026-11-01/card-translation-light.png)

## Download

Get the latest build from [Releases](https://github.com/matacoder/cards/releases/latest): macOS (Apple Silicon, Intel) and Windows x64. Install steps are in the release notes. Builds aren't signed yet, so macOS and Windows warn on first launch. After that, the app updates itself.

## Supported languages

Any of these can be the language you study or the language of translation, in any direction:

| Language | Dictionary | Frequency source |
|---|---|---|
| Spanish | 3000 words | Film and TV subtitles (OpenSubtitles) |
| English | 3000 words | Film and TV subtitles (OpenSubtitles) |
| Russian | 3000 words | Russian National Corpus, 1950–2007 |

That gives six study directions: es→en, es→ru, en→es, en→ru, ru→es, ru→en. Pronunciation uses your system's voices, so it depends on which voices are installed.

The app's own interface is in Russian only for now.

Each dictionary has three levels, ordered by word frequency:

| Level | Words | Target text coverage |
|---|---|---|
| 1 | 850 | ~50% |
| 2 | 1500 | ~75% |
| 3 | 3000 | ~90% |

The coverage figures are targets and haven't been measured against these lists.

Known limits: translations come from an LLM and haven't been fully proofread. The subtitle-based Spanish and English lists include common profanity. The Russian corpus skews literary and dated, so words like "советский" rank higher than they would today.

Plan and decisions: [features/plan.md](features/plan.md).

## Status

- Desktop (Electron, macOS / Windows / Linux): MVP.
- Web (cards.mtkv.ru), sync backend, mobile widgets: planned.

## Run

```bash
npm install
npm start        # tray app; first launch opens language setup
npm test         # deck logic tests
```

Builds: `npm run dist:mac`, `npm run dist:win`, `npm run dist:linux`. Mac builds are ad-hoc signed (no Developer ID yet); Windows NSIS can't be built on Apple Silicon without Rosetta, so release builds run in CI.

Smoke test of a built app: `CARDS_SMOKE=<dir> <app binary>` renders one card, writes `smoke-card.png` and `smoke-state.json` to `<dir>`, and exits; `scripts/check_smoke.js` asserts the result. Set `CARDS_SMOKE_HIDDEN=1` to keep the window off screen when running on your own machine.

## Release

Push a `v*` tag: `.github/workflows/release.yml` builds macOS (arm64, x64) and Windows (x64) on native runners, smoke-tests each packaged app, and attaches installers to a GitHub release with `RELEASE_NOTES.md` as the body.

## How it works

- Card: word + "listen" button (system speech synthesis) on top, translation below, "learned" tick on the right. Default timing is 3 s for the word, then 3 s with the translation, then 60 s until the next card. Hovering keeps the card on screen.
- The active set holds 6 words by default and cycles through them. A learned word leaves the set and the next unlearned word by frequency replaces it.
- Levels are cumulative by frequency rank (see above). Progress is stored per studied language, so switching levels never repeats learned words.
- Position: macOS top-right under the menu bar; Windows/Linux bottom-right, always clear of the taskbar even when it auto-hides. Not shown over full-screen apps on macOS.
- State: `cards-state.json` in the Electron userData folder (`~/Library/Application Support/cards` on macOS).

## Auto-update

Packaged apps check public GitHub releases at start and every 6 hours, download silently, and restart once the card is hidden and settings are closed. Windows uses electron-updater. macOS uses `src/main/updater.js` directly (sha512 check, bundle id, version, codesign verify, then swap and relaunch) because Squirrel.Mac needs a Developer ID; the app must be in a writable folder such as Applications. Log: `update.log` in userData.

Tests against real releases: run the `update-e2e` workflow with `from` and `to` versions. It installs `from` on macOS and Windows runners and checks that it updates itself to `to`.

## Layout

```
src/core/deck.js       pure deck logic (shared with the future web app)
src/main/              Electron main process: windows, tray, scheduler, storage
src/renderer/          card and settings UI
data/dicts/<lang>.json frequency dictionaries: {rank, lemma, word, pos, tr:{<lang>: ...}}
data/sources/<lang>/   raw frequency sources + SOURCE.md (origin, license, method)
data/scripts/<lang>/   scripts that built the dictionaries
scripts/make_icons.py  tray icon generator
```

## Dictionaries

Attribution and licenses: [NOTICE.md](NOTICE.md). How each list was built: `data/sources/<lang>/SOURCE.md`.
