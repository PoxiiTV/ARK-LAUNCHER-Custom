use std::net::UdpSocket;
use std::time::Duration;
use tauri::Manager;
use std::fs;

const SERVER_IP: &str = "167.17.71.121";
const QUERY_PORT: u16 = 25210;

#[derive(serde::Serialize)]
struct ServerInfo {
    online: bool,
    name: Option<String>,
    map: Option<String>,
    players: Option<u8>,
    max_players: Option<u8>,
    ping: Option<u32>,
    error: Option<String>,
}

#[tauri::command]
async fn check_server_status() -> ServerInfo {
    let start_time = std::time::Instant::now();
    let socket_addr = format!("{}:{}", SERVER_IP, QUERY_PORT);
    
    // Crear socket UDP
    let socket = match UdpSocket::bind("0.0.0.0:0") {
        Ok(s) => s,
        Err(e) => return ServerInfo {
            online: false,
            name: None,
            map: None,
            players: None,
            max_players: None,
            ping: None,
            error: Some(format!("Error en el socket: {}", e)),
        },
    };

    // Timeout de 3.5 segundos
    if let Err(e) = socket.set_read_timeout(Some(Duration::from_millis(3500))) {
        return ServerInfo {
            online: false,
            name: None,
            map: None,
            players: None,
            max_players: None,
            ping: None,
            error: Some(format!("Error de timeout: {}", e)),
        };
    }

    let mut base_request = vec![
        0xFF, 0xFF, 0xFF, 0xFF,
        0x54, // 'T' -> A2S_INFO
        0x53, 0x6F, 0x75, 0x72, 0x63, 0x65, 0x20, 0x45, 0x6E, 0x67, 0x69, 0x6E, 0x65, 0x20, 0x51, 0x75, 0x65, 0x72, 0x79, // 'Source Engine Query'
        0x00
    ];

    // Enviar petición inicial
    if let Err(e) = socket.send_to(&base_request, &socket_addr) {
        return ServerInfo {
            online: false,
            name: None,
            map: None,
            players: None,
            max_players: None,
            ping: None,
            error: Some(format!("Error al enviar: {}", e)),
        };
    }

    let mut buf = [0u8; 1400];
    let (mut amt, _) = match socket.recv_from(&mut buf) {
        Ok(res) => res,
        Err(e) => return ServerInfo {
            online: false,
            name: None,
            map: None,
            players: None,
            max_players: None,
            ping: None,
            error: Some(format!("Sin respuesta UDP (Timeout): {}", e)),
        },
    };

    // Si responde Challenge (0x41)
    if amt >= 9 && buf[4] == 0x41 {
        let challenge = &buf[5..9];
        base_request.extend_from_slice(challenge);

        // Volver a enviar con el challenge
        if let Err(e) = socket.send_to(&base_request, &socket_addr) {
            return ServerInfo {
                online: false,
                name: None,
                map: None,
                players: None,
                max_players: None,
                ping: None,
                error: Some(format!("Error al enviar challenge: {}", e)),
            };
        }

        // Recibir respuesta final
        let res = match socket.recv_from(&mut buf) {
            Ok(res) => res,
            Err(e) => return ServerInfo {
                online: false,
                name: None,
                map: None,
                players: None,
                max_players: None,
                ping: None,
                error: Some(format!("Error al recibir respuesta final: {}", e)),
            },
        };
        amt = res.0;
    }

    // Decodificar Info Response (0x49)
    if amt >= 5 && buf[4] == 0x49 {
        let mut offset = 5;
        // Omitir protocolo (1 byte)
        offset += 1;

        // Leer Strings terminados en null
        let name = match read_utf8_string(&buf[..amt], &mut offset) {
            Ok(s) => s,
            Err(e) => return ServerInfo { online: false, name: None, map: None, players: None, max_players: None, ping: None, error: Some(e.to_string()) },
        };

        let map = match read_utf8_string(&buf[..amt], &mut offset) {
            Ok(s) => s,
            Err(e) => return ServerInfo { online: false, name: None, map: None, players: None, max_players: None, ping: None, error: Some(e.to_string()) },
        };

        // Omitir Carpeta y Juego (2 strings)
        if let Err(e) = read_utf8_string(&buf[..amt], &mut offset) {
            return ServerInfo { online: false, name: None, map: None, players: None, max_players: None, ping: None, error: Some(e.to_string()) };
        }
        if let Err(e) = read_utf8_string(&buf[..amt], &mut offset) {
            return ServerInfo { online: false, name: None, map: None, players: None, max_players: None, ping: None, error: Some(e.to_string()) };
        }

        // Omitir App ID (2 bytes)
        offset += 2;

        if offset + 2 <= amt {
            let players = buf[offset];
            let max_players = buf[offset + 1];
            let ping = start_time.elapsed().as_millis() as u32;

            return ServerInfo {
                online: true,
                name: Some(name),
                map: Some(map),
                players: Some(players),
                max_players: Some(max_players),
                ping: Some(ping),
                error: None,
            };
        }
    }

    ServerInfo {
        online: false,
        name: None,
        map: None,
        players: None,
        max_players: None,
        ping: None,
        error: Some("Respuesta del servidor inválida".to_string()),
    }
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
struct LauncherConfig {
    is_first_run: bool,
    opt_cores: bool,
    opt_directx: bool,
    opt_sky: bool,
    opt_low_mem: bool,
    opt_nobattleye: bool,
}

fn get_config_dir() -> Result<std::path::PathBuf, String> {
    let appdata_path = std::env::var("APPDATA")
        .map_err(|e| format!("Error al obtener la variable de entorno APPDATA: {}", e))?;
    Ok(std::path::PathBuf::from(appdata_path).join("!PoxiARKLauncher"))
}

#[tauri::command]
fn get_launcher_config() -> Result<LauncherConfig, String> {
    let config_dir = get_config_dir()?;
    let config_path = config_dir.join("config.json");

    if !config_path.exists() {
        // Es la primera ejecución, crear directorio y guardar configuración por defecto
        if let Err(e) = fs::create_dir_all(&config_dir) {
            return Err(format!("No se pudo crear el directorio de configuración: {}", e));
        }

        let default_config = LauncherConfig {
            is_first_run: true,
            opt_cores: true,      // CPU Turbo ON por defecto
            opt_directx: false,
            opt_sky: false,
            opt_low_mem: false,
            opt_nobattleye: true, // BattlEye Off ON por defecto
        };

        let json_str = serde_json::to_string_pretty(&default_config)
            .map_err(|e| format!("Error al serializar config por defecto: {}", e))?;

        if let Err(e) = fs::write(&config_path, json_str) {
            return Err(format!("No se pudo escribir el archivo de configuración por defecto: {}", e));
        }

        return Ok(default_config);
    }

    // Si ya existe, leerlo y deserializarlo
    let content = fs::read_to_string(&config_path)
        .map_err(|e| format!("No se pudo leer el archivo de configuración: {}", e))?;

    let config: LauncherConfig = serde_json::from_str(&content)
        .map_err(|e| format!("Error al decodificar la configuración JSON: {}", e))?;

    Ok(config)
}

#[tauri::command]
fn save_launcher_config(config: LauncherConfig) -> Result<(), String> {
    let config_dir = get_config_dir()?;
    let config_path = config_dir.join("config.json");

    // Asegurar que guardamos con is_first_run: false
    let mut updated_config = config;
    updated_config.is_first_run = false;

    if let Err(e) = fs::create_dir_all(&config_dir) {
        return Err(format!("No se pudo crear el directorio de configuración: {}", e));
    }

    let json_str = serde_json::to_string_pretty(&updated_config)
        .map_err(|e| format!("Error al serializar configuración: {}", e))?;

    fs::write(&config_path, json_str)
        .map_err(|e| format!("No se pudo guardar la configuración: {}", e))?;

    Ok(())
}

#[tauri::command]
fn connect_to_server(args: Vec<String>) -> Result<(), String> {
    let mut steam_url = "steam://run/346110//+connect 167.17.71.121:25200%20+password%20elsaulesuntraidor".to_string();
    
    // Inyectar argumentos de optimización adicionales si el usuario los activó
    for arg in args {
        steam_url.push_str(&format!("%20{}", arg));
    }
    
    // Abrir de forma nativa e independiente de permisos de Tauri
    if let Err(e) = open::that(&steam_url) {
        return Err(e.to_string());
    }

    // Auto-cierre asíncrono con delay de 1 segundo para asegurar la comunicación con Steam
    std::thread::spawn(|| {
        std::thread::sleep(std::time::Duration::from_millis(1000));
        std::process::exit(0);
    });

    Ok(())
}

#[tauri::command]
fn close_app(window: tauri::Window) {
    let _ = window.close();
}

#[tauri::command]
fn minimize_app(window: tauri::Window) {
    let _ = window.minimize();
}

fn read_utf8_string(bytes: &[u8], offset: &mut usize) -> Result<String, &'static str> {
    let start = *offset;
    let mut end = start;
    while end < bytes.len() && bytes[end] != 0 {
        end += 1;
    }
    if end >= bytes.len() {
        return Err("String sin terminar en null");
    }
    *offset = end + 1;
    std::str::from_utf8(&bytes[start..end])
        .map(|s| s.to_string())
        .map_err(|_| "Error de decodificación UTF-8")
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            check_server_status, 
            connect_to_server, 
            close_app, 
            minimize_app,
            get_launcher_config,
            save_launcher_config
        ])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            // Centrar la ventana de forma explícita al abrirse
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.center();
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
