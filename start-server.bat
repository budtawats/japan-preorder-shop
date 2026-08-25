@echo off
title Japan Pre-Order Shop System
color 0C
echo ========================================================
echo   JAPAN PRE-ORDER SHOP SYSTEM - เริ่มการทำงานของระบบ
echo ========================================================
echo.
echo กำลังเปิดระบบที่ http://localhost:3000 ...
echo บัญชีแม่ค้าเริ่มต้น: admin / admin1234
echo.

set "PATH=C:\Program Files\nodejs;%PATH%"

:: Open default browser after 2 seconds
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:3000"

:: Start Next.js server
npm run dev
pause
