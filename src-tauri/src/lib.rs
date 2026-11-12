mod hello;
mod vault;

use std::sync::Mutex;

use tauri::menu::{Menu, MenuItem, PredefinedMenuItem};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::{AppHandle, Emitter, Manager, State, WebviewWindow};
use vault::{Session, Vault, VaultData};

struct AppState {
    session: Mutex<Option<Session>>,
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct HelloStatus {
    available: bool,
    enabled: bool,
}

fn default_vault() -> Vault {
    Vault::at(Vault::default_path())
}

fn show_main(app: &AppHandle) {
    eprintln!("[chaves] show_main");
    if let Some(window) = app.get_webview_window("main") {
        eprintln!("[chaves] janela main encontrada");
        let _ = window.show();
        let _ = window.set_focus();
    } else {
        eprintln!("[chaves] janela main ausente");
    }
}

#[tauri::command]
fn vault_exists() -> bool {
    default_vault().exists()
}

#[tauri::command]
fn vault_path() -> String {
    default_vault().path().display().to_string()
}

#[tauri::command]
async fn create_vault(password: String, state: State<'_, AppState>) -> Result<VaultData, String> {
    let (session, data) = tauri::async_runtime::spawn_blocking(move || {
        default_vault().create(&password)
    })
    .await
    .map_err(|err| format!("Falha interna: {err}"))??;

    *state.session.lock().unwrap() = Some(session);
    Ok(data)
}

#[tauri::command]
async fn unlock_vault(password: String, state: State<'_, AppState>) -> Result<VaultData, String> {
    let (session, data) = tauri::async_runtime::spawn_blocking(move || {
        default_vault().unlock(&password)
    })
    .await
    .map_err(|err| format!("Falha interna: {err}"))??;

    *state.session.lock().unwrap() = Some(session);
    Ok(data)
}

#[tauri::command]
async fn save_vault(data: VaultData, state: State<'_, AppState>) -> Result<(), String> {
    let session = state
        .session
        .lock()
        .unwrap()
        .clone()
        .ok_or_else(|| "Cofre trancado.".to_string())?;

    tauri::async_runtime::spawn_blocking(move || default_vault().save(&session, &data))
        .await
        .map_err(|err| format!("Falha interna: {err}"))?
}

#[tauri::command]
fn lock_vault(state: State<'_, AppState>) {
    *state.session.lock().unwrap() = None;
}

#[tauri::command]
async fn hello_status() -> HelloStatus {
    tauri::async_runtime::spawn_blocking(|| {
        let available = hello::available().unwrap_or(false);
        HelloStatus {
            available,
            enabled: hello::enabled(),
        }
    })
    .await
    .unwrap_or(HelloStatus {
        available: false,
        enabled: false,
    })
}

#[tauri::command]
async fn enable_hello(password: String) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || {
        default_vault().unlock(&password).map(|_| ())?;
        hello::enable(&password)
    })
    .await
    .map_err(|err| format!("Falha interna: {err}"))?
}

#[tauri::command]
fn disable_hello() -> Result<(), String> {
    hello::disable()
}

#[tauri::command]
async fn unlock_with_hello(state: State<'_, AppState>) -> Result<VaultData, String> {
    let (session, data) = tauri::async_runtime::spawn_blocking(|| {
        let password = hello::unlock_password()?;
        default_vault().unlock(&password)
    })
    .await
    .map_err(|err| format!("Falha interna: {err}"))??;

    *state.session.lock().unwrap() = Some(session);
    Ok(data)
}

#[tauri::command]
fn hide_to_tray(window: WebviewWindow) {
    let _ = window.hide();
}

#[tauri::command]
fn quit_app(app: AppHandle) {
    app.exit(0);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            eprintln!("[chaves] segunda instância detectada");
            show_main(app);
        }))
        .plugin(tauri_plugin_opener::init())
        .manage(AppState {
            session: Mutex::new(None),
        })
        .setup(|app| {
            let show = MenuItem::with_id(app, "show", "Abrir Chaves", true, None::<&str>)?;
            let lock = MenuItem::with_id(app, "lock", "Bloquear", true, None::<&str>)?;
            let quit = MenuItem::with_id(app, "quit", "Sair", true, None::<&str>)?;
            let separator = PredefinedMenuItem::separator(app)?;
            let menu = Menu::with_items(app, &[&show, &lock, &separator, &quit])?;

            let mut builder = TrayIconBuilder::new()
                .tooltip("Chaves")
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_menu_event(|app, event| match event.id().as_ref() {
                    "show" => show_main(app),
                    "lock" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                            let _ = window.emit("tray-lock", ());
                        }
                    }
                    "quit" => app.exit(0),
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        show_main(tray.app_handle());
                    }
                });

            if let Some(icon) = app.default_window_icon() {
                builder = builder.icon(icon.clone());
            }
            builder.build(app)?;
            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                eprintln!("[chaves] pedido de fechamento em {}", window.label());
                api.prevent_close();
                eprintln!("[chaves] fechamento prevenido");
                let _ = window.emit("close-requested", ());
            }
        })
        .invoke_handler(tauri::generate_handler![
            vault_exists,
            vault_path,
            create_vault,
            unlock_vault,
            save_vault,
            lock_vault,
            hello_status,
            enable_hello,
            disable_hello,
            unlock_with_hello,
            hide_to_tray,
            quit_app
        ])
        .run(tauri::generate_context!())
        .expect("falha ao iniciar o aplicativo");
}
