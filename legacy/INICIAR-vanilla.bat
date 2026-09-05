@echo off
title Fenix IA - Servidor
cd /d "%~dp0"
echo.
echo  ============================================
echo    FENIX IA - iniciando servidor...
echo    Abre tu navegador en: http://localhost:3001
echo    Para detenerlo cierra esta ventana.
echo  ============================================
echo.
node server.js
pause