# Cards

Pop-up flashcards that teach you words while you work. A small card appears in the screen corner: the word first, then its translation a few seconds later. Tick it once you know it, and the next most frequent word takes its place.

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

Builds: `npm run dist:mac`, `npm run dist:win`, `npm run dist:linux` (unsigned).

## How it works

- Card: word + "listen" button (system speech synthesis) on top, translation below, "learned" tick on the right. Default timing is 3 s for the word, then 3 s with the translation, then 60 s until the next card. Hovering keeps the card on screen.
- The active set holds 6 words by default and cycles through them. A learned word leaves the set and the next unlearned word by frequency replaces it.
- Levels by frequency rank: 850 (~50% of running text), 1500 (~75%), 3000 (~90%). Progress is stored per studied language, so switching levels never repeats learned words.
- Position: macOS top-right under the menu bar; Windows/Linux bottom-right above the taskbar. Not shown over full-screen apps on macOS.
- State: `cards-state.json` in the Electron userData folder (`~/Library/Application Support/cards` on macOS).

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

Languages: Spanish, English, Russian, each with translations into the other two. Frequency data comes from FrequencyWords (OpenSubtitles, CC-BY-SA 4.0) and, for Russian, the source listed in `data/sources/ru/SOURCE.md`. Lemmatization and translations were produced with an LLM and validated by script; spot-check before relying on them.
