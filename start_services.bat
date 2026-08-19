@echo off
cd /d "%~dp0"

echo [1/3] Starting Backend Server on port 8000...
start /b "" cmd /c "cd /d "%~dp0backend" && .\venv\Scripts\uvicorn.exe app.main:app --host 127.0.0.1 --port 8000 > "%~dp0backend.log" 2>&1"

echo [2/3] Starting Frontend Server on port 5173...
start /b "" cmd /c "cd /d "%~dp0frontend" && npm run dev > "%~dp0frontend.log" 2>&1"

timeout /t 3 /nobreak >nul

echo [3/3] Starting Cloudflare Edge Tunnel...
start /b "" cmd /c ""%~dp0cloudflared.exe" tunnel --url http://127.0.0.1:5173 > "%~dp0tunnel.log" 2>&1"

echo All services launched!
