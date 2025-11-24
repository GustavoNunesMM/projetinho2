use tauri_plugin_dialog;
use tauri_plugin_log::{Target, TargetKind, TimezoneStrategy};
use tauri_plugin_updater::UpdaterExt;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(
    tauri_plugin_log::Builder::new()
        .targets([
            Target::new(TargetKind::LogDir { file_name: Some("app.log".into()) }),
            Target::new(TargetKind::Stdout),
            Target::new(TargetKind::Webview),
        ])
        .timezone_strategy(TimezoneStrategy::UseLocal)
        .build(),
)
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            // Verificar atualização em background após 5 segundos
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                tokio::time::sleep(tokio::time::Duration::from_secs(5)).await;
                
                match handle.updater() {
                    Ok(updater) => {
                        match updater.check().await {
                            Ok(Some(update)) => {
                                log::info!(
                                    "Nova atualização disponível: {} (atual: {})",
                                    update.version,
                                    update.current_version
                                );
                            }
                            Ok(None) => {
                                log::info!("Aplicação está atualizada");
                            }
                            Err(e) => {
                                log::error!("Erro ao verificar atualizações: {}", e);
                            }
                        }
                    }
                    Err(e) => {
                        log::error!("Erro ao inicializar updater: {}", e);
                    }
                }
            });
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("erro ao executar aplicação tauri");
}