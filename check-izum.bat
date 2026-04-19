@echo off
setlocal

set PORTS=5173 3000 8000 8001

for %%P in (%PORTS%) do (
  set "FOUND="
  for /f "tokens=5" %%I in ('netstat -ano ^| findstr ":%%P "') do (
    set "FOUND=1"
  )

  call :print_status %%P
)

echo.
echo Frontend:  http://localhost:5173
echo Backend:   http://localhost:3000/health
echo Simulator: http://localhost:8000/simulator/status
echo ML docs:   http://localhost:8001/docs
goto :eof

:print_status
if defined FOUND (
  echo Port %1 is listening.
) else (
  echo Port %1 is not listening.
)
goto :eof
