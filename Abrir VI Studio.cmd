@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Instale o Node.js LTS em https://nodejs.org e abra novamente.
  pause
  exit /b 1
)
node server.mjs --open
