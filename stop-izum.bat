@echo off
setlocal

for %%P in (3000 5173 8000 8001) do (
  for /f "tokens=5" %%I in ('netstat -ano ^| findstr ":%%P "') do (
    taskkill /PID %%I /F >nul 2>nul
  )
)

echo Attempted to stop anything listening on 3000, 5173, 8000, and 8001.

endlocal
