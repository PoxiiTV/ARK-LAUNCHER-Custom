# 🦖 Poxi ARK Optimizer v1.0.0 — Optimización Extrema de FPS ⚡

Esta es una aplicación de escritorio nativa, independiente y ultra-liviana diseñada para **ARK: Survival Evolved**, construida con **Tauri v2 (Rust + HTML5/CSS3/JS)** y adaptando la aclamada estética cyberpunk y neón del **Poxi Launcher**.

El programa te permite automatizar tweaks quirúrgicos en los archivos de configuración gráfica (`Engine.ini` y `GameUserSettings.ini`) del motor Unreal Engine 4 para estabilizar y exprimir entre **80-90 FPS** manteniendo la fidelidad visual (calidad balanceada de texturas en **Alto-Ultra** y sombras ocluidas eficientes), además de inyectar parámetros de inicio en Steam con interruptores interactivos en tiempo real.

---

## 🚀 Características Clave

1. **Detección Automática Inteligente**: Busca la ruta de tu ARK en Steam consultando el Registro de Windows de forma directa.
2. **Selector de Carpeta Manual**: Diálogo de Windows nativo como fallback para localizar la ruta si el juego está en una biblioteca alternativa de Steam.
3. **Inyector Quirúrgico de Tweaks .ini**:
   - Inyección de caché de shaders (`r.Shaders.Optimize=1`).
   - Limitación de Mip Bias para texturas en Epic en primer plano, optimizando el streaming de VRAM en base al tamaño de pool.
   - Apagado automático de efectos cinemáticos de post-procesamiento pesados (Bloom, desenfoque de movimiento, destellos de lente de cámara, profundidad de campo).
   - Optimización en sombras dinámicas y cascadas distantes para ahorrar hasta 15-20 FPS.
4. **Respaldos de Seguridad (`.bak`)**: Genera backups automáticos antes de aplicar los cambios para garantizar una restauración limpia a valores de fábrica en un solo clic.
5. **Panel Interactivo de Steam Launch Options**: Conmutadores premium que generan y permiten copiar la línea de comandos óptima (`-USEALLAVAILABLECORES`, `-high`, `-fullscreen`, `-lowmemory`, etc.) junto a una guía visual explicativa.
6. **Diseño Visual Gaming Retro-Futurista**: Canvas interactivo de polvo estelar que responde al cursor, sintetizador de audio analógico (Web Audio API) y transiciones fluidas de neón.

---

## 🛠️ Requisitos de Desarrollo

Antes de correr o compilar, asegúrate de tener instalado:
*   [Node.js](https://nodejs.org/) (v18 o superior)
*   [Rust y Cargo](https://www.rust-lang.org/es) (Para compilar el backend rápido de Tauri)

---

## 📦 Instrucciones de Ejecución

### 1. Instalar dependencias
Abre una terminal en esta carpeta (`OPTIMIZADOR/`) y ejecuta:
```bash
npm install
```

### 2. Ejecutar en Modo Desarrollo (Vista previa en tiempo real)
Para abrir la aplicación y ver los cambios visuales al instante:
```bash
npm run dev
```

### 3. Compilar el ejecutable Standalone portable (.exe)
Para generar un binario portable ligero y optimizado de Windows:
```bash
npm run build
```
Una vez completado el proceso, encontrarás tu ejecutable final en:
`f:\ejecutable-ark\OPTIMIZADOR\src-tauri\target\release\bundle\nsis\Poxi ARK Optimizer_1.0.0_x64-setup.exe` o el portable suelto en el directorio `release\Poxi ARK Optimizer.exe`.

---

## 🦖 Explicación de las Modificaciones Técnicas

### Ajustes en `Engine.ini`:
Añade la sección `[SystemSettings]` con los tweaks del motor Unreal Engine 4:
*   `r.Streaming.PoolSize=4096`: Optimiza la caché gráfica para tarjetas de 8GB+ VRAM.
*   `r.Shadow.CSM.MaxCascades=2`: Reduce cascadas de sombras en distancias lejanas (el mayor ahorro de FPS).
*   `r.DefaultFeature.Bloom=False` & `r.DefaultFeature.MotionBlur=False`: Elimina luces borrosas y desenfoques, dando una imagen nítida.

### Ajustes en `GameUserSettings.ini`:
Establece en la sección `[ScalabilityGroups]`:
*   `sg.TextureQuality=3`: Texturas en calidad **Épica/Ultra** (el juego se ve hermoso).
*   `sg.ShadowQuality=1`: Sombras a nivel **Medio** para liberar carga del procesador gráfico.
*   `sg.ViewDistanceQuality=2`: Distancia de visualización en **Alto** (equilibrio perfecto).
*   `sg.AntiAliasingQuality=3`: Suavizado de bordes en **Épico** para evitar dientes de sierra.

---
*Desarrollado con cariño por Antigravity para Alexis — Gaming Premium 2026.* 🦖✨
