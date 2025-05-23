@echo off
echo Wykrywanie systemu operacyjnego...

IF EXIST "C:\Windows\System32" (
    echo Wykryto Windows

    REM Sprawdź, czy istnieje katalog public/build
    if not exist "public\build" (
        echo Tworzenie katalogu public\build...
        mkdir "public\build" 2>nul
    )

    REM Uruchomienie skryptu z uprawnieniami
    powershell.exe -Command "& {Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass; .\init.ps1}"
) ELSE (
    echo Wykryto Unix/macOS
    bash ./init.sh
)
