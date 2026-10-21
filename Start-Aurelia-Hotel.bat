@echo off
title Aurelia Hotel & Resort Local Server
echo ========================================================
echo   Starting Aurelia Hotel & Resort Local Server...
echo ========================================================
cd /d "%~dp0"

echo Opening http://localhost:3000 in your browser...
start http://localhost:3000

echo Starting backend and frontend server...
npm run dev
pause
