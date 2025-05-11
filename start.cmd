@echo off
echo Wykrywanie systemu operacyjnego...

IF EXIST "C:\Windows\System32" (
    echo Wykryto Windows
    powershell.exe -ExecutionPolicy Bypass -File .\init.ps1
) ELSE (
    echo Wykryto Unix/macOS
    bash ./init.sh
)
