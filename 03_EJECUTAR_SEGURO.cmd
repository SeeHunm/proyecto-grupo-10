@echo off
cd /d "%~dp0"
if not exist .env copy .env.example .env >nul
echo Iniciando version segura en http://localhost:3001
npm run seguro
pause
