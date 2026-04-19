@echo off
setlocal

set ROOT=%~dp0

echo Starting IZUM services...

start "IZUM Backend" /d "%ROOT%backend" cmd /k npm run dev
timeout /t 3 /nobreak > nul
start "IZUM Frontend" /d "%ROOT%frontend" cmd /k npm run dev
timeout /t 2 /nobreak > nul

rem Prefer venv Python if present, otherwise fall back to system python.
set SIM_PY=%ROOT%simulator\venv\Scripts\python.exe
if exist "%SIM_PY%" (
  start "IZUM Simulator" /d "%ROOT%simulator" cmd /k "%SIM_PY%" main.py
) else (
  start "IZUM Simulator" /d "%ROOT%simulator" cmd /k python main.py
)

set ML_PY=%ROOT%ml-service\venv\Scripts\python.exe
if exist "%ML_PY%" (
  start "IZUM ML Service" /d "%ROOT%ml-service" cmd /k "%ML_PY%" main.py
) else (
  start "IZUM ML Service" /d "%ROOT%ml-service" cmd /k python main.py
)

echo.
echo Frontend:  http://localhost:5173
echo Backend:   http://localhost:3000/health
echo Simulator: http://localhost:8000/simulator/status
echo ML docs:   http://localhost:8001/docs
echo.
echo Four terminals were opened. Leave them running during the demo.

endlocal
