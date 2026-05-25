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
        const notes = [523.25, 659.25, 783.99, 1046.50]; // Arpegio ascendente Mayor (C5, E5, G5, C6)
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
    
    let width = canvas.width = canvas.offsetWidth || 440;
    let height = canvas.height = canvas.offsetHeight || 600;
    
    window.addEventListener('resize', () => {
        width = canvas.width = canvas.offsetWidth || 440;
        height = canvas.height = canvas.offsetHeight || 600;
    });
    
    const particles = [];
    const particleCount = 30;
    let mouse = { x: null, y: null, radius: 75 };
    
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
            this.color = Math.random() > 0.5 ? 'rgba(0, 242, 254, 0.4)' : 'rgba(127, 0, 255, 0.25)';
        }
        
        update() {
            // Repulsión del ratón
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
            
            // Fricción para retornar a la velocidad estándar poco a poco
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
// 📡 LLAMADAS A APIS DE TAURI (Con fallback simulado para testeo rápido)
// ==========================================================================
const checkServerStatusAPI = async () => {
    if (invoke) {
        return await invoke('check_server_status');
    }
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                online: true,
                name: 'POXI PRIVATE SERVER (Simulado)',
                map: 'TheIsland',
                players: 3,
                maxPlayers: 70,
                ping: Math.floor(Math.random() * 45) + 15
            });
        }, 1200);
    });
};

const connectToServerAPI = async (args = []) => {
    if (invoke) {
        try {
            await invoke('connect_to_server', { args: args });
            return { success: true };
        } catch (e) {
            return { success: false, error: e.toString() };
        }
    }
    console.log('Lanzando juego de forma simulada con flags:', args);
    return { success: true };
};

const closeAppAPI = () => {
    if (invoke) {
        invoke('close_app');
    } else {
        window.close();
    }
};

const minimizeAppAPI = () => {
    if (invoke) {
        invoke('minimize_app');
    } else {
        console.log('Ventana minimizada (Simulado)');
    }
};

// ==========================================================================
// ⚙️ CONTROLE Y PERSISTENCIA DE AJUSTES DE OPTIMIZACIÓN
// ==========================================================================
const settingsBtn = document.getElementById('settingsBtn');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const optimizationPanel = document.getElementById('optimizationPanel');

const optCores = document.getElementById('optCores');
const optNoBattlEye = document.getElementById('optNoBattlEye');
const optDirectX = document.getElementById('optDirectX');
const optSky = document.getElementById('optSky');
const optLowMem = document.getElementById('optLowMem');

const firstCores = document.getElementById('firstCores');
const firstNoBattlEye = document.getElementById('firstNoBattlEye');
const firstDirectX = document.getElementById('firstDirectX');
const firstSky = document.getElementById('firstSky');
const firstLowMem = document.getElementById('firstLowMem');

const firstRunModal = document.getElementById('firstRunModal');
const saveFirstRunBtn = document.getElementById('saveFirstRunBtn');

let configData = {
    is_first_run: false,
    opt_cores: true,
    opt_directx: false,
    opt_sky: false,
    opt_low_mem: false,
    opt_nobattleye: true
};

let isFirstExecutionSession = false;

async function loadConfigFromBackend() {
    if (invoke) {
        try {
            configData = await invoke('get_launcher_config');
        } catch (e) {
            console.error("Error cargando configuración nativa:", e);
        }
    }
    
    // Aplicar a los interruptores normales
    optCores.checked = configData.opt_cores;
    optNoBattlEye.checked = configData.opt_nobattleye;
    optDirectX.checked = configData.opt_directx;
    optSky.checked = configData.opt_sky;
    optLowMem.checked = configData.opt_low_mem;
    
    // Si es primera ejecución, marcar también en el modal de primera vez y mostrarlo
    if (configData.is_first_run) {
        isFirstExecutionSession = true;
        
        firstCores.checked = configData.opt_cores;
        firstNoBattlEye.checked = configData.opt_nobattleye;
        firstDirectX.checked = configData.opt_directx;
        firstSky.checked = configData.opt_sky;
        firstLowMem.checked = configData.opt_low_mem;
        
        firstRunModal.classList.remove('modal-hidden');
    }
}

async function saveConfigToBackend() {
    configData.opt_cores = optCores.checked;
    configData.opt_nobattleye = optNoBattlEye.checked;
    configData.opt_directx = optDirectX.checked;
    configData.opt_sky = optSky.checked;
    configData.opt_low_mem = optLowMem.checked;
    
    if (invoke) {
        try {
            await invoke('save_launcher_config', { config: configData });
        } catch (e) {
            console.error("Error guardando configuración nativa:", e);
        }
    }
}

[optCores, optNoBattlEye, optDirectX, optSky, optLowMem].forEach(opt => {
    opt.addEventListener('change', () => {
        audio.playClick();
        saveConfigToBackend();
    });
});

[firstCores, firstNoBattlEye, firstDirectX, firstSky, firstLowMem].forEach(opt => {
    opt.addEventListener('change', () => {
        audio.playClick();
    });
});

settingsBtn.addEventListener('click', () => {
    audio.playClick();
    optimizationPanel.classList.remove('panel-hidden');
});

closeSettingsBtn.addEventListener('click', () => {
    audio.playClick();
    optimizationPanel.classList.add('panel-hidden');
});

saveFirstRunBtn.addEventListener('click', async () => {
    audio.playClick();
    
    // Guardar valores del modal a la config global
    configData.opt_cores = firstCores.checked;
    configData.opt_nobattleye = firstNoBattlEye.checked;
    configData.opt_directx = firstDirectX.checked;
    configData.opt_sky = firstSky.checked;
    configData.opt_low_mem = firstLowMem.checked;
    
    // Sincronizar a los switches del panel normal
    optCores.checked = configData.opt_cores;
    optNoBattlEye.checked = configData.opt_nobattleye;
    optDirectX.checked = configData.opt_directx;
    optSky.checked = configData.opt_sky;
    optLowMem.checked = configData.opt_low_mem;
    
    configData.is_first_run = false;
    
    if (invoke) {
        try {
            await invoke('save_launcher_config', { config: configData });
        } catch (e) {
            console.error("Error guardando configuración de bienvenida:", e);
        }
    }
    
    audio.playSuccess();
    firstRunModal.classList.add('modal-hidden');
});

function getOptimizationArgs() {
    const args = [];
    if (optCores.checked) args.push(optCores.value);
    if (optNoBattlEye.checked) args.push(optNoBattlEye.value);
    if (optDirectX.checked) args.push(optDirectX.value);
    if (optSky.checked) args.push(optSky.value);
    if (optLowMem.checked) args.push(optLowMem.value);
    return args;
}

// ==========================================================================
// 🕹️ LÓGICA DE ELEMENTOS DEL DOM Y ESTADO DEL SISTEMA
// ==========================================================================
const minimizeBtn = document.getElementById('minimizeBtn');
const closeBtn = document.getElementById('closeBtn');

const statusRing = document.getElementById('statusRing');
const statusTitle = document.getElementById('statusTitle');
const statusSubtitle = document.getElementById('statusSubtitle');

const serverCard = document.getElementById('serverCard');
const serverNameEl = document.getElementById('serverName');
const serverMapEl = document.getElementById('serverMap');
const serverPlayersEl = document.getElementById('serverPlayers');

const mainActionBtn = document.getElementById('mainActionBtn');
const btnContent = document.getElementById('btnContent');
const secondaryActionBtn = document.getElementById('secondaryActionBtn');

const latencyIndicator = document.getElementById('latencyIndicator');

// Estados del Launcher
let autoConnectTimer = null;
let secondsRemaining = 3;
let isAutoConnecting = false;

let offlineRetryTimer = null;
let offlineSecondsRemaining = 8;
let isOfflineRetrying = false;

let currentServerOnline = false;

// Controles nativos
minimizeBtn.addEventListener('click', () => {
    audio.playClick();
    minimizeAppAPI();
});

closeBtn.addEventListener('click', () => {
    audio.playClick();
    closeAppAPI();
});

// ==========================================================================
// 🦖 LÓGICA PRINCIPAL DEL MONITOR
// ==========================================================================

async function checkServer() {
    // Cancelar cualquier cuenta atrás o re-intento previo activo
    cancelAutoConnect();
    cancelOfflineRetry();

    // Visual de carga / escaneo
    statusRing.className = 'hologram-ring status-loading';
    statusTitle.textContent = 'VERIFICANDO RED';
    statusTitle.className = 'status-title text-loading';
    statusSubtitle.textContent = 'Consultando estado UDP en puerto 25210...';
    
    serverCard.classList.add('card-hidden');
    
    mainActionBtn.className = 'btn-action btn-disabled';
    mainActionBtn.disabled = true;
    btnContent.textContent = 'ESPERANDO RESPUESTA...';
    
    secondaryActionBtn.textContent = 'COMPROBANDO...';
    secondaryActionBtn.disabled = true;

    latencyIndicator.textContent = 'UDP PORT 25210 SCANNING';
    latencyIndicator.style.color = '#00f2fe';
    latencyIndicator.className = 'latency-indicator';

    try {
        const result = await checkServerStatusAPI();
        secondaryActionBtn.disabled = false;

        if (result.online) {
            currentServerOnline = true;
            audio.playSuccess();

            statusRing.className = 'hologram-ring status-online';
            statusTitle.textContent = 'SERVIDOR ONLINE';
            statusTitle.className = 'status-title text-online';
            statusSubtitle.textContent = 'El servidor está activo y respondiendo.';

            // Mostrar estadísticas
            serverNameEl.textContent = result.name || 'ARK Server';
            serverMapEl.textContent = result.map || 'Unknown';
            serverPlayersEl.textContent = `${result.players ?? 0} / ${result.maxPlayers ?? 70}`;
            serverCard.classList.remove('card-hidden');

            // Renderizar el Ping/Latencia
            if (result.ping !== undefined && result.ping !== null) {
                latencyIndicator.textContent = `LATENCIA: ${result.ping}ms | ESTABLE`;
                if (result.ping < 80) {
                    latencyIndicator.style.color = '#00f2fe'; // Cian
                } else if (result.ping < 150) {
                    latencyIndicator.style.color = '#ffea00'; // Amarillo
                } else {
                    latencyIndicator.style.color = '#ff3366'; // Rojo
                }
            } else {
                latencyIndicator.textContent = 'SERVIDOR OPERATIVO - LATENCIA OK';
                latencyIndicator.style.color = '#00f2fe';
            }

            // Iniciar auto-conexión (sólo si no es la primera sesión de ejecución de la app)
            if (!isFirstExecutionSession) {
                startAutoConnect();
            } else {
                // Si es la primera vez, se habilitan los botones en lugar de autoconectar
                mainActionBtn.className = 'btn-action';
                mainActionBtn.disabled = false;
                btnContent.textContent = 'CONECTAR AHORA';
                secondaryActionBtn.textContent = 'COMPROBAR ESTADO';
            }

        } else {
            currentServerOnline = false;
            audio.playError();

            statusRing.className = 'hologram-ring status-offline';
            statusTitle.textContent = 'SERVIDOR CAÍDO';
            statusTitle.className = 'status-title text-offline';
            statusSubtitle.textContent = result.error || 'No responde a las consultas UDP. ¿Está apagado?';

            latencyIndicator.textContent = 'SIN CONEXIÓN';
            latencyIndicator.style.color = '#ff3366';
            latencyIndicator.className = 'latency-indicator offline';

            mainActionBtn.className = 'btn-action btn-offline';
            mainActionBtn.disabled = false;
            btnContent.textContent = 'REINTENTAR CONEXIÓN';
            
            // Iniciar re-intento en bucle automático de 8s (Offline Mode)
            startOfflineRetry();
        }
    } catch (error) {
        console.error('Error al comprobar el servidor:', error);
        currentServerOnline = false;
        audio.playError();
        
        statusRing.className = 'hologram-ring status-offline';
        statusTitle.textContent = 'ERROR DE RED';
        statusTitle.className = 'status-title text-offline';
        statusSubtitle.textContent = 'Ocurrió un error inesperado al consultar el servidor.';
        
        mainActionBtn.className = 'btn-action btn-offline';
        mainActionBtn.disabled = false;
        btnContent.textContent = 'REINTENTAR';
        
        secondaryActionBtn.textContent = 'COMPROBAR ESTADO';
        secondaryActionBtn.disabled = false;

        startOfflineRetry();
    }
}

// --- TEMP AUTOMÁTICOS ---

// A. Cuenta atrás para auto-conectarse (ONLINE)
function startAutoConnect() {
    isAutoConnecting = true;
    secondsRemaining = 3;
    
    mainActionBtn.className = 'btn-action';
    mainActionBtn.disabled = false;
    btnContent.textContent = `AUTO-CONECTANDO EN ${secondsRemaining}S...`;
    secondaryActionBtn.textContent = 'CANCELAR AUTO-INICIO';

    autoConnectTimer = setInterval(() => {
        secondsRemaining--;
        if (secondsRemaining > 0) {
            audio.playTick();
            btnContent.textContent = `AUTO-CONECTANDO EN ${secondsRemaining}S...`;
        } else {
            clearInterval(autoConnectTimer);
            btnContent.textContent = 'CONECTANDO A ARK...';
            secondaryActionBtn.textContent = 'COMPROBAR ESTADO';
            isAutoConnecting = false;
            connect();
        }
    }, 1000);
}

function cancelAutoConnect() {
    if (autoConnectTimer) {
        clearInterval(autoConnectTimer);
        autoConnectTimer = null;
    }
    if (isAutoConnecting) {
        isAutoConnecting = false;
        btnContent.textContent = 'CONECTAR AHORA';
        secondaryActionBtn.textContent = 'COMPROBAR ESTADO';
    }
}

// B. Re-intento automático cada 8 segundos (OFFLINE)
function startOfflineRetry() {
    cancelOfflineRetry();
    isOfflineRetrying = true;
    offlineSecondsRemaining = 8;
    
    secondaryActionBtn.textContent = `REINTENTANDO EN ${offlineSecondsRemaining}S...`;
    secondaryActionBtn.disabled = false;

    offlineRetryTimer = setInterval(() => {
        offlineSecondsRemaining--;
        if (offlineSecondsRemaining > 0) {
            secondaryActionBtn.textContent = `REINTENTANDO EN ${offlineSecondsRemaining}S...`;
            // Clic sutil rítmico cada 2s
            if (offlineSecondsRemaining % 2 === 0) {
                audio.playTick();
            }
        } else {
            clearInterval(offlineRetryTimer);
            isOfflineRetrying = false;
            checkServer();
        }
    }, 1000);
}

function cancelOfflineRetry() {
    if (offlineRetryTimer) {
        clearInterval(offlineRetryTimer);
        offlineRetryTimer = null;
    }
    if (isOfflineRetrying) {
        isOfflineRetrying = false;
        secondaryActionBtn.textContent = 'COMPROBAR ESTADO';
    }
}

// --- CONECTAR AL JUEGO ---
async function connect() {
    audio.playSweep();
    btnContent.textContent = 'ABRIENDO JUEGO...';
    mainActionBtn.disabled = true;
    
    // Obtener flags de optimización marcados
    const args = getOptimizationArgs();
    
    const result = await connectToServerAPI(args);
    
    if (!result.success) {
        console.error('Error al conectar:', result.error);
        alert('No se pudo abrir Steam automáticamente. Asegúrate de tener Steam instalado.');
        mainActionBtn.disabled = false;
        btnContent.textContent = 'CONECTAR AHORA';
    }
}

// --- LISTENERS ---

mainActionBtn.addEventListener('click', () => {
    audio.playClick();
    if (isAutoConnecting) {
        cancelAutoConnect();
        connect();
    } else if (currentServerOnline) {
        connect();
    } else {
        checkServer();
    }
});

secondaryActionBtn.addEventListener('click', () => {
    audio.playClick();
    if (isAutoConnecting) {
        cancelAutoConnect();
    } else if (isOfflineRetrying) {
        cancelOfflineRetry();
    } else {
        checkServer();
    }
});

// --- CARGA INICIAL ---
window.addEventListener('DOMContentLoaded', async () => {
    initParticles();
    await loadConfigFromBackend();
    setTimeout(checkServer, 600);
});
