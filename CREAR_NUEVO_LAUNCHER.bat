@echo off
:: Configurar terminal en Windows con codificación UTF-8 para soporte completo de emojis y colores gaming ANSI
chcp 65001 > nul
title Poxi ARK Launcher Maker — Premium Builder 🦖

:: Ocultar advertencias experimentales de Node.js para un acabado 100% nativo y profesional
set NODE_NO_WARNINGS=1

:: Ejecutar el binario compilado independiente de Poxi
POXI_ARK_LAUNCHER_MAKER.exe

:: Si el creador terminó con éxito y existe la carpeta de salida, abrirla en el explorador y pausar
if exist "Distribucion_Launchers" (
    explorer "Distribucion_Launchers"
)

pause
