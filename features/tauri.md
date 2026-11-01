# Move the desktop app from Electron to Tauri

Why: the Electron build is 258 MB on disk and 111–117 MB to download, 97% of it Chromium and Node.js.

## Decisions
- Tauri 2. The product ships as Vocapeek, so the Electron 0.2.0 rename is skipped and the first Tauri release does both.
- Rust stays thin: windows, tray, timer, state file, updater. Deck logic stays in `src/core/deck.js`, shared with the web version. The UI stays in `src/renderer`.
- Bundle identifier stays `ru.mtkv.cards`, which installed Mac apps verify before updating.
- Updates: the Tauri updater with our own signing key, kept in `.env` locally and in Actions secrets. Silent install when the card is hidden and settings are closed, as now.
- Windows installer: visible, with windows, so an install is never silent. Launching the app gives visible feedback.

## Moving installed Electron copies
- Electron 0.1.4 reads `latest.yml` and `latest-mac.yml`, so the first Tauri release also publishes those files, pointing at a Mac zip of `Vocapeek.app` and the Windows installer.
- First launch copies `cards-state.json` from the old Cards data folder. The old file stays as a backup.
- On Windows the Electron app sits in a different folder, so first launch runs its uninstaller silently.
- Electron copies older than 0.1.4 on macOS expect `Cards.app` and need one manual install.

## Must be verified before release
- `update-e2e` from Electron 0.1.4 to Tauri, and then from Tauri to the next Tauri release, on macOS and Windows.
- Progress survives the move.
- On real machines: the card never takes focus, sits above other windows, shows no window over full-screen apps, and clicks on the tick work without focus.
- Speech works in WebKit (macOS) and WebView2 (Windows).
- Timers keep running while the card window is hidden.
