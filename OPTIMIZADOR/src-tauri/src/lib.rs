use std::path::{Path, PathBuf};
use std::fs::{self, File};
use std::io::{self, Read, Write};
use tauri::Manager;

#[derive(serde::Serialize, serde::Deserialize, Debug)]
pub struct RutaInfo {
    valido: bool,
    ruta_raiz: String,
    ruta_config: String,
    tiene_backup: bool,
    mensaje: String,
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
struct ConfigPersistida {
    ruta_raiz: String,
    ruta_config: String,
}

fn obtener_config_path(app_handle: &tauri::AppHandle) -> PathBuf {
    app_handle.path().app_config_dir()
        .unwrap_or_else(|_| {
            let appdata = std::env::var("APPDATA").unwrap_or_else(|_| ".".to_string());
            Path::new(&appdata).join("PoxiARKOptimizer")
        })
        .join("config.json")
}

fn guardar_config(app_handle: &tauri::AppHandle, ruta_raiz: &str, ruta_config: &str) {
    let config_path = obtener_config_path(app_handle);
    if let Some(parent) = config_path.parent() {
        let _ = fs::create_dir_all(parent);
    }
    let config = ConfigPersistida {
        ruta_raiz: ruta_raiz.to_string(),
        ruta_config: ruta_config.to_string(),
    };
    if let Ok(json) = serde_json::to_string(&config) {
        let _ = fs::write(config_path, json);
    }
}

fn leer_config(app_handle: &tauri::AppHandle) -> Option<ConfigPersistida> {
    let path = obtener_config_path(app_handle);
    if path.exists() {
        if let Ok(contenido) = fs::read_to_string(path) {
            if let Ok(config) = serde_json::from_str::<ConfigPersistida>(&contenido) {
                return Some(config);
            }
        }
    }
    None
}

// Busca la ruta de Steam y de ARK en el registro o rutas por defecto
#[tauri::command]
fn detectar_ruta_ark(app_handle: tauri::AppHandle) -> RutaInfo {
    // 0. Intentar cargar configuración guardada en AppData
    if let Some(config_guardada) = leer_config(&app_handle) {
        let config_dir = PathBuf::from(&config_guardada.ruta_config);
        if config_dir.exists() {
            let backup_exist = config_dir.join("Engine.ini.bak").exists() || config_dir.join("GameUserSettings.ini.bak").exists();
            return RutaInfo {
                valido: true,
                ruta_raiz: config_guardada.ruta_raiz,
                ruta_config: config_guardada.ruta_config,
                tiene_backup: backup_exist,
                mensaje: "¡Cargada tu ruta de ARK desde AppData!".to_string(),
            };
        }
    }

    // 1. Intentar leer del registro de Windows
    let mut path_opt: Option<PathBuf> = None;

    #[cfg(target_os = "windows")]
    {
        use winreg::enums::*;
        use winreg::RegKey;

        let hkcu = RegKey::predef(HKEY_CURRENT_USER);
        if let Ok(steam_key) = hkcu.open_subkey("Software\\Valve\\Steam") {
            if let Ok(steam_path_str) = steam_key.get_value::<String, _>("SteamPath") {
                let steam_path = Path::new(&steam_path_str);
                let ark_path = steam_path.join("steamapps").join("common").join("ARK");
                if ark_path.exists() {
                    path_opt = Some(ark_path);
                }
            }
        }

        if path_opt.is_none() {
            let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
            if let Ok(steam_key) = hklm.open_subkey("SOFTWARE\\WOW6432Node\\Valve\\Steam") {
                if let Ok(steam_path_str) = steam_key.get_value::<String, _>("InstallPath") {
                    let steam_path = Path::new(&steam_path_str);
                    let ark_path = steam_path.join("steamapps").join("common").join("ARK");
                    if ark_path.exists() {
                        path_opt = Some(ark_path);
                    }
                }
            }
        }
    }

    // 2. Ruta común por defecto si no se detectó en registro
    if path_opt.is_none() {
        let default_path = PathBuf::from("C:\\Program Files (x86)\\Steam\\steamapps\\common\\ARK");
        if default_path.exists() {
            path_opt = Some(default_path);
        }
    }

    // 3. Evaluar la ruta encontrada
    if let Some(ark_path) = path_opt {
        let config_dir = ark_path.join("ShooterGame").join("Saved").join("Config").join("WindowsNoEditor");
        let valid = config_dir.exists();
        let backup_exist = config_dir.join("Engine.ini.bak").exists() || config_dir.join("GameUserSettings.ini.bak").exists();

        if valid {
            guardar_config(&app_handle, &ark_path.to_string_lossy(), &config_dir.to_string_lossy());
        }

        return RutaInfo {
            valido: valid,
            ruta_raiz: ark_path.to_string_lossy().to_string(),
            ruta_config: config_dir.to_string_lossy().to_string(),
            tiene_backup: backup_exist,
            mensaje: if valid { 
                "¡ARK detectado automáticamente con éxito!".to_string() 
            } else { 
                "Se encontró la carpeta de ARK pero faltan los directorios de configuración. Inicia el juego al menos una vez.".to_string() 
            },
        };
    }

    RutaInfo {
        valido: false,
        ruta_raiz: "".to_string(),
        ruta_config: "".to_string(),
        tiene_backup: false,
        mensaje: "No se pudo detectar la instalación de ARK automáticamente. Selecciónala manualmente.".to_string(),
    }
}

// Diálogo de selección manual usando rfd nativo
#[tauri::command]
fn seleccionar_ruta_manual(app_handle: tauri::AppHandle) -> RutaInfo {
    let dialog = rfd::FileDialog::new()
        .set_title("Selecciona la carpeta de instalación de ARK")
        .pick_folder();

    if let Some(folder_path) = dialog {
        // Verificar si es la raíz (ARK) o directamente la de configs (WindowsNoEditor)
        let config_dir = if folder_path.ends_with("WindowsNoEditor") {
            folder_path.clone()
        } else if folder_path.ends_with("ARK") {
            folder_path.join("ShooterGame").join("Saved").join("Config").join("WindowsNoEditor")
        } else {
            // Intentar buscar ShooterGame en la carpeta seleccionada por si la renombraron o seleccionaron steamapps/common
            let test_path = folder_path.join("ShooterGame").join("Saved").join("Config").join("WindowsNoEditor");
            if test_path.exists() {
                test_path
            } else {
                // Si eligen ShooterGame
                let test_sg = folder_path.join("Saved").join("Config").join("WindowsNoEditor");
                if test_sg.exists() {
                    test_sg
                } else {
                    folder_path.join("WindowsNoEditor") // Como fallback
                }
            }
        };

        let valid = config_dir.exists();
        let backup_exist = config_dir.join("Engine.ini.bak").exists() || config_dir.join("GameUserSettings.ini.bak").exists();
        let root_str = folder_path.to_string_lossy().to_string();

        if valid {
            guardar_config(&app_handle, &root_str, &config_dir.to_string_lossy());
        }

        return RutaInfo {
            valido: valid,
            ruta_raiz: root_str,
            ruta_config: config_dir.to_string_lossy().to_string(),
            tiene_backup: backup_exist,
            mensaje: if valid {
                "Carpeta seleccionada y validada correctamente.".to_string()
            } else {
                "La carpeta seleccionada no parece contener las configuraciones de ARK. Asegúrate de iniciar el juego al menos una vez.".to_string()
            },
        };
    }

    RutaInfo {
        valido: false,
        ruta_raiz: "".to_string(),
        ruta_config: "".to_string(),
        tiene_backup: false,
        mensaje: "Selección cancelada por el usuario.".to_string(),
    }
}

// Helper para leer un archivo seguro como string
fn leer_archivo_seguro(path: &Path) -> io::Result<String> {
    let mut file = File::open(path)?;
    let mut bytes = Vec::new();
    file.read_to_end(&mut bytes)?;
    
    // Verificar si es UTF-16
    if bytes.len() >= 2 && ((bytes[0] == 0xFF && bytes[1] == 0xFE) || (bytes[0] == 0xFE && bytes[1] == 0xFF)) {
        // Es UTF-16, decodificar
        let mut u16_chars = Vec::new();
        let is_le = bytes[0] == 0xFF;
        let start = 2;
        for chunk in bytes[start..].chunks_exact(2) {
            let val = if is_le {
                ((chunk[1] as u16) << 8) | (chunk[0] as u16)
            } else {
                ((chunk[0] as u16) << 8) | (chunk[1] as u16)
            };
            u16_chars.push(val);
        }
        return Ok(String::from_utf16_lossy(&u16_chars));
    }
    
    // Si no, decodificar como UTF-8 / ASCII normal
    Ok(String::from_utf8_lossy(&bytes).into_owned())
}

// Helper para guardar archivo de texto simple
fn escribir_archivo_seguro(path: &Path, content: &str) -> io::Result<()> {
    let mut file = File::create(path)?;
    file.write_all(content.as_bytes())?;
    Ok(())
}

// Aplica las optimizaciones avanzadas de ARK en los archivos .ini
#[tauri::command]
fn aplicar_optimizacion(ruta_config: String) -> Result<String, String> {
    let config_path = Path::new(&ruta_config);
    if !config_path.exists() {
        return Err("La ruta de configuración no existe.".to_string());
    }

    let engine_file = config_path.join("Engine.ini");
    let gus_file = config_path.join("GameUserSettings.ini");

    // 1. Crear backups si no existen
    let engine_bak = config_path.join("Engine.ini.bak");
    let gus_bak = config_path.join("GameUserSettings.ini.bak");

    if engine_file.exists() && !engine_bak.exists() {
        if let Err(e) = fs::copy(&engine_file, &engine_bak) {
            return Err(format!("Error al respaldar Engine.ini: {}", e));
        }
    }
    if gus_file.exists() && !gus_bak.exists() {
        if let Err(e) = fs::copy(&gus_file, &gus_bak) {
            return Err(format!("Error al respaldar GameUserSettings.ini: {}", e));
        }
    }

    // 2. Modificar Engine.ini con tweaks avanzados de Unreal Engine 4 para FPS
    let mut engine_content = if engine_file.exists() {
        leer_archivo_seguro(&engine_file).unwrap_or_default()
    } else {
        "".to_string()
    };

    // Remover bloques anteriores de [SystemSettings] si existen para sobreescribir limpiamente
    let mut lineas: Vec<String> = engine_content.lines().map(|s| s.to_string()).collect();
    let mut index_system_settings = None;
    for (i, line) in lineas.iter().enumerate() {
        if line.trim().to_lowercase() == "[systemsettings]" {
            index_system_settings = Some(i);
            break;
        }
    }

    // Si existe la sección [SystemSettings], la cortamos desde ahí
    if let Some(idx) = index_system_settings {
        lineas.truncate(idx);
    }

    // Reconstruir sin la sección [SystemSettings] vieja y añadir la nueva hiper-optimizada
    let mut nuevas_lineas = lineas.join("\n");
    if !nuevas_lineas.ends_with('\n') && !nuevas_lineas.is_empty() {
        nuevas_lineas.push('\n');
    }

    let system_settings_bloque = "\
[SystemSettings]
r.DefaultFeature.Bloom=False
r.DefaultFeature.LensFlare=False
r.DefaultFeature.MotionBlur=False
r.DefaultFeature.DepthOfField=False
r.DefaultFeature.AmbientOcclusion=False
r.DefaultFeature.AutoExposure=False
r.SSAOSmartBlur=0
r.BlurGBuffer=0
r.ShadowQuality=3
r.Shadow.CSM.MaxCascades=2
r.Shadow.MaxResolution=1024
r.Shadow.DistanceScale=0.75
r.DistanceFieldShadows=1
r.SimpleDynamicLighting=1
r.Streaming.MipBias=0
r.Streaming.PoolSize=4096
r.Streaming.LimitPoolSizeToVRAM=1
r.Streaming.MaxTempMemoryAllowed=50
r.FinishCurrentFrame=0
r.EmitterSpawnRateScale=0.75
r.HZBOcclusion=1
r.LightShaftQuality=1
r.RefractionQuality=1
r.SceneColorFringeQuality=0
r.DynamicRes.MinSP=80.0
r.DynamicRes.MaxSP=100.0
";

    nuevas_lineas.push_str(system_settings_bloque);

    if let Err(e) = escribir_archivo_seguro(&engine_file, &nuevas_lineas) {
        return Err(format!("Error al escribir en Engine.ini: {}", e));
    }

    // 3. Modificar GameUserSettings.ini para configurar presets visuales Alto-Ultra balanceados
    if gus_file.exists() {
        let gus_content = leer_archivo_seguro(&gus_file).unwrap_or_default();
        let mut lineas_gus: Vec<String> = gus_content.lines().map(|s| s.to_string()).collect();

        // Reemplazar valores dentro de [ScalabilityGroups] y /Script/Engine.GameUserSettings
        let mut en_scalability = false;
        let mut en_user_settings = false;

        for line in lineas_gus.iter_mut() {
            let line_trimmed = line.trim().to_lowercase();
            if line_trimmed.starts_with('[') {
                en_scalability = line_trimmed == "[scalabilitygroups]";
                en_user_settings = line_trimmed == "[/script/engine.gameusersettings]";
                continue;
            }

            if en_scalability {
                if line_trimmed.starts_with("sg.resolutionquality") { *line = "sg.ResolutionQuality=100.000000".to_string(); }
                else if line_trimmed.starts_with("sg.viewdistancequality") { *line = "sg.ViewDistanceQuality=2".to_string(); } // Alto
                else if line_trimmed.starts_with("sg.antialiasingquality") { *line = "sg.AntiAliasingQuality=3".to_string(); } // Epic
                else if line_trimmed.starts_with("sg.shadowquality") { *line = "sg.ShadowQuality=1".to_string(); } // Shadow balanceado (Medium)
                else if line_trimmed.starts_with("sg.postprocessquality") { *line = "sg.PostProcessQuality=2".to_string(); } // Alto
                else if line_trimmed.starts_with("sg.texturequality") { *line = "sg.TextureQuality=3".to_string(); } // Ultra / Epic
                else if line_trimmed.starts_with("sg.effectsquality") { *line = "sg.EffectsQuality=2".to_string(); } // Alto
                else if line_trimmed.starts_with("sg.foliagequality") { *line = "sg.FoliageQuality=2".to_string(); } // Alto
            }

            if en_user_settings {
                if line_trimmed.starts_with("busevsync") { *line = "bUseVSync=False".to_string(); }
                else if line_trimmed.starts_with("busedynamicresolution") { *line = "bUseDynamicResolution=False".to_string(); }
            }
        }

        let nuevo_gus = lineas_gus.join("\n");
        if let Err(e) = escribir_archivo_seguro(&gus_file, &nuevo_gus) {
            return Err(format!("Error al guardar GameUserSettings.ini: {}", e));
        }
    }

    Ok("¡Optimizaciones aplicadas exitosamente! Disfruta de tus 80-90 FPS con gráficos espectaculares.".to_string())
}

// Restaura los archivos originales desde sus respaldos .bak
#[tauri::command]
fn restaurar_original(ruta_config: String) -> Result<String, String> {
    let config_path = Path::new(&ruta_config);
    if !config_path.exists() {
        return Err("La ruta de configuración no existe.".to_string());
    }

    let engine_file = config_path.join("Engine.ini");
    let gus_file = config_path.join("GameUserSettings.ini");
    let engine_bak = config_path.join("Engine.ini.bak");
    let gus_bak = config_path.join("GameUserSettings.ini.bak");

    let mut restaurado_alguno = false;

    if engine_bak.exists() {
        if let Err(e) = fs::copy(&engine_bak, &engine_file) {
            return Err(format!("Error al restaurar Engine.ini: {}", e));
        }
        let _ = fs::remove_file(&engine_bak);
        restaurado_alguno = true;
    }

    if gus_bak.exists() {
        if let Err(e) = fs::copy(&gus_bak, &gus_file) {
            return Err(format!("Error al restaurar GameUserSettings.ini: {}", e));
        }
        let _ = fs::remove_file(&gus_bak);
        restaurado_alguno = true;
    }

    if restaurado_alguno {
        Ok("¡Configuraciones originales restauradas con éxito!".to_string())
    } else {
        Err("No se encontraron copias de seguridad (.bak) para restaurar.".to_string())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            detectar_ruta_ark,
            seleccionar_ruta_manual,
            aplicar_optimizacion,
            restaurar_original
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
