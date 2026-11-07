@echo off
echo Memeriksa Integritas SatuAlbum untuk GitHub Pages...
powershell -ExecutionPolicy Bypass -File "%~dp0build.ps1"
pause
