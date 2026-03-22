@echo off
echo ==========================================
echo    PlayHall - Starting Servers
echo ==========================================
echo.

echo Starting Backend on port 4000...
start "Backend" /MIN cmd /k "cd /d %~dp0backend && node src\index.js"

timeout /t 3 /nobreak

echo Starting Frontend on port 3000...
start "Frontend" /MIN cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 5 /nobreak

echo.
echo ==========================================
echo Servers should be running!
echo ==========================================
echo.
echo If windows opened, keep them open.
echo.
echo Go to: http://localhost:3000
echo.
pause