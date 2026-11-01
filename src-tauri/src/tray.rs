//! Menu bar / system tray icon. Actions go to the card window, which owns the deck.
use crate::updater;
use std::sync::Mutex;
use tauri::image::Image;
use tauri::menu::{Menu, MenuItem, PredefinedMenuItem};
use tauri::tray::TrayIconBuilder;
use tauri::{AppHandle, Emitter, Manager, Wry};

const ICON_PNG: &[u8] = if cfg!(target_os = "macos") {
    include_bytes!("../../assets/trayTemplate@2x.png")
} else {
    include_bytes!("../../assets/tray.png")
};

pub struct TrayItems {
    show: MenuItem<Wry>,
    pause: MenuItem<Wry>,
    update: MenuItem<Wry>,
    ready: Mutex<bool>,
}

pub enum UpdateLabel<'a> {
    Check,
    Downloading(&'a str),
    Ready(&'a str),
}

pub fn set_update_label(app: &AppHandle, label: UpdateLabel) {
    let items = app.state::<TrayItems>();
    let (text, enabled, ready) = match label {
        UpdateLabel::Check => ("Проверить обновления".to_string(), true, false),
        UpdateLabel::Downloading(v) => (format!("Загружается {v}…"), false, false),
        UpdateLabel::Ready(v) => (format!("Обновить до {v}"), true, true),
    };
    let _ = items.update.set_text(text);
    let _ = items.update.set_enabled(enabled);
    *items.ready.lock().unwrap() = ready;
}

fn on_update_click(app: &AppHandle) {
    if *app.state::<TrayItems>().ready.lock().unwrap() {
        updater::install(app);
        return;
    }
    let app = app.clone();
    tauri::async_runtime::spawn(async move {
        let _ = updater::check(&app).await;
    });
}

pub fn build(app: &AppHandle) -> tauri::Result<()> {
    let show = MenuItem::with_id(app, "show", "Показать карточку", false, None::<&str>)?;
    let pause = MenuItem::with_id(app, "pause", "Пауза", true, None::<&str>)?;
    let settings = MenuItem::with_id(app, "settings", "Слова и настройки…", true, None::<&str>)?;
    let version = format!("Vocapeek {}", app.package_info().version);
    let version = MenuItem::with_id(app, "version", version, false, None::<&str>)?;
    let update = MenuItem::with_id(app, "update", "Проверить обновления", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "Выход", true, None::<&str>)?;
    let sep = || PredefinedMenuItem::separator(app);
    let menu = Menu::with_items(
        app,
        &[&show, &pause, &sep()?, &settings, &sep()?, &version, &update, &sep()?, &quit],
    )?;
    TrayIconBuilder::with_id("main")
        .icon(Image::from_bytes(ICON_PNG)?)
        .icon_as_template(cfg!(target_os = "macos"))
        .tooltip("Vocapeek")
        .menu(&menu)
        .on_menu_event(|app, event| match event.id().as_ref() {
            "show" => drop(app.emit_to("card", "tray:show", ())),
            "pause" => drop(app.emit_to("card", "tray:pause", ())),
            "settings" => crate::open_settings_window(app),
            "update" => on_update_click(app),
            "quit" => app.exit(0),
            _ => {}
        })
        .build(app)?;
    app.manage(TrayItems { show, pause, update, ready: Mutex::new(false) });
    Ok(())
}

pub fn set_state(app: &AppHandle, paused: bool, onboarded: bool) {
    let items = app.state::<TrayItems>();
    let _ = items.pause.set_text(if paused { "Продолжить" } else { "Пауза" });
    let _ = items.show.set_enabled(onboarded);
}
