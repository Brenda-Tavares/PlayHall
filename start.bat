@echo off
title PlayHall - Quick Start
color 0A

echo.
echo  ==========================================
echo          PlayHall - Starting
echo  ==========================================
echo.

echo [1/4] Checking MongoDB...
echo.
echo IMPORTANT: You need MongoDB running first!
echo.
echo Option A - Local MongoDB:
echo   1. Download from https://www.mongodb.com/try/download/community
echo   2. Install and run: mongod
echo.
echo Option B - MongoDB Atlas (Cloud):
echo   1. Go to https://www.mongodb.com/cloud/atlas
echo   2. Create free cluster
echo   3. Get connection string
echo   4. Edit backend/.env with your MONGODB_URI
echo.
set /p choice="Is MongoDB running? (Y/N): "
if /i "%choice%" neq "Y" goto :end

echo.
echo [2/4] Starting Backend on port 4000...
start "PlayHall Backend" cmd /k "cd /d %~dp0backend && npm run dev"

echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak >nul

echo.
echo [3/4] Starting Frontend on port 3000...
start "PlayHall Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo Waiting 5 seconds for frontend to start...
timeout /t 5 /nobreak >nul

echo.
echo [4/4] Opening browser...
start http://localhost:3000

echo.
echo ==========================================
echo    PlayHall is running!
echo ==========================================
echo.
echo  Frontend: http://localhost:3000
echo  Backend:  http://localhost:4000
echo  API:      http://localhost:4000/api
echo.
echo  Press any key to see this message again...
pause >nul
goto :eof

:end
echo.
echo Please start MongoDB first, then run this script again.
echo.
pause
