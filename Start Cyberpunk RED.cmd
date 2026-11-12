@echo off
cd /d "%~dp0"
echo Open http://127.0.0.1:8765/avatar-creator.html in your browser.
echo Keep this window open while using the project. Press Ctrl+C to stop.
node scripts/serve.cjs
pause
