@echo off
title Deploy to Cloudflare Pages and D1 Database
cls
echo ======================================================================
echo   JAPAN PRE-ORDER SHOP - CLOUDFLARE DEPLOYMENT
echo ======================================================================
echo.

set "PATH=C:\Program Files\nodejs;%PATH%"

echo [1/4] Authenticating with Cloudflare...
echo A browser window will open shortly. Please click "Allow" or "Authorize".
echo.
call npx --yes wrangler login
if %errorlevel% neq 0 (
    echo.
    echo [NOTICE] Login was not completed. Please try running this script again.
    pause
    exit /b %errorlevel%
)

echo.
echo [2/4] Creating Cloudflare D1 Database (japan_preorder_db)...
call npx --yes wrangler d1 create japan_preorder_db
echo.

echo [3/4] Setting up Database Tables and Initial Data...
call npx --yes wrangler d1 execute japan_preorder_db --remote --file=./schema.sql -y
call npx --yes wrangler d1 execute japan_preorder_db --remote --file=./seed.sql -y
echo.

echo [4/4] Building project and Deploying to Cloudflare Pages...
call npx --yes @cloudflare/next-on-pages
call npx --yes wrangler pages deploy .vercel/output/static --project-name=japan-preorder-shop --commit-dirty=true

echo.
echo ======================================================================
echo   SUCCESS! Deployment to Cloudflare completed!
echo ======================================================================
echo You can visit your live website using the link shown above!
echo.
pause
