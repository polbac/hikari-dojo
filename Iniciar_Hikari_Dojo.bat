@echo off
chcp 65001 >nul
title Karate Do - Shorin Ryu Shinshukan - Hikari Dojo (Dev Server)
cd /d "%~dp0"

echo ============================================================================
echo   Karate Do - Shorin Ryu Shinshukan - Hikari Dojo
echo   Horarios: Martes y Viernes de 21:00 a 22:30 hs (Espacio Betsubara)
echo ============================================================================
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo [!] Node.js no esta instalado. Abriendo index.html directamente...
  start "" "%~dp0index.html"
  timeout /t 3 >nul
  exit /b 0
)

if not exist "node_modules\" (
  echo Instalando dependencias...
  call npm install
  if errorlevel 1 (
    echo [!] Fallo npm install. Abriendo index.html directamente...
    start "" "%~dp0index.html"
    timeout /t 3 >nul
    exit /b 1
  )
)

echo Levantando servidor de desarrollo en http://localhost:5173 ...
call npm run dev
