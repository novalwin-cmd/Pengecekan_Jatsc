@echo off
REM JATSC Inspection System - Start All Services (Windows)
REM Starts both Backend (Flask) and Frontend (Vite) with one command

setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════╗
echo ║   🚀 JATSC Inspection System - Start All Services  ║
echo ╚════════════════════════════════════════════════════╝
echo.

set PROJECT_DIR=%~dp0
cd /d "%PROJECT_DIR%"

REM Colors (using color command)
set GREEN=[92m
set YELLOW=[93m
set BLUE=[94m
set RED=[91m
set NC=[0m

echo.
echo [93m🔴 Cleaning up old processes...[0m
taskkill /F /IM python.exe >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

REM Start Backend
echo.
echo [94m📦 Starting Backend Server...[0m
echo    Location: backend/
echo    Port: 5000
echo.

cd /d "%PROJECT_DIR%backend"

REM Check if venv exists
if not exist "venv" (
    echo [93m⚠️  Virtual environment not found. Creating...[0m
    python -m venv venv
)

REM Activate venv and start backend
call venv\Scripts\activate.bat
start "JATSC Backend" cmd /k python app.py

echo [92m✅ Backend started[0m

REM Wait for backend to be ready
echo [93m⏳ Waiting for backend to be ready (max 30 seconds)...[0m
setlocal enabledelayedexpansion
set "counter=0"
:backend_loop
set /a counter+=1
timeout /t 1 /nobreak >nul
curl -s http://127.0.0.1:5000/api/daily-checks >nul 2>&1
if errorlevel 1 (
    if !counter! lss 30 (
        goto backend_loop
    ) else (
        echo [91m✗ Backend failed to start[0m
        exit /b 1
    )
)
echo [92m✓ Backend is ready![0m

REM Start Frontend
echo.
echo [94m📦 Starting Frontend Server...[0m
echo    Location: frontend/
echo    Port: 5173
echo.

cd /d "%PROJECT_DIR%frontend"

REM Check if node_modules exists
if not exist "node_modules" (
    echo [93m⚠️  Dependencies not installed. Running npm install...[0m
    call npm install
)

start "JATSC Frontend" cmd /k npm run dev

echo [92m✅ Frontend started[0m

REM Wait for frontend to be ready
echo [93m⏳ Waiting for frontend to be ready (max 30 seconds)...[0m
setlocal enabledelayedexpansion
set "counter=0"
:frontend_loop
set /a counter+=1
timeout /t 1 /nobreak >nul
curl -s http://localhost:5173 >nul 2>&1
if errorlevel 1 (
    if !counter! lss 30 (
        goto frontend_loop
    ) else (
        echo [91m✗ Frontend failed to start[0m
        exit /b 1
    )
)
echo [92m✓ Frontend is ready![0m

REM Success message
echo.
echo ╔════════════════════════════════════════════════════╗
echo [92m║   ✅ All Services Started Successfully!            ║[0m
echo ╚════════════════════════════════════════════════════╝
echo.
echo [94m📋 Service Status:[0m
echo    [92m✓[0m Backend API    → http://127.0.0.1:5000
echo    [92m✓[0m Frontend       → http://localhost:5173
echo.
echo [93m🌐 Open browser and go to: http://localhost:5173[0m
echo.
echo [93m🛑 To stop all services: Close the command windows or press Ctrl+C[0m
echo.
echo [94mNote: Backend and Frontend are running in separate windows.[0m
echo [94mLeave them open while using the application.[0m
echo.

pause
