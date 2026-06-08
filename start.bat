@echo off
title Red Sea Excursions Hub Server
echo ============================================
echo  Red Sea Excursions Hub - Local Server
echo ============================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

node server.js
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Server failed to start. Check for errors above.
    pause
)
