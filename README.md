# 🦖 Poxi ARK Launcher — Auto-Conectador Premium (Tauri Ultra Light) 🚀

> [!IMPORTANT]
> **Compatibilidad de Juego:** Este launcher está diseñado **única y exclusivamente para ARK: Survival Evolved (ASE)**. **NO funciona ni es compatible con ARK: Survival Ascended (ASA)**.

¡Bienvenido al repositorio oficial de **Poxi ARK Launcher**! Este es un launcher personalizado de alto rendimiento y peso pluma, diseñado específicamente para conectarte de forma automática e inmediata a tu servidor de **ARK: Survival Evolved** con solo un clic. 🎮⚡

Esta versión está construida sobre **Tauri (v2)** y **Rust**, lo que ofrece un rendimiento nativo excepcional, una interfaz gaming impecable y un ejecutable extremadamente ligero y optimizado (~8.5 MB).

---

## 📖 🧠 Guía del Desarrollador y Explicación del Código

Para que entiendas perfectamente cómo funciona cada rincón del launcher, he creado una documentación técnica exhaustiva y muy didáctica:

👉 **[Leer la Guía de Explicación del Código (EXPLICACION_DEL_CODIGO.md)](file:///f:/ejecutable-ark/EXPLICACION_DEL_CODIGO.md)** 👈

*En esa guía encontrarás diagramas de flujo, explicación paso a paso de los sockets UDP en Rust, el handshake de desafío de red, la comunicación IPC del frontend y cómo editar la lógica del temporizador.*

---

## 🌟 Características Principales

* **🔌 Auto-Conexión Inteligente:** Lanza el juego directamente a través de Steam, inyectando de forma nativa la IP, el puerto de juego y la contraseña del servidor automáticamente.
* **📡 Monitorización UDP en Tiempo Real:** Utiliza el protocolo de consultas `A2S_INFO` de Valve (con soporte de handshake *Challenge*) implementado en Rust para verificar el estado del servidor y medir el **Ping exacto en milisegundos**.
* **⚡ Parámetros Avanzados de Optimización (5 Switches):** Panel interactivo lateral para activar de forma individual:
  * 🚀 **CPU Turbo (All Cores):** Fuerza a ARK a usar todos los núcleos del procesador (`-useallavailablecores`).
  * 🛡️ **Desactivar BattlEye:** Evita la carga del anti-cheat, mejorando la fluidez y FPS (`-nobattleye`).
  * ⚡ **DirectX 10 Boost:** Shader Model 4. Duplica los FPS en computadoras promedio (`-sm4`).
  * ☁️ **Cielo Optimizado (No Sky):** Desactiva nubes volumétricas para estabilizar el rendimiento (`-nomansky`).
  * 💾 **Low Memory (4GB Modo):** Optimiza de forma agresiva la carga de texturas, crucial si tienes menos de 16GB de RAM (`-lowmemory`).
* **💾 Persistencia Nativa en AppData:** Tus ajustes se guardan de forma física y nativa mediante Rust en el directorio `%APPDATA%\!PoxiARKLauncher\config.json`.
* **🦖 Setup de Primera Ejecución (Welcome Setup):** Un modal interactivo Glassmorphic con desenfoque de fondo y luces neón que salta únicamente la primera vez que abres el launcher para configurar tus optimizaciones (CPU Turbo y BattlEye Off activados por defecto), bloquea el autoconectado para darte tiempo y muestra un agradecimiento especial: *"gracias a poxi, tu ark, sera mas estable jeje"*.
* **📐 HUD Escalado al 125%:** Una interfaz un 25% más grande en pantalla (550px de ancho por 750px de alto) para un efecto gaming premium e inmersivo, y con una barra de scroll cian ultrafina y elegante en el panel de optimización.
* **📡 Bucle Inteligente Offline de Re-intento:** Si el servidor está caído, el launcher realiza consultas UDP automáticas cada 8 segundos y emite un latido de radar rojo neón dinámico.
* **🎵 Sintetizador de Audio en Tiempo Real:** Motor de sonido interactivo desarrollado sobre Web Audio API (Web Synth) que genera ondas analógicas para clics, avisos de error, cuenta atrás, éxitos y barridos de frecuencia al conectar.
* **🛸 Interfaz Gaming Premium:** Diseñada sin marcos de ventana estándar (frameless) y con soporte para transparencias nativas, partículas estelares interactivas de fondo que repelen el puntero y controles integrados de minimizar y cerrar.

---

## 🏗️ Estructura del Proyecto

* **🦀 Backend (`src-tauri/`):** Escrito en **Rust**. Realiza la comunicación por socket UDP de bajo nivel con el servidor de ARK de forma ultraeficiente, inyecta los parámetros de Steam y gestiona la persistencia nativa en AppData.
* **🎨 Frontend (`src-web/`):** Interfaz moderna y premium diseñada con HTML, CSS nativo y JavaScript. Se comunica con Rust mediante las APIs nativas de invocación de Tauri.
* **⚙️ Servidor Dev (`dev-server.js`):** Un mini servidor local en Node.js que Tauri utiliza automáticamente para servir y previsualizar la interfaz de usuario en tiempo real durante el desarrollo.

---

## ⚙️ ¿Cómo Editar la IP y Contraseña del Servidor? 🛠️

Si el servidor de ARK cambia de IP, puerto o contraseña, puedes modificarlo fácilmente en el código de Rust:

Abre el archivo [lib.rs](file:///f:/ejecutable-ark/src-tauri/src/lib.rs) y modifica las siguientes líneas:

1. **Línea 6 (IP del Servidor):**
   ```rust
   const SERVER_IP: &str = "TU_IP_DEL_SERVIDOR";
   ```
2. **Línea 7 (Puerto de Consulta UDP):**
   ```rust
   const QUERY_PORT: u16 = 25210;
   ```
3. **Línea 250 (Enlace de Conexión de Steam con Puerto de Juego y Contraseña):**
   ```rust
   let mut steam_url = "steam://run/346110//+connect TU_IP_DEL_SERVIDOR:25200%20+password%20TU_CONTRASEÑA".to_string();
   ```

*Nota: `%20` representa un espacio en blanco codificado en el enlace URI de Steam.*

---

## 🚀 Instrucciones de Desarrollo y Compilación

### 📋 Requisitos Previos
* Tener instalado [Node.js](https://nodejs.org/) (para dependencias de desarrollo y el dev-server).
* Tener instalado el entorno de compilación de [Rust](https://www.rust-lang.org/es) (necesario para compilar el código nativo de Tauri).

### 📦 1. Instalación de Dependencias
Ejecuta este comando en la raíz del proyecto para instalar las herramientas CLI de Tauri:
```bash
npm install
```

### 🟢 2. Ejecutar en Modo Desarrollo (Tiempo Real)
Para programar y ver los cambios visuales y lógicos en tiempo real:
```bash
npm run dev
```
*(Esto levantará la ventana de desarrollo del Launcher y recargará automáticamente la interfaz ante cualquier cambio).*

### 📦 3. Compilar el Ejecutable Portable Optimizado
Para generar el archivo ejecutable `.exe` final y ultra comprimido para Windows:
```bash
npm run build
```

### 📦 4. Ejecutable Listo para Usar (Portable)
Si solo quieres usar el launcher sin programar, ya te he dejado la versión compilada, standalone y portable en la raíz del proyecto:
* **Ubicación:** 📂 [.exe/Poxi-ARK-Launcher.exe](file:///f:/ejecutable-ark/.exe/Poxi-ARK-Launcher.exe)
* **Cómo usar:** Haz doble clic sobre él y listo, no requiere instaladores ni configuraciones complejas.

---

## 🛠️ Poxi ARK Launcher Maker — ¡Generador de Ejecutables Standalone! 🦖

El repositorio incluye la herramienta premium **Poxi ARK Launcher Maker** (`POXI_ARK_LAUNCHER_MAKER.exe`), que te permite generar infinitos ejecutables portables `.exe` personalizados para cualquier servidor de ARK Survival Evolved de forma 100% automatizada y segura.

### 🌟 Capacidades de Personalización del Maker:
* **Nombre del Servidor / Programa:** Cambia el título de la ventana, la UI y los metadatos del binario compilado.
* **Dirección IP & Puerto de Juego:** Configura de forma transparente la conexión al servidor de Steam.
* **Puerto de Consulta UDP:** Inyecta el puerto para la monitorización de red A2S_INFO y Ping en tiempo real.
* **Contraseña de Servidor:** Configura la contraseña de acceso directo de tu servidor para Steam.
* **Subtexto del Footer:** Personaliza la etiqueta de versión de pie de página (ej. `V361.7 - TRAIDOR 2026`) con el texto que desees (ej. `POXI 2026`).
* **Icono Personalizado (.ico):** Inyecta tu propio icono físico para el ejecutable compiled de Windows y el favicon de la interfaz.
* **Aislamiento de AppData:** Cada nuevo ejecutable compilado genera automáticamente su propia carpeta de configuración física en `%APPDATA%\ark-launcher-[nombre-del-servidor-sanitizado]`, garantizando que sus interruptores de optimización e historial de primer inicio funcionen de forma aislada sin conflictos.

### 📁 Cómo Utilizar el Creador:
> [!IMPORTANT]
> Para que el generador funcione, es **estrictamente necesario** que tanto el script interactivo **`CREAR_NUEVO_LAUNCHER.bat`** como el motor ejecutable independiente **`POXI_ARK_LAUNCHER_MAKER.exe`** se encuentren **en la misma carpeta**. El archivo `.bat` actúa como lanzador optimizado del motor `.exe`.

1. Asegúrate de tener ambos archivos en el directorio raíz.
2. Haz doble clic en **`CREAR_NUEVO_LAUNCHER.bat`** (ejecutará el Maker con la consola configurada en UTF-8 y ocultará advertencias molestas).
3. Responde a las preguntas interactivas en la consola gaming.
4. El Maker se encargará de todo: creará copias de seguridad de configuración, inyectará los datos sanitizados, compilará automáticamente en Rust mediante Tauri, y restaurará el código limpio original.
5. Al finalizar, presiona cualquier tecla para cerrar y se abrirá automáticamente la carpeta **`Distribucion_Launchers/`** con tu nuevo ejecutable portable `.exe` personalizado y optimizado.

---


🦖 *Desarrollado con pasión para la comunidad de ARK. ¡A disfrutar del juego de la forma más rápida y de la manera más optimizada posible!*

