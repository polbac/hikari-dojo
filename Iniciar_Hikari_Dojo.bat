@echo off
chcp 65001 >nul
title Karate Do - Shorin Ryu Shinshukan - Hikari Dojo (3D Web)
echo ============================================================================
echo   Karate Do - Shorin Ryu Shinshukan - Hikari Dojo
echo   Horarios: Martes y Viernes de 21:00 a 22:30 hs (Espacio Betsubara)
echo ============================================================================
echo.
echo Abriendo la experiencia 3D en tu navegador predeterminado...
start "" "%~dp0index.html"
echo.
echo La pagina se ha abierto correctamente.
timeout /t 2 >nul
exit
