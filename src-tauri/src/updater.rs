//! Silent updates: check at start and every 6 hours, download, then install once idle.
use crate::tray;
use std::fs::OpenOptions;
use std::io::Write;
use std::sync::Mutex;
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use tauri::{AppHandle, Manager};
use tauri_plugin_updater::{Update, UpdaterExt};

const FIRST_CHECK: Duration = Duration::from_secs(30);
const CHECK_EVERY: Duration = Duration::from_secs(6 * 60 * 60);
const IDLE_POLL: Duration = Duration::from_secs(60);

#[derive(Default)]
pub struct UpdateState {
    pub ready: Mutex<Option<(Update, Vec<u8>)>>,
    pub busy: Mutex<bool>,
}

pub fn log(app: &AppHandle, message: &str) {
    let test_dir = std::env::var_os("CARDS_UPDATE_TEST").map(std::path::PathBuf::from);
    let Some(dir) = test_dir.or_else(|| app.path().app_data_dir().ok()) else { return };
    let _ = std::fs::create_dir_all(&dir);
    let secs = SystemTime::now().duration_since(UNIX_EPOCH).map_or(0, |d| d.as_secs());
    if let Ok(mut file) = OpenOptions::new().create(true).append(true).open(dir.join("update.log")) {
        let _ = writeln!(file, "{secs} {message}");
    }
}

/// Returns true when an update is downloaded and waiting to install.
pub async fn check(app: &AppHandle) -> Result<bool, String> {
    let state = app.state::<UpdateState>();
    if state.ready.lock().unwrap().is_some() {
        return Ok(true);
    }
    {
        let mut busy = state.busy.lock().unwrap();
        if *busy {
            return Ok(false);
        }
        *busy = true;
    }
    let result = download(app).await;
    *state.busy.lock().unwrap() = false;
    if let Err(err) = &result {
        log(app, &format!("error {err}"));
        tray::set_update_label(app, tray::UpdateLabel::Check);
    }
    result
}

async fn download(app: &AppHandle) -> Result<bool, String> {
    log(app, "checking");
    let updater = app.updater().map_err(|e| e.to_string())?;
    let Some(update) = updater.check().await.map_err(|e| e.to_string())? else {
        log(app, "up to date");
        return Ok(false);
    };
    log(app, &format!("downloading {}", update.version));
    tray::set_update_label(app, tray::UpdateLabel::Downloading(&update.version));
    let bytes = update.download(|_, _| {}, || {}).await.map_err(|e| e.to_string())?;
    log(app, &format!("ready {}", update.version));
    tray::set_update_label(app, tray::UpdateLabel::Ready(&update.version));
    *app.state::<UpdateState>().ready.lock().unwrap() = Some((update, bytes));
    Ok(true)
}

/// Installs a downloaded update and starts the new version. On Windows `update.install` never
/// returns: it hands over to the installer, which starts the app (the /R flag of passive mode).
pub fn install(app: &AppHandle) {
    let taken = app.state::<UpdateState>().ready.lock().unwrap().take();
    let Some((update, bytes)) = taken else { return };
    log(app, &format!("installing {}", update.version));
    if let Err(err) = update.install(bytes) {
        log(app, &format!("error {err}"));
        return;
    }
    app.restart();
}

fn is_idle(app: &AppHandle) -> bool {
    let shell = app.state::<crate::Shell>();
    !shell.card_visible() && app.get_webview_window("settings").is_none()
}

pub fn start(app: AppHandle) {
    let checker = app.clone();
    tauri::async_runtime::spawn(async move {
        tokio::time::sleep(FIRST_CHECK).await;
        loop {
            let _ = check(&checker).await;
            tokio::time::sleep(CHECK_EVERY).await;
        }
    });
    tauri::async_runtime::spawn(async move {
        loop {
            tokio::time::sleep(IDLE_POLL).await;
            let ready = app.state::<UpdateState>().ready.lock().unwrap().is_some();
            if ready && is_idle(&app) {
                install(&app);
            }
        }
    });
}

/// Update test (CARDS_UPDATE_TEST): check, download and install right away.
pub fn run_test(app: AppHandle) {
    tauri::async_runtime::spawn(async move {
        match check(&app).await {
            Ok(true) => install(&app),
            Ok(false) => app.exit(2),
            Err(_) => app.exit(1),
        }
    });
}
