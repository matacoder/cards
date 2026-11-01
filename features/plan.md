# Cards: plan

An app for learning words through pop-up cards while you work. Platforms: macOS, Windows and Linux desktop first, then web, later iOS/Android widgets.

## Card mechanics
- Three sections: the word in the studied language with a listen button on top, the translation below, a "learned" tick on the right.
- Cycle: the word shows for N seconds (default 3), then the translation appears for another M seconds (default 3). The tick works for as long as the card is on screen. Hovering keeps the card on screen.
- K seconds between cards (default 60). All of this is configurable.
- Speech uses system synthesis (Web Speech API). No audio files of our own.

## Word sets
- Active set: 6 words by default, configurable. Cards cycle through the set.
- "Learned" moves a word to the learned list and the next unlearned word joins the set.
- Three lists: learned, learning (active set), ahead (not started). A learned word can be returned to learning.
- Progress is stored per studied language, not per level, so switching levels never repeats learned words.

## Dictionaries
- Frequency-based, one entry per lemma. Levels by rank: 1–850 (target ~50% text coverage), 851–1500 (~75%), 1501–3000 (~90%).
- Starting languages: Spanish, English, Russian, with translations in any direction (each dictionary has translations into the other two).
- Sources: FrequencyWords (OpenSubtitles, CC BY-SA 4.0) for es/en; the Lyashevskaya–Sharov frequency dictionary (Russian National Corpus) for ru. Lemmas and translations were produced with an LLM; origin is described in `data/sources/*/SOURCE.md`.
- Spanish nouns are shown with an article ("la casa") because gender matters.

## Desktop (stage 1, MVP)
- Electron: one codebase for macOS, Windows and Linux, and the card UI carries over to the web. Rust/Tauri postponed: Electron needs no extra build toolchain.
- A custom window instead of system notifications, which lack the needed buttons and can't update in place. Frameless, transparent, always on top, never takes focus.
- Position: macOS top right under the menu bar (where the clock and notifications are). Windows/Linux bottom right, always offset by the taskbar height: an auto-hidden taskbar can't be detected, and it must not cover the card when it slides out. Choosing a position comes after the MVP.
- The card doesn't show over full-screen apps (default behaviour on macOS for a regular always-on-top window; to be checked in games on Windows).
- Menu bar/tray icon: show now, pause, words, settings, quit.
- First launch asks what you study, the translation language and the level.
- Local JSON storage in userData. Records carry `updatedAt` for later sync.

## Auto-update
- Source: public GitHub releases of this repository, so the app holds no token.
- Windows: electron-updater. macOS: our own installer, because Squirrel requires a Developer ID. Authenticity on macOS relies on TLS and the sha512 from the release, with no Apple signature.
- Checks at launch and every 6 hours. Installs without asking once the card is hidden and settings are closed.

## Web (stage 2)
- Domain: cards.mtkv.ru.
- The same mechanics in a regular tab: the card sits in the page and doesn't pop up.
- Node, Express and PostgreSQL, with email and password sign-in and cookie sessions. Deployed with Docker Compose on Dokploy.
- Offline: desktop and web work without a network and sync when back online (last change wins, per word).

## Queue
1. Choose the product name.
2. Web version and Docker Compose for Dokploy.
3. Add Japanese as a study and translation language.

## Later (not in the MVP)
- Configurable card appearance and position.
- iOS/Android widgets.
- Developer ID and a Windows certificate, to remove first-launch warnings.
- More languages beyond Japanese.
