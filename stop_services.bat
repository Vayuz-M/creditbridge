@echo off
echo Stopping CreditBridge services...
taskkill /f /im uvicorn.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im cloudflared.exe >nul 2>&1
echo All CreditBridge background services stopped successfully.
pause
