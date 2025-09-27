@echo off
echo Stopping development server...

REM Kill any process using port 5000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do (
    echo Killing process %%a
    taskkill /PID %%a /F
)

echo Development server stopped.
