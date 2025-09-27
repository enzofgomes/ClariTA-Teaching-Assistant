@echo off
echo Stopping any existing development server...

REM Kill any process using port 5000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do (
    echo Killing process %%a
    taskkill /PID %%a /F >nul 2>&1
)

echo Waiting 2 seconds...
timeout /t 2 /nobreak >nul

echo Starting development server...
npm run dev
