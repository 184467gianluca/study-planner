@echo off
echo ===================================================
echo   Starte den Study Planner Server...
echo   Bitte dieses schwarze Fenster im Hintergrund 
echo   offen lassen, waehrend du planst!
echo ===================================================
echo.

:: Starte den Next.js Entwicklungsserver
start npm run dev

:: Warte 5 Sekunden, damit der Server hochfahren kann
timeout /t 5 /nobreak > NUL

:: Oeffne die Seite im Standardbrowser (falls du sie nicht als App installiert hast)
start http://localhost:3000
