/**
 * 🦖 POXI ARK LAUNCHER MAKER — Premium Generator 🛠️
 * Desarrollado con pasión para automatizar y crear ejecutables personalizados de ARK.
 */

const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');
const readline = require('readline');

// Códigos de colores ANSI para una consola gaming premium
const C_RESET = '\x1b[0m';
const C_CYAN = '\x1b[36m';
const C_MAGENTA = '\x1b[35m';
const C_GREEN = '\x1b[32m';
const C_RED = '\x1b[31m';
const C_YELLOW = '\x1b[33m';
const C_BRIGHT = '\x1b[1m';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Función para salir pausando la consola de forma nativa en Windows para que no se cierre sola
function exitMaker(code) {
    console.log(`\n${C_CYAN}======================================================================${C_RESET}`);
    console.log(`${C_YELLOW}  ⌨ Presiona cualquier tecla para cerrar esta ventana...${C_RESET}`);
    console.log(`${C_CYAN}======================================================================${C_RESET}\n`);
    try {
        // Pausa nativa de Windows ocultando el texto por defecto para un acabado premium
        spawnSync('cmd.exe', ['/c', 'pause > nul'], { stdio: 'inherit' });
    } catch (e) {
        // Fallback si no funciona el spawn sync
    }
    try {
        rl.close();
    } catch (e) {}
    process.exit(code);
}


// Rutas críticas del proyecto
const PATHS = {
    libRs: path.join(__dirname, 'src-tauri', 'src', 'lib.rs'),
    tauriConf: path.join(__dirname, 'src-tauri', 'tauri.conf.json'),
    indexHtml: path.join(__dirname, 'src-web', 'index.html'),
    iconsDir: path.join(__dirname, 'src-tauri', 'icons'),
    webIcon: path.join(__dirname, 'src-web', 'icono.ico'),
    backupDir: path.join(__dirname, 'maker-backups'),
    outputDir: path.join(__dirname, 'Distribucion_Launchers')
};

// Rutas dentro de la carpeta de backups
const BACKUPS = {
    libRs: path.join(PATHS.backupDir, 'lib.rs'),
    tauriConf: path.join(PATHS.backupDir, 'tauri.conf.json'),
    indexHtml: path.join(PATHS.backupDir, 'index.html'),
    webIcon: path.join(PATHS.backupDir, 'icono.ico'),
    iconsDir: path.join(PATHS.backupDir, 'icons')
};

let backupsCreated = false;

// Imprimir cabecera premium de ciencia ficción
function printHeader() {
    console.clear();
    console.log(`${C_CYAN}${C_BRIGHT}======================================================================${C_RESET}`);
    console.log(`${C_MAGENTA}${C_BRIGHT}   🦖  POXI ARK LAUNCHER MAKER v1.0.0 — Premium Generator  🛠️${C_RESET}`);
    console.log(`${C_CYAN}======================================================================${C_RESET}`);
    console.log(`${C_YELLOW}  Esta herramienta te permite crear un ejecutable portable .exe nuevo`);
    console.log(`  personalizado para cualquier servidor de ARK Survival Evolved.${C_RESET}`);
    console.log(`${C_CYAN}======================================================================${C_RESET}\n`);
}

// Pregunta asíncrona tipo Promesa
function ask(questionText, defaultValue = '') {
    const promptText = defaultValue 
        ? `${C_BRIGHT}${questionText}${C_RESET} [${C_CYAN}${defaultValue}${C_RESET}]: `
        : `${C_BRIGHT}${questionText}${C_RESET}: `;
        
    return new Promise((resolve) => {
        rl.question(promptText, (answer) => {
            resolve(answer.trim() || defaultValue);
        });
    });
}

// Copiar recursivamente directorios
function copyDirSync(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (let entry of entries) {
        let srcPath = path.join(src, entry.name);
        let destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDirSync(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// Crear copias de seguridad de seguridad de todos los archivos modificables
function createBackups() {
    console.log(`${C_YELLOW}📦 Creando copias de seguridad temporales del código original de Poxi...${C_RESET}`);
    try {
        if (!fs.existsSync(PATHS.backupDir)) {
            fs.mkdirSync(PATHS.backupDir, { recursive: true });
        }
        
        fs.copyFileSync(PATHS.libRs, BACKUPS.libRs);
        fs.copyFileSync(PATHS.tauriConf, BACKUPS.tauriConf);
        fs.copyFileSync(PATHS.indexHtml, BACKUPS.indexHtml);
        
        if (fs.existsSync(PATHS.webIcon)) {
            fs.copyFileSync(PATHS.webIcon, BACKUPS.webIcon);
        }
        
        if (fs.existsSync(PATHS.iconsDir)) {
            copyDirSync(PATHS.iconsDir, BACKUPS.iconsDir);
        }
        
        backupsCreated = true;
        console.log(`${C_GREEN}✔ Copias de seguridad de seguridad creadas correctamente.${C_RESET}\n`);
    } catch (e) {
        console.error(`${C_RED}❌ Error crítico al crear copias de seguridad de seguridad: ${e.message}${C_RESET}`);
        exitMaker(1);
    }
}

// Restaurar absolutamente todo el código original de Poxi
function restoreBackups() {
    if (!backupsCreated) return;
    console.log(`\n${C_YELLOW}♻ Restaurando el código original e intacto de Poxi ARK Launcher...${C_RESET}`);
    try {
        if (fs.existsSync(BACKUPS.libRs)) {
            fs.copyFileSync(BACKUPS.libRs, PATHS.libRs);
        }
        if (fs.existsSync(BACKUPS.tauriConf)) {
            fs.copyFileSync(BACKUPS.tauriConf, PATHS.tauriConf);
        }
        if (fs.existsSync(BACKUPS.indexHtml)) {
            fs.copyFileSync(BACKUPS.indexHtml, PATHS.indexHtml);
        }
        if (fs.existsSync(BACKUPS.webIcon)) {
            fs.copyFileSync(BACKUPS.webIcon, PATHS.webIcon);
        }
        if (fs.existsSync(BACKUPS.iconsDir)) {
            copyDirSync(BACKUPS.iconsDir, PATHS.iconsDir);
        }
        
        // Limpiar directorio de backups
        fs.rmSync(PATHS.backupDir, { recursive: true, force: true });
        
        console.log(`${C_GREEN}✔ Código fuente original de Poxi restaurado perfectamente.${C_RESET}`);
    } catch (e) {
        console.error(`${C_RED}❌ Error grave al restaurar copias de seguridad de seguridad: ${e.message}${C_RESET}`);
    }
}

// Sanitizar nombres de archivos e identificadores (Tauri requiere guiones medios en lugar de bajos)
function sanitizeFilename(name) {
    return name
        .replace(/[^a-z0-9-]/gi, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase();
}

// Registro global de manejador de salidas
function registerExitHandlers() {
    process.on('SIGINT', () => {
        console.log(`\n${C_RED}⚠ Proceso abortado por el usuario (Ctrl+C).${C_RESET}`);
        restoreBackups();
        exitMaker(1);
    });
    
    process.on('uncaughtException', (err) => {
        console.error(`\n${C_RED}❌ Ocurrió un error inesperado: ${err.message}${C_RESET}`);
        restoreBackups();
        exitMaker(1);
    });
}

// Flujo Principal
async function main() {
    printHeader();
    
    // 1. Recolección interactiva de datos
    const name = await ask("Nombre del Servidor / Launcher", "Poxi ARK Launcher");
    const ip = await ask("Dirección IP o Dominio del servidor", "167.17.71.121");
    const queryPortStr = await ask("Puerto de consulta UDP de red", "25210");
    const gamePortStr = await ask("Puerto de juego de Steam", "25200");
    const password = await ask("Contraseña del servidor de ARK", "elsaulesuntraidor");
    const versionTag = await ask("Subtexto del Footer (Ej: V361.7 - TRAIDOR 2026)", "V361.7 - TRAIDOR 2026");
    const iconPath = await ask("Ruta de tu archivo de icono (.ico) [Dejar vacío para el original]");
    
    // Validación rápida de puertos
    const queryPort = parseInt(queryPortStr, 10);
    const gamePort = parseInt(gamePortStr, 10);
    
    if (isNaN(queryPort) || queryPort < 1 || queryPort > 65535 || isNaN(gamePort) || gamePort < 1 || gamePort > 65535) {
        console.error(`\n${C_RED}❌ Error: Los puertos deben ser números enteros entre 1 y 65535.${C_RESET}`);
        exitMaker(1);
    }
    
    // Validar icono si lo proveyó
    if (iconPath && !fs.existsSync(iconPath)) {
        console.error(`\n${C_RED}❌ Error: El archivo de icono en "${iconPath}" no existe.${C_RESET}`);
        exitMaker(1);
    }
    
    console.log(`\n${C_CYAN}======================================================================${C_RESET}`);
    console.log(`${C_GREEN}🚀 Datos listos para procesar e iniciar compilación del launcher...${C_RESET}`);
    console.log(`   • Nombre: ${C_BRIGHT}${name}${C_RESET}`);
    console.log(`   • Servidor: ${C_BRIGHT}${ip}:${gamePort} (Puerto UDP Consulta: ${queryPort})${C_RESET}`);
    console.log(`   • Contraseña: ${C_BRIGHT}${password}${C_RESET}`);
    console.log(`   • Subtexto Footer: ${C_BRIGHT}${versionTag}${C_RESET}`);
    if (iconPath) {
        console.log(`   • Icono personalizado: ${C_BRIGHT}${iconPath}${C_RESET}`);
    } else {
        console.log(`   • Icono: ${C_BRIGHT}[Icono original de Poxi por defecto]${C_RESET}`);
    }
    console.log(`${C_CYAN}======================================================================${C_RESET}\n`);
    
    // Registrar restauración automática antes de tocar nada
    registerExitHandlers();
    
    // 2. Crear Backups de Seguridad
    createBackups();
    
    try {
        // 3. Modificar lib.rs (Rust)
        console.log(`${C_YELLOW}✍ Modificando constantes y conexiones en Rust (lib.rs)...${C_RESET}`);
        let libRsContent = fs.readFileSync(PATHS.libRs, 'utf-8');
        
        // Reemplazar IP
        libRsContent = libRsContent.replace(
            /const SERVER_IP: &str = "[^"]*";/,
            `const SERVER_IP: &str = "${ip}";`
        );
        
        // Reemplazar Puerto UDP
        libRsContent = libRsContent.replace(
            /const QUERY_PORT: u16 = \d+;/,
            `const QUERY_PORT: u16 = ${queryPort};`
        );
        
        // Reemplazar URL de conexión de Steam
        // URL base: let mut steam_url = "steam://run/346110//+connect 167.17.71.121:25200%20+password%20elsaulesuntraidor".to_string();
        const newSteamUrl = `let mut steam_url = "steam://run/346110//+connect ${ip}:${gamePort}%20+password%20${password}".to_string();`;
        libRsContent = libRsContent.replace(
            /let mut steam_url = "[^"]*"\.to_string\(\);/,
            newSteamUrl
        );
        
        // Reemplazar el nombre del directorio de AppData para que sea dinámico por launcher
        const sanitizedId = sanitizeFilename(name);
        const appDataFolderName = `ark-launcher-${sanitizedId}`;
        libRsContent = libRsContent.replace(
            /\.join\("!PoxiARKLauncher"\)/,
            `.join("${appDataFolderName}")`
        );
        
        fs.writeFileSync(PATHS.libRs, libRsContent, 'utf-8');
        
        // 4. Modificar tauri.conf.json
        console.log(`${C_YELLOW}✍ Personalizando metadatos de compilación (tauri.conf.json)...${C_RESET}`);
        let tauriConfContent = fs.readFileSync(PATHS.tauriConf, 'utf-8');
        let tauriConf = JSON.parse(tauriConfContent);
        
        tauriConf.productName = name;
        tauriConf.identifier = `com.poxi.ark.launcher.${sanitizedId}`;
        
        if (tauriConf.app && tauriConf.app.windows && tauriConf.app.windows[0]) {
            tauriConf.app.windows[0].title = name;
        }
        
        fs.writeFileSync(PATHS.tauriConf, JSON.stringify(tauriConf, null, 2), 'utf-8');
        
        // 5. Modificar index.html
        console.log(`${C_YELLOW}✍ Actualizando la interfaz visual (index.html)...${C_RESET}`);
        let indexHtmlContent = fs.readFileSync(PATHS.indexHtml, 'utf-8');
        
        // Reemplazar el texto del logo en index.html
        indexHtmlContent = indexHtmlContent.replace(
            /<span class="logo-text" data-tauri-drag-region>[^<]*<\/span>/,
            `<span class="logo-text" data-tauri-drag-region>${name.toUpperCase()}</span>`
        );
        
        // Reemplazar el subtexto del footer en index.html
        indexHtmlContent = indexHtmlContent.replace(
            /<span class="version-tag">[^<]*<\/span>/,
            `<span class="version-tag">${versionTag}</span>`
        );
        
        fs.writeFileSync(PATHS.indexHtml, indexHtmlContent, 'utf-8');
        
        // 6. Gestionar icono personalizado
        if (iconPath) {
            console.log(`${C_YELLOW}🎨 Inyectando iconos y favicons personalizados (.ico)...${C_RESET}`);
            
            // Reemplazar icono en tauri/icons
            fs.copyFileSync(iconPath, path.join(PATHS.iconsDir, 'icon.ico'));
            
            // Reemplazar favicon en el frontend
            fs.copyFileSync(iconPath, PATHS.webIcon);
        }
        
        // 7. Compilar asíncronamente con Tauri
        console.log(`\n${C_MAGENTA}🔨 Iniciando compilación de producción con Tauri v2 y Rust...${C_RESET}`);
        console.log(`${C_YELLOW}   Esto tomará entre 30 y 60 segundos debido a la optimización de código. No cierres la ventana.\n${C_RESET}`);
        
        const buildProcess = spawn('npx', ['tauri', 'build'], { shell: true });
        
        buildProcess.stdout.on('data', (data) => {
            // Imprimir la salida nativa de la compilación de Rust/Tauri
            process.stdout.write(data.toString());
        });
        
        buildProcess.stderr.on('data', (data) => {
            // Imprimir avisos o errores
            process.stdout.write(data.toString());
        });
        
        buildProcess.on('close', (code) => {
            if (code === 0) {
                console.log(`\n${C_GREEN}${C_BRIGHT}✔ ¡Compilación de producción completada con ÉXITO absoluto! 🎉${C_RESET}`);
                
                // 8. Copiar ejecutable compilado a la carpeta de salida
                try {
                    if (!fs.existsSync(PATHS.outputDir)) {
                        fs.mkdirSync(PATHS.outputDir, { recursive: true });
                    }
                    
                    const binaryName = `${name}.exe`;
                    const srcBinary = path.join(__dirname, 'src-tauri', 'target', 'release', 'app.exe');
                    const destBinary = path.join(PATHS.outputDir, binaryName);
                    
                    if (fs.existsSync(srcBinary)) {
                        fs.copyFileSync(srcBinary, destBinary);
                        console.log(`\n${C_GREEN}${C_BRIGHT}💾 ¡Ejecutable portable listo en la carpeta de distribución!${C_RESET}`);
                        console.log(`   👉 Ubicación: ${C_CYAN}${destBinary}${C_RESET}\n`);
                    } else {
                        console.error(`${C_RED}❌ Error: No se pudo localizar el binario app.exe compilado en la carpeta de release.${C_RESET}`);
                    }
                } catch (err) {
                    console.error(`${C_RED}❌ Error copiando el ejecutable final: ${err.message}${C_RESET}`);
                }
                
                // Restaurar el código de Poxi
                restoreBackups();
                exitMaker(0);
            } else {
                console.error(`\n${C_RED}❌ Error: La compilación de Tauri falló con código de salida: ${code}${C_RESET}`);
                restoreBackups();
                exitMaker(1);
            }
        });
        
    } catch (err) {
        console.error(`\n${C_RED}❌ Ocurrió un fallo grave durante la automatización: ${err.message}${C_RESET}`);
        restoreBackups();
        exitMaker(1);
    }
}

main();
