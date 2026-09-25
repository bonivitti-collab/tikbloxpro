@echo off
echo ==========================================
echo   TIKBLOX PRO - Gerador do Instalador .EXE
echo ==========================================
echo.
echo 1. Instalando dependencias necessarias...
call npm install --legacy-peer-deps
call npm install --save-dev electron electron-builder --legacy-peer-deps

echo.
echo 2. Compilando interface TIKBLOX...
call npm run build

echo.
echo 3. Gerando o instalador executavel Windows (.exe)...
call npx electron-builder --win nsis:x64

echo.
echo ==========================================
echo Concluido! Seu executavel esta na pasta:
echo   dist-electron\
echo ==========================================
pause
