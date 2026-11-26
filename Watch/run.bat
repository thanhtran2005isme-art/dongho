@echo off
setlocal
title AUREL - Local web server
cd /d "%~dp0"
if not exist "scripts\test-server.cjs" (
    echo [ERROR] Cannot find scripts\test-server.cjs.
    pause
    exit /b 1
)
where node.exe >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo Install Node.js from https://nodejs.org/ and run this file again.
    pause
    exit /b 1
)
set "PORT=5517"
echo ==========================================
echo AUREL - Local web server
echo Admin: http://127.0.0.1:5517/index.html
echo Store: http://127.0.0.1:5517/home.html
echo Press Ctrl+C to stop the server.
echo ==========================================
node "scripts\test-server.cjs"
set "RC=%ERRORLEVEL%"
echo Server stopped. Exit code: %RC%
if not "%RC%"=="0" pause
exit /b %RC%
