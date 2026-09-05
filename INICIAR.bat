@echo off
title Fenix IA - Servidor
cd /d "%~dp0"
echo.
echo  ============================================
echo    FENIX IA - compilando app React...
echo  ============================================
echo.
cd frontend-next
call npm run build
if errorlevel 1 (
  echo.
  echo  [ERROR] Fallo el build de la app. Revisa los errores de arriba.
  pause
  exit /b 1
)
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