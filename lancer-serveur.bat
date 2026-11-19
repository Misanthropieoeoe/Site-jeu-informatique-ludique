@echo off
chcp 65001 >nul
title Clic ^& Avenir - serveur de salle
cd /d "%~dp0"

where py >nul 2>nul
if %errorlevel%==0 (
  py -3 serveur.py %*
  goto fin
)
where python >nul 2>nul
if %errorlevel%==0 (
  python serveur.py %*
  goto fin
)

echo.
echo  Python n'est pas installe sur ce poste.
echo  Installe-le gratuitement depuis https://www.python.org/downloads/
echo  (coche "Add Python to PATH" pendant l'installation), puis relance ce fichier.
echo.

:fin
pause
