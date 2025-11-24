#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri_plugin_dialog;
use tauri_plugin_log;
use tauri_plugin_updater::UpdaterExt;
use tauri_plugin_fs;
use tauri_plugin_sql;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_log::Builder::default().build())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                tokio::time::sleep(tokio::time::Duration::from_secs(5)).await;

                match handle.updater() {
                    Ok(updater) => match updater.check().await {
                        Ok(Some(_)) => log::info!("Update available"),
                        Ok(None) => {}
                        Err(e) => log::error!("Failed to check for updates: {}", e),
                    },
                    Err(e) => log::error!("Updater not initialized: {}", e),
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn main() {
    run();
}