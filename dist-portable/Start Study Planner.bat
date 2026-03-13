@echo off
title Study Planner Server
echo ===================================================
echo     Starting Local Study Planner Server (Portable)
echo ===================================================
echo.
echo Please leave this window open while using the app.
echo You can safely close it when you are done.
echo.
echo Starting server on port 3000...
set NODE_ENV=production
set PORT=3000
set HOSTNAME=localhost

:: Give the server 3 seconds to boot before launching browser
start "" /B cmd /c "ping localhost -n 3 > nul && start http://localhost:3000"

.\node.exe server.js
pause
