use tauri_plugin_log::{Target, TargetKind, TimezoneStrategy};
use tauri_plugin_updater::UpdaterExt;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(
            tauri_plugin_log::Builder::new()
                .targets([
                    Target::new(TargetKind::LogDir {
                        file_name: Some("app.log".into()),
                    }),
                    Target::new(TargetKind::Stdout),
                    Target::new(TargetKind::Webview),
                ])
                .timezone_strategy(TimezoneStrategy::UseLocal)
                .build(),
        )
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            log::info!("Iniciando aplicação Banco de Questões...");
            log::info!("Versão: {}", app.package_info().version);

            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                tokio::time::sleep(tokio::time::Duration::from_secs(5)).await;

                match handle.updater() {
                    Ok(updater) => match updater.check().await {
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
                    },
                    Err(e) => {
                        log::error!("Erro ao inicializar updater: {}", e);
                    }
                }
            });

            log::info!("Setup concluído com sucesso!");
            Ok(())
        })
        .on_page_load(|window, _payload| {
            log::info!("Página carregada na janela: {}", window.label());
        })
        .run(tauri::generate_context!())
        .expect("Erro ao executar aplicação Tauri");
}