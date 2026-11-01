//! Thin native shell: windows, tray, timer, state file, updates.
//! Deck logic lives in src/core/deck.js, shared with the web version.
mod position;
mod state;
mod tray;
mod updater;

use position::{card_position, Rect};
use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};
use std::time::Duration;
use tauri::{
    AppHandle, Emitter, LogicalPosition, LogicalSize, Manager, RunEvent, State, WebviewUrl,
    WebviewWindow, WebviewWindowBuilder,
};

const CARD_SIZE: (f64, f64) = (400.0, 136.0);
const SMOKE_TIMEOUT: Duration = Duration::from_secs(60);

/// State the window commands share. Test modes keep their data in their own folder.
pub struct Shell {
    store: state::Store,
    smoke_dir: Option<PathBuf>,
    timer: AtomicU64,
    visible: AtomicBool,
}

impl Shell {
    pub fn card_visible(&self) -> bool {
        self.visible.load(Ordering::SeqCst)
    }
}

fn place_card(window: &WebviewWindow) -> tauri::Result<()> {
    let Some(monitor) = window.primary_monitor()? else { return Ok(()) };
    let scale = monitor.scale_factor();
    let rect = |x: i32, y: i32, width: u32, height: u32| Rect {
        x: f64::from(x) / scale,
        y: f64::from(y) / scale,
        width: f64::from(width) / scale,
        height: f64::from(height) / scale,
    };
    let (pos, size) = (monitor.position(), monitor.size());
    let bounds = rect(pos.x, pos.y, size.width, size.height);
    let work = monitor.work_area();
    let work = rect(work.position.x, work.position.y, work.size.width, work.size.height);
    let (x, y) = card_position(bounds, work, CARD_SIZE, cfg!(target_os = "macos"));
    window.set_position(LogicalPosition::new(x, y))
}

#[tauri::command]
fn state_read(shell: State<Shell>) -> (u64, Option<String>) {
    shell.store.read()
}

#[tauri::command]
fn state_write(shell: State<Shell>, revision: u64, json: String) -> Result<bool, String> {
    shell.store.write(revision, &json).map_err(|e| e.to_string())
}

#[tauri::command]
fn card_show(app: AppHandle, shell: State<Shell>) -> Result<(), String> {
    let window = app.get_webview_window("card").ok_or("no card window")?;
    place_card(&window).map_err(|e| e.to_string())?;
    window.show().map_err(|e| e.to_string())?;
    shell.visible.store(true, Ordering::SeqCst);
    Ok(())
}

#[tauri::command]
fn card_hide(app: AppHandle, shell: State<Shell>) -> Result<(), String> {
    let window = app.get_webview_window("card").ok_or("no card window")?;
    window.hide().map_err(|e| e.to_string())?;
    shell.visible.store(false, Ordering::SeqCst);
    Ok(())
}

/// Runs in Rust because webview timers are throttled while the card window is hidden.
/// A new call replaces the pending one; `sec: null` only cancels.
#[tauri::command]
fn schedule(app: AppHandle, shell: State<Shell>, sec: Option<f64>) {
    let id = shell.timer.fetch_add(1, Ordering::SeqCst) + 1;
    let Some(sec) = sec else { return };
    tauri::async_runtime::spawn(async move {
        tokio::time::sleep(Duration::from_secs_f64(sec.max(0.0))).await;
        if app.state::<Shell>().timer.load(Ordering::SeqCst) == id {
            let _ = app.emit_to("card", "tick", ());
        }
    });
}

#[tauri::command]
fn open_settings(app: AppHandle) {
    open_settings_window(&app);
}

#[tauri::command]
fn tray_update(app: AppHandle, paused: bool, onboarded: bool) {
    tray::set_state(&app, paused, onboarded);
}

#[tauri::command]
fn smoke_active(shell: State<Shell>) -> bool {
    shell.smoke_dir.is_some()
}

#[tauri::command]
fn smoke_report(app: AppHandle, shell: State<Shell>, json: String) {
    if let Some(dir) = &shell.smoke_dir {
        let _ = std::fs::write(dir.join("smoke-state.json"), json);
    }
    app.exit(0);
}

/// On its own thread: on Windows, creating a window from a synchronous command or an event
/// handler deadlocks. If two calls race, the second build fails on the taken label.
pub fn open_settings_window(app: &AppHandle) {
    let app = app.clone();
    std::thread::spawn(move || {
        if let Some(window) = app.get_webview_window("settings") {
            let _ = window.show();
            let _ = window.set_focus();
            return;
        }
        let built = WebviewWindowBuilder::new(&app, "settings", WebviewUrl::App("settings.html".into()))
            .title("Vocapeek")
            .inner_size(620.0, 720.0)
            .min_inner_size(480.0, 400.0)
            .build();
        if let Ok(window) = built {
            let _ = window.set_focus();
        }
    });
}

fn create_card_window(app: &AppHandle) -> tauri::Result<()> {
    let window = WebviewWindowBuilder::new(app, "card", WebviewUrl::App("card.html".into()))
        .title("Vocapeek")
        .inner_size(CARD_SIZE.0, CARD_SIZE.1)
        .decorations(false)
        .transparent(true)
        .shadow(false)
        .resizable(false)
        .skip_taskbar(true)
        .always_on_top(true)
        .visible_on_all_workspaces(true)
        .focused(false)
        .focusable(false)
        .accept_first_mouse(true)
        .visible(false)
        .build()?;
    window.set_size(LogicalSize::new(CARD_SIZE.0, CARD_SIZE.1))
}

/// Electron releases were named Cards: bring over progress and remove the old Windows app.
fn migrate_from_electron(app: &AppHandle, data_dir: &std::path::Path) {
    if let Ok(config) = app.path().config_dir() {
        if let Err(err) = state::migrate_legacy(data_dir, &config.join("Cards")) {
            updater::log(app, &format!("migration failed: {err}"));
        }
    }
    #[cfg(windows)]
    if let Ok(local) = app.path().local_data_dir() {
        let uninstaller = local.join("Programs").join("Cards").join("Uninstall Cards.exe");
        if uninstaller.exists() {
            let _ = std::process::Command::new(uninstaller).arg("/S").spawn();
        }
    }
}

fn setup(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    #[cfg(target_os = "macos")]
    app.set_activation_policy(tauri::ActivationPolicy::Accessory)?;

    updater::log(app, &format!("started {}", app.package_info().version));
    if std::env::var_os("CARDS_UPDATE_TEST").is_some() {
        app.manage(updater::UpdateState::default());
        tray::build(app)?;
        updater::run_test(app.clone());
        return Ok(());
    }
    let smoke_dir = std::env::var_os("CARDS_SMOKE").map(PathBuf::from);
    // The update test smokes the real profile; other smoke runs must not touch the installation.
    let real_profile = smoke_dir.is_none() || std::env::var_os("CARDS_SMOKE_REAL_PROFILE").is_some();
    let data_dir = match &smoke_dir {
        Some(dir) if !real_profile => dir.clone(),
        _ => app.path().app_data_dir()?,
    };
    if real_profile {
        migrate_from_electron(app, &data_dir);
    }
    let smoking = smoke_dir.is_some();
    app.manage(Shell {
        store: state::Store::new(data_dir),
        smoke_dir,
        timer: AtomicU64::new(0),
        visible: AtomicBool::new(false),
    });
    app.manage(updater::UpdateState::default());
    tray::build(app)?;
    create_card_window(app)?;
    if smoking {
        let app = app.clone();
        tauri::async_runtime::spawn(async move {
            tokio::time::sleep(SMOKE_TIMEOUT).await;
            app.exit(3);
        });
    } else if !cfg!(debug_assertions) {
        updater::start(app.clone());
    }
    Ok(())
}

pub fn run() {
    let context = tauri::generate_context!();
    let app = tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _, _| open_settings_window(app)))
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            state_read, state_write, card_show, card_hide, schedule, open_settings, tray_update,
            smoke_active, smoke_report
        ])
        .setup(|app| setup(app.handle()))
        .build(context)
        .expect("failed to start");
    app.run(|_, event| {
        // Tray app: closing the settings window must not quit.
        if let RunEvent::ExitRequested { code: None, api, .. } = event {
            api.prevent_exit();
        }
    });
}
