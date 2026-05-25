// Puente IPC de Tauri seguro y altamente compatible
const invoke = window.__TAURI__?.core?.invoke || window.__TAURI__?.tauri?.invoke;

// ==========================================================================
// 🎵 SINTETIZADOR DE SONIDO EN TIEMPO REAL (Web Audio API)
// ==========================================================================
class AudioSynth {
    constructor() {
        this.ctx = null;
    }
    
    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }
    
    playClick() {
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1400, this.ctx.currentTime + 0.05);
        
        gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
    }
    
    playSuccess() {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // Arpegio Mayor C5, E5, G5, C6
        notes.forEach((freq, idx) => {
            const time = now + idx * 0.06;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, time);
            
            gain.gain.setValueAtTime(0.0, time);
            gain.gain.linearRampToValueAtTime(0.08, time + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
            
            osc.start(time);
            osc.stop(time + 0.15);
        });
    }
    
    playError() {
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(110, this.ctx.currentTime + 0.18);
        
        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.18);
    }
    
    playTick() {
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1600, this.ctx.currentTime);
        
        gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.02);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.02);
    }
    
    playSweep() {
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1800, this.ctx.currentTime + 0.8);
        
        gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.8);
    }
}
const audio = new AudioSynth();

// ==========================================================================
// ✨ FONDO INTERACTIVO DE PARTÍCULAS (Canvas HTML5)
// ==========================================================================
function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let width = canvas.width = canvas.offsetWidth || 960;
    let height = canvas.height = canvas.offsetHeight || 680;
    
    window.addEventListener('resize', () => {
        width = canvas.width = canvas.offsetWidth || 960;
        height = canvas.height = canvas.offsetHeight || 680;
    });
    
    const particles = [];
    const particleCount = 45;
    let mouse = { x: null, y: null, radius: 100 };
    
    const container = document.getElementById('appContainer');
    container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });
    
    container.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });
    
    class Particle {
        constructor() {
            this.reset();
        }
        
        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 1.5 + 0.5;
            this.baseSpeedX = Math.random() * 0.15 - 0.075;
            this.baseSpeedY = Math.random() * 0.15 - 0.075;
            this.vx = this.baseSpeedX;
            this.vy = this.baseSpeedY;
            this.color = Math.random() > 0.5 ? 'rgba(0, 243, 255, 0.35)' : 'rgba(255, 0, 85, 0.2)';
        }
        
        update() {
            if (mouse.x !== null && mouse.y !== null) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < mouse.radius) {
                    const force = (mouse.radius - dist) / mouse.radius;
                    const angle = Math.atan2(dy, dx);
                    this.vx += Math.cos(angle) * force * 0.15;
                    this.vy += Math.sin(angle) * force * 0.15;
                }
            }
            
            this.x += this.vx;
            this.y += this.vy;
            
            // Fricción
            this.vx += (this.baseSpeedX - this.vx) * 0.025;
            this.vy += (this.baseSpeedY - this.vy) * 0.025;
            
            if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
                this.reset();
            }
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }
    
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }
    animate();
}

// ==========================================================================
// 🕹️ LÓGICA DEL FRONTEND & INTERACTIVIDAD DE ELEMENTOS
// ==========================================================================
const minimizeBtn = document.getElementById('minimizeBtn');
const closeBtn = document.getElementById('closeBtn');
const restoreAllBtn = document.getElementById('restoreAllBtn');

const statusRing = document.getElementById('statusRing');
const coreIcon = document.getElementById('coreIcon');
const statusTitle = document.getElementById('statusTitle');
const statusSubtitle = document.getElementById('statusSubtitle');
const pathValue = document.getElementById('pathValue');
const btnManualPath = document.getElementById('btnManualPath');
const btnOptimize = document.getElementById('btnOptimize');
const btnOptimizeText = document.getElementById('btnOptimizeText');
const footerIndicator = document.getElementById('footerIndicator');

// Toggles y Generador de Steam Options
const launchToggles = document.querySelectorAll('.launch-toggle');
const resultCommand = document.getElementById('resultCommand');
const btnCopy = document.getElementById('btnCopy');
const copySuccessMsg = document.getElementById('copySuccessMsg');

// Pestañas (Tabs)
const tabLaunchOptions = document.getElementById('tabLaunchOptions');
const tabGuide = document.getElementById('tabGuide');
const contentLaunchOptions = document.getElementById('contentLaunchOptions');
const contentGuide = document.getElementById('contentGuide');

// Variables de Estado
let currentRaizPath = "";
let currentConfigPath = "";
let pathValido = false;

// 1. Controles nativos de ventana Tauri
minimizeBtn.addEventListener('click', () => {
    audio.playClick();
    if (window.__TAURI__) {
        window.__TAURI__.window.getCurrentWindow().minimize();
    } else {
        console.log('Minimizar (Simulado)');
    }
});

closeBtn.addEventListener('click', () => {
    audio.playClick();
    if (window.__TAURI__) {
        window.__TAURI__.window.getCurrentWindow().close();
    } else {
        window.close();
    }
});

// 2. Navegación de Pestañas (Tabs)
function switchTab(activeTab, inactiveTab, activeContent, inactiveContent) {
    audio.playClick();
    activeTab.classList.add('active');
    inactiveTab.classList.remove('active');
    activeContent.classList.remove('tab-hidden');
    inactiveContent.classList.add('tab-hidden');
}

tabLaunchOptions.addEventListener('click', () => {
    switchTab(tabLaunchOptions, tabGuide, contentLaunchOptions, contentGuide);
});

tabGuide.addEventListener('click', () => {
    switchTab(tabGuide, tabLaunchOptions, contentGuide, contentLaunchOptions);
});

// 3. Generación de línea de parámetros de Steam
function actualizarParametrosSteam() {
    let args = [];
    launchToggles.forEach(toggle => {
        if (toggle.checked) {
            args.push(toggle.value);
        }
    });
    resultCommand.value = args.join(" ");
}

launchToggles.forEach(toggle => {
    toggle.addEventListener('change', () => {
        audio.playClick();
        actualizarParametrosSteam();
    });
});

// Botón Copiar al Portapapeles
btnCopy.addEventListener('click', () => {
    audio.playSweep();
    navigator.clipboard.writeText(resultCommand.value).then(() => {
        copySuccessMsg.classList.add('show');
        setTimeout(() => {
            copySuccessMsg.classList.remove('show');
        }, 2000);
    });
});

// 4. Lógica de Negocio y Comunicación con Rust
function actualizarInterfazEstado(info) {
    currentRaizPath = info.ruta_raiz;
    currentConfigPath = info.ruta_config;
    pathValido = info.valido;

    // Actualizar texto de ruta
    if (pathValido) {
        pathValue.textContent = currentConfigPath;
        btnManualPath.style.display = "block";
        btnManualPath.textContent = "📂 CAMBIAR RUTA MANUAL";
        
        if (info.tiene_backup) {
            // Configurar Anillo a Optimizado si ya existen los respaldos (optimización previa activa)
            statusRing.className = "hologram-ring status-optimized";
            coreIcon.textContent = "🦖";
            statusTitle.textContent = "ARK OPTIMIZADO";
            statusTitle.className = "status-title text-optimized";
            statusSubtitle.textContent = "¡Parámetros inyectados! Resoluciones, sombras, follaje, memoria y CPU optimizados al 100% para 80-90 FPS.";
            
            btnOptimize.className = "btn-action btn-optimized";
            btnOptimize.disabled = false;
            btnOptimizeText.textContent = "✅ OPTIMIZACIÓN ACTIVA";
            
            footerIndicator.textContent = "OPTIMIZACIÓN DE JUEGO APLICADA Y ACTIVA";
            footerIndicator.style.color = "#39ff14";
        } else {
            // Configurar Anillo a Listo para optimizar por primera vez
            statusRing.className = "hologram-ring status-ready";
            coreIcon.textContent = "⚡";
            statusTitle.textContent = "ARK DETECTADO";
            statusTitle.className = "status-title text-ready";
            statusSubtitle.textContent = "¡Ruta validada con éxito! Listo para aplicar los tweaks gráficos de alto rendimiento.";
            
            btnOptimize.className = "btn-action";
            btnOptimize.disabled = false;
            btnOptimizeText.textContent = "APLICAR OPTIMIZACIÓN";
            
            footerIndicator.textContent = "ARK DETECTADO - LISTO PARA OPTIMIZAR";
            footerIndicator.style.color = "#00f3ff";
        }
    } else {
        pathValue.textContent = info.ruta_raiz || "No seleccionada";
        btnManualPath.style.display = "block";
        btnManualPath.textContent = "📂 SELECCIONAR CARPETA MANUAL";
        
        // Configurar Anillo a Error
        statusRing.className = "hologram-ring status-error";
        coreIcon.textContent = "⚠️";
        statusTitle.textContent = "ARK NO DETECTADO";
        statusTitle.className = "status-title text-error";
        statusSubtitle.textContent = info.mensaje || "Por favor, selecciona la carpeta raíz del juego manualmente.";
        
        // Deshabilitar botón
        btnOptimize.className = "btn-action btn-disabled";
        btnOptimize.disabled = true;
        btnOptimizeText.textContent = "SELECCIONA LA RUTA";
        
        footerIndicator.textContent = "FALLÓ DETECCION - ESPERANDO CARPETA";
        footerIndicator.style.color = "#ff3366";
    }

    // Gestionar visibilidad del botón de restauración
    if (info.tiene_backup) {
        restoreAllBtn.style.display = "flex";
    } else {
        restoreAllBtn.style.display = "none";
    }
}

// Escanear automáticamente la ruta
async function escanearRutaAutomatica() {
    statusRing.className = "hologram-ring status-scanning";
    coreIcon.textContent = "🔍";
    statusTitle.textContent = "ESCANEANDO";
    statusTitle.className = "status-title text-scanning";
    statusSubtitle.textContent = "Buscando instalaciones de ARK en directorios comunes y el registro de Windows...";
    
    if (invoke) {
        try {
            const info = await invoke('detectar_ruta_ark');
            actualizarInterfazEstado(info);
        } catch (e) {
            console.error("Error al escanear ruta:", e);
            actualizarInterfazEstado({
                valido: false,
                ruta_raiz: "",
                ruta_config: "",
                tiene_backup: false,
                mensaje: "Error de comunicación con el servicio nativo de Tauri."
            });
        }
    } else {
        // Fallback simulado para navegador
        setTimeout(() => {
            actualizarInterfazEstado({
                valido: false,
                ruta_raiz: "",
                ruta_config: "",
                tiene_backup: false,
                mensaje: "No se detectó instalación nativa. Haz clic en seleccionar carpeta manual."
            });
        }, 1200);
    }
}

// Selección manual de carpeta
btnManualPath.addEventListener('click', async () => {
    audio.playClick();
    if (invoke) {
        try {
            const info = await invoke('seleccionar_ruta_manual');
            actualizarInterfazEstado(info);
            if (info.valido) {
                audio.playSuccess();
            } else if (info.mensaje !== "Selección cancelada por el usuario.") {
                audio.playError();
            }
        } catch (e) {
            console.error("Error al seleccionar carpeta manual:", e);
            audio.playError();
        }
    } else {
        // Simulación en web browser
        console.log("Diálogo manual no soportado fuera de Tauri");
        actualizarInterfazEstado({
            valido: true,
            ruta_raiz: "C:\\Program Files (x86)\\Steam\\steamapps\\common\\ARK",
            ruta_config: "C:\\Program Files (x86)\\Steam\\steamapps\\common\\ARK\\ShooterGame\\Saved\\Config\\WindowsNoEditor",
            tiene_backup: true,
            mensaje: "Simulado correctamente en navegador"
        });
        audio.playSuccess();
    }
});

// Botón de Aplicar Optimización
btnOptimize.addEventListener('click', async () => {
    if (!pathValido) return;
    audio.playSweep();

    // 1. Mostrar pantalla / animación de carga
    statusRing.className = "hologram-ring status-scanning";
    coreIcon.textContent = "⚙️";
    statusTitle.textContent = "APLICANDO TWEAKS";
    statusTitle.className = "status-title text-scanning";
    statusSubtitle.textContent = "Escribiendo optimizaciones en Engine.ini y ajustando presets gráficos en GameUserSettings.ini...";

    btnOptimize.className = "btn-action btn-disabled";
    btnOptimize.disabled = true;
    btnOptimizeText.textContent = "PROCESANDO...";

    footerIndicator.textContent = "ESCRIBIENDO PARÁMETROS EN LOS ARCHIVOS .INI...";
    footerIndicator.style.color = "#8338ec";

    // Retrasar 1.3 segundos para que Alexis vea la animación y los sonidos rítmicos de optimización
    setTimeout(async () => {
        if (invoke) {
            try {
                const res = await invoke('aplicar_optimizacion', { rutaConfig: currentConfigPath });
                audio.playSuccess();

                // Configurar anillo a Optimizado
                statusRing.className = "hologram-ring status-optimized";
                coreIcon.textContent = "🦖";
                statusTitle.textContent = "ARK OPTIMIZADO";
                statusTitle.className = "status-title text-optimized";
                statusSubtitle.textContent = "¡Parámetros inyectados! Resoluciones, sombras, follaje, memoria y CPU optimizados al 100% para 80-90 FPS.";

                btnOptimize.className = "btn-action btn-optimized";
                btnOptimize.disabled = false;
                btnOptimizeText.textContent = "✅ OPTIMIZACIÓN ACTIVA";

                restoreAllBtn.style.display = "flex"; // Mostrar botón de restauración ahora que hay backups
                
                footerIndicator.textContent = "OPTIMIZACIÓN DE JUEGO APLICADA Y ACTIVA";
                footerIndicator.style.color = "#39ff14";
            } catch (e) {
                console.error("Error al aplicar optimización:", e);
                audio.playError();

                statusRing.className = "hologram-ring status-error";
                coreIcon.textContent = "❌";
                statusTitle.textContent = "ERROR AL APLICAR";
                statusTitle.className = "status-title text-error";
                statusSubtitle.textContent = "No se pudieron escribir las optimizaciones: " + e;

                btnOptimize.className = "btn-action";
                btnOptimize.disabled = false;
                btnOptimizeText.textContent = "REINTENTAR OPTIMIZACIÓN";

                footerIndicator.textContent = "FALLÓ ESCRITURA EN LOS INI";
                footerIndicator.style.color = "#ff3366";
            }
        } else {
            // Simulación
            audio.playSuccess();
            statusRing.className = "hologram-ring status-optimized";
            coreIcon.textContent = "🦖";
            statusTitle.textContent = "ARK OPTIMIZADO (Simulado)";
            statusTitle.className = "status-title text-optimized";
            statusSubtitle.textContent = "Modificaciones simuladas con éxito.";
            btnOptimize.className = "btn-action btn-optimized";
            btnOptimize.disabled = false;
            btnOptimizeText.textContent = "✅ OPTIMIZACIÓN ACTIVA";
            restoreAllBtn.style.display = "flex";
        }
    }, 1300);
});

// Botón de Restauración de fábrica
restoreAllBtn.addEventListener('click', async () => {
    audio.playClick();
    if (!currentConfigPath) return;

    if (invoke) {
        try {
            const res = await invoke('restaurar_original', { rutaConfig: currentConfigPath });
            audio.playSuccess();

            // Actualizar estado del anillo a Listo
            statusRing.className = "hologram-ring status-ready";
            coreIcon.textContent = "⚡";
            statusTitle.textContent = "VALORES ORIGINALES";
            statusTitle.className = "status-title text-ready";
            statusSubtitle.textContent = "Los respaldos .ini originales han sido restaurados. El juego vuelve a su estado de fábrica.";

            btnOptimize.className = "btn-action";
            btnOptimize.disabled = false;
            btnOptimizeText.textContent = "APLICAR OPTIMIZACIÓN";

            restoreAllBtn.style.display = "none"; // Ya no hay backups activos

            footerIndicator.textContent = "RESPALDO RESTAURADO - JUEGO EN ESTADO ORIGINAL";
            footerIndicator.style.color = "#00f3ff";
        } catch (e) {
            console.error("Error al restaurar backups:", e);
            audio.playError();
            alert("No se pudieron restaurar los originales: " + e);
        }
    } else {
        // Simulación
        audio.playSuccess();
        statusRing.className = "hologram-ring status-ready";
        coreIcon.textContent = "⚡";
        statusTitle.textContent = "RESTORED (Simulado)";
        restoreAllBtn.style.display = "none";
    }
});

// Carga Inicial
window.addEventListener('DOMContentLoaded', () => {
    initParticles();
    actualizarParametrosSteam();
    // Iniciar con un pequeño retardo el escaneo para permitir que Alexis vea la animación inicial
    setTimeout(escanearRutaAutomatica, 600);
});
