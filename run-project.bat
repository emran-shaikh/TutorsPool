@echo off
echo Starting TutorsPool project...

REM Try to run with existing dependencies first
echo Attempting to run with existing setup...
npx --yes vite --host 2>nul
if %errorlevel% equ 0 goto :success

REM If that fails, try to install minimal dependencies
echo Installing minimal dependencies...
npm install vite @vitejs/plugin-react-swc typescript --no-optional --legacy-peer-deps --silent
if %errorlevel% neq 0 (
    echo Installation failed, trying alternative approach...
    npx --yes vite --host --force
)

:success
echo Project should be running at http://localhost:5173
pause
