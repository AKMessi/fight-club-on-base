@echo off
echo ========================================================
echo  FIGHT CLUB REPAIR SCRIPT (WINDOWS ARM64)
echo ========================================================

echo.
echo [1/5] Killing stuck Node.js processes to release file locks...
taskkill /F /IM node.exe >nul 2>&1

echo.
echo [2/5] Forcefully deleting node_modules (this may take a moment)...
rmdir /s /q node_modules
if exist node_modules (
    echo.
    echo ERROR: Could not delete node_modules. Please RESTART your computer and run this script again.
    pause
    exit /b
)

echo.
echo [3/5] Deleting lockfiles and clearing cache...
del package-lock.json
call npm cache clean --force

echo.
echo [4/5] Installing in SAFE MODE (No C++ Builds)...
:: --no-optional: Skips the crashing bufferutil/utf-8-validate
:: --ignore-scripts: Prevents any other compilation attempts
:: --legacy-peer-deps: Resolves the Wagmi/RainbowKit conflicts
call npm install --no-optional --ignore-scripts --legacy-peer-deps

if %errorlevel% neq 0 (
    echo.
    echo INSTALL FAILED. See errors above.
    pause
    exit /b
)

echo.
echo [5/5] Success! You can now reopen VS Code.
echo.
echo To start the app, run: npm run dev
pause