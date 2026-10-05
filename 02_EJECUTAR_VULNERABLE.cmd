@echo off
cd /d "%~dp0"
echo Iniciando version vulnerable en http://localhost:3000
npm run vulnerable
pause
